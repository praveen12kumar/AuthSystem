import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';

import {
  PLATFORM_COMMISSION_PERCENT,
  RAZORPAY_API_KEY,
  RAZORPAY_API_SECRET
} from '../config/serverConfig.js';
import razorpay from '../libs/razorpayConfig.js';
import courseRepository from '../repository/courseRepository.js';
import paymentRepository from '../repository/paymentRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { ValidationError } from '../utils/errors/validationError.js';

// Normalizes Mongoose validation/cast errors into the shared custom error types.
const handlePaymentError = (error) => {
  if (error.name === 'ValidationError') {
    throw new ValidationError({ error: error.errors }, error.message);
  }

  if (error.name === 'CastError') {
    throw new ClientError({
      message: 'Invalid id',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Course or payment id is not a valid identifier']
    });
  }

  throw error;
};

// Standard Razorpay order-verification signature: HMAC-SHA256 of
// "orderId|paymentId" using the account's key secret. timingSafeEqual
// (rather than ===) avoids leaking signature bytes via comparison timing.
const isSignatureValid = (orderId, paymentId, signature) => {
  const expected = crypto
    .createHmac('sha256', RAZORPAY_API_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const createOrderService = async (courseId, userId) => {
  try {
    const course = await courseRepository.getById(courseId);
    if (!course) {
      throw new ClientError({
        message: 'Course not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No course exists with this id']
      });
    }

    if (String(course.instructor) === userId) {
      throw new ClientError({
        message: 'Cannot purchase your own course',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['Instructors cannot enroll in a course they own']
      });
    }

    const alreadyEnrolled = course.studentsEnrolled?.some(
      (id) => String(id) === userId
    );
    if (alreadyEnrolled) {
      throw new ClientError({
        message: 'Already enrolled',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['You are already enrolled in this course']
      });
    }

    // Amount is always derived from the course's own price/discount, never
    // from the client - a client-supplied amount would let anyone name
    // their own price.
    const finalPrice = course.price - (course.price * (course.discount || 0)) / 100;
    const amountInPaise = Math.round(finalPrice * 100);

    // Razorpay caps `receipt` at 40 chars - a full 24-char ObjectId plus a
    // 13-digit timestamp doesn't fit, so only the id's last 8 chars are used.
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${courseId.slice(-8)}_${Date.now()}`
    });

    await paymentRepository.create({
      user: userId,
      course: courseId,
      amount: finalPrice,
      currency: 'INR',
      status: 'PENDING',
      paymentGateway: 'razorpay',
      gatewayOrderId: order.id
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_API_KEY
    };
  } catch (error) {
    handlePaymentError(error);
  }
};

export const getMyPaymentsService = async (userId) => {
  try {
    return await paymentRepository.getByUser(userId);
  } catch (error) {
    handlePaymentError(error);
  }
};

// Sums each of the instructor's courses' successful payments into a
// per-course and overall earnings summary. Payments recorded before this
// feature existed have no instructorEarning snapshot - treated as 0 rather
// than guessed, since we don't know what commission rate would have applied.
export const getInstructorEarningsService = async (instructorId) => {
  try {
    const courses = await courseRepository.getByInstructor(instructorId);
    const courseIds = courses.map((course) => course._id);

    const payments = courseIds.length
      ? await paymentRepository.getByCourses(courseIds)
      : [];

    const earningsByCourse = new Map(
      courses.map((course) => [
        String(course._id),
        {
          course: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          salesCount: 0,
          totalEarnings: 0
        }
      ])
    );

    let totalEarnings = 0;
    for (const payment of payments) {
      const earning = payment.instructorEarning ?? 0;
      totalEarnings += earning;

      const entry = earningsByCourse.get(String(payment.course));
      if (entry) {
        entry.totalEarnings += earning;
        entry.salesCount += 1;
      }
    }

    return {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalSales: payments.length,
      courses: Array.from(earningsByCourse.values()).map((entry) => ({
        ...entry,
        totalEarnings: Math.round(entry.totalEarnings * 100) / 100
      }))
    };
  } catch (error) {
    handlePaymentError(error);
  }
};

export const verifyPaymentService = async (data, userId) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const payment = await paymentRepository.getByOrderId(razorpay_order_id);
    if (!payment) {
      throw new ClientError({
        message: 'Payment not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No payment exists for this order']
      });
    }

    if (String(payment.user) !== userId) {
      throw new ClientError({
        message: 'This payment does not belong to you',
        statusCode: StatusCodes.FORBIDDEN,
        explanation: ['You can only verify your own payments']
      });
    }

    const valid = isSignatureValid(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!valid) {
      await paymentRepository.update(payment._id, { status: 'FAILED' });
      throw new ClientError({
        message: 'Payment verification failed',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['Signature mismatch - this payment could not be verified']
      });
    }

    const platformFee = Math.round(payment.amount * (PLATFORM_COMMISSION_PERCENT / 100) * 100) / 100;
    const instructorEarning = Math.round((payment.amount - platformFee) * 100) / 100;

    const updatedPayment = await paymentRepository.update(payment._id, {
      status: 'SUCCESS',
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      platformFeePercent: PLATFORM_COMMISSION_PERCENT,
      platformFee,
      instructorEarning
    });

    await courseRepository.addStudent(payment.course, payment.user);

    return updatedPayment;
  } catch (error) {
    handlePaymentError(error);
  }
};
