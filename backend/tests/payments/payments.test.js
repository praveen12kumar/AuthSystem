import crypto from 'crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Order creation calls the real Razorpay SDK - faked here so tests never
// create real orders against the live account. Signature verification is
// pure crypto using our own secret key and is exercised for real below,
// no faking needed for that half.
vi.mock('../../src/libs/razorpayConfig.js', () => ({
  default: {
    orders: {
      create: vi.fn()
    }
  }
}));

const app = (await import('../../src/app.js')).default;
const Course = (await import('../../src/schema/courseSchema.js')).default;
const User = (await import('../../src/schema/userSchema.js')).default;
const Payment = (await import('../../src/schema/paymentSchema.js')).default;
const razorpay = (await import('../../src/libs/razorpayConfig.js')).default;
const { createJWT } = await import('../../src/utils/common/authUtils.js');
const { RAZORPAY_API_SECRET } = await import('../../src/config/serverConfig.js');

const uniqueEmail = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

const createUser = async (overrides = {}) =>
  User.create({
    firstName: 'Test',
    lastName: 'User',
    email: uniqueEmail('user'),
    password: 'irrelevant-not-hashed-for-these-tests',
    isVerified: true,
    role: 'STUDENT',
    ...overrides
  });

const createCourse = async (instructor, overrides = {}) =>
  Course.create({
    title: 'Test Course',
    description: 'A course used for payment tests',
    price: 1000,
    discount: 0,
    thumbnail: 'https://example.test/thumb.png',
    instructor: instructor._id,
    tags: [new mongoose.Types.ObjectId()],
    ...overrides
  });

const authHeader = (user) =>
  `Bearer ${createJWT({ id: String(user._id), email: user.email, role: user.role })}`;

// The exact algorithm isSignatureValid recomputes server-side - lets tests
// produce a genuinely valid signature without needing a real Razorpay call.
const realSignature = (orderId, paymentId) =>
  crypto
    .createHmac('sha256', RAZORPAY_API_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

const cleanup = async () => {
  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Payment.deleteMany({})]);
  vi.clearAllMocks();
};

describe('POST /api/v1/payments/orders', () => {
  afterEach(cleanup);

  it('creates an order with a server-computed amount, ignoring any client-supplied amount', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor, { price: 2000, discount: 25 }); // final = 1500

    razorpay.orders.create.mockResolvedValue({
      id: 'order_fake123',
      amount: 150000,
      currency: 'INR'
    });

    const res = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', authHeader(student))
      .send({ course: String(course._id), amount: 1 }); // attempted price tampering - schema has no amount field

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ orderId: 'order_fake123', currency: 'INR' });

    expect(razorpay.orders.create).toHaveBeenCalledTimes(1);
    expect(razorpay.orders.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 150000, currency: 'INR' })
    );

    const payment = await Payment.findOne({ gatewayOrderId: 'order_fake123' });
    expect(payment).not.toBeNull();
    expect(payment.amount).toBe(1500); // the real discounted price, not the client's "1"
    expect(payment.status).toBe('PENDING');
  });

  it("rejects an instructor trying to buy their own course, without ever calling Razorpay", async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const course = await createCourse(instructor);

    const res = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', authHeader(instructor))
      .send({ course: String(course._id) });

    expect(res.status).toBe(400);
    expect(razorpay.orders.create).not.toHaveBeenCalled();
  });

  it('rejects a student who is already enrolled', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor, { studentsEnrolled: [student._id] });

    const res = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', authHeader(student))
      .send({ course: String(course._id) });

    expect(res.status).toBe(400);
    expect(razorpay.orders.create).not.toHaveBeenCalled();
  });

  it('404s for a course that does not exist', async () => {
    const student = await createUser();

    const res = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', authHeader(student))
      .send({ course: new mongoose.Types.ObjectId().toString() });

    expect(res.status).toBe(404);
  });

  it('rejects an unauthenticated request with 401', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const course = await createCourse(instructor);

    const res = await request(app)
      .post('/api/v1/payments/orders')
      .send({ course: String(course._id) });

    expect(res.status).toBe(401);
    expect(razorpay.orders.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/payments/verify', () => {
  afterEach(cleanup);

  const createPendingPayment = async (student, course, amount = 1000) =>
    Payment.create({
      user: student._id,
      course: course._id,
      amount,
      currency: 'INR',
      status: 'PENDING',
      paymentGateway: 'razorpay',
      gatewayOrderId: `order_${Date.now()}_${Math.random().toString(36).slice(2)}`
    });

  it('verifies a valid signature, marks SUCCESS, snapshots the commission split, and enrolls the student', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course, 1000);
    const paymentId = 'pay_fake123';
    const signature = realSignature(payment.gatewayOrderId, paymentId);

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', authHeader(student))
      .send({
        razorpay_order_id: payment.gatewayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUCCESS');
    expect(res.body.data.gatewayPaymentId).toBe(paymentId);
    expect(res.body.data.instructorEarning).toBeGreaterThan(0);
    expect(res.body.data.platformFee + res.body.data.instructorEarning).toBeCloseTo(1000, 5);

    const updatedCourse = await Course.findById(course._id);
    expect(updatedCourse.studentsEnrolled.map(String)).toContain(String(student._id));
  });

  it('rejects a tampered signature, marks the payment FAILED, and does not enroll the student', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course);

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', authHeader(student))
      .send({
        razorpay_order_id: payment.gatewayOrderId,
        razorpay_payment_id: 'pay_fake123',
        razorpay_signature: '0'.repeat(64) // well-formed hex, wrong value
      });

    expect(res.status).toBe(400);

    const updatedPayment = await Payment.findById(payment._id);
    expect(updatedPayment.status).toBe('FAILED');

    const updatedCourse = await Course.findById(course._id);
    expect(updatedCourse.studentsEnrolled).toHaveLength(0);
  });

  it("rejects verifying a payment that belongs to someone else", async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const otherStudent = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course);
    const signature = realSignature(payment.gatewayOrderId, 'pay_fake123');

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', authHeader(otherStudent))
      .send({
        razorpay_order_id: payment.gatewayOrderId,
        razorpay_payment_id: 'pay_fake123',
        razorpay_signature: signature
      });

    expect(res.status).toBe(403);
  });

  it('404s for an unknown order id', async () => {
    const student = await createUser();

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', authHeader(student))
      .send({
        razorpay_order_id: 'order_does_not_exist',
        razorpay_payment_id: 'pay_fake123',
        razorpay_signature: '0'.repeat(64)
      });

    expect(res.status).toBe(404);
  });

  it('is idempotent - verifying the same payment twice enrolls the student exactly once', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course);
    const paymentId = 'pay_fake123';
    const signature = realSignature(payment.gatewayOrderId, paymentId);

    const body = {
      razorpay_order_id: payment.gatewayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    };

    const res1 = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', authHeader(student))
      .send(body);
    const res2 = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', authHeader(student))
      .send(body);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const updatedCourse = await Course.findById(course._id);
    const matches = updatedCourse.studentsEnrolled.filter(
      (studentId) => String(studentId) === String(student._id)
    );
    expect(matches).toHaveLength(1);
  });
});

describe('POST /api/v1/payments/cancel', () => {
  afterEach(cleanup);

  const createPendingPayment = async (student, course, amount = 1000) =>
    Payment.create({
      user: student._id,
      course: course._id,
      amount,
      currency: 'INR',
      status: 'PENDING',
      paymentGateway: 'razorpay',
      gatewayOrderId: `order_${Date.now()}_${Math.random().toString(36).slice(2)}`
    });

  it('marks an abandoned PENDING payment as FAILED', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course);

    const res = await request(app)
      .post('/api/v1/payments/cancel')
      .set('Authorization', authHeader(student))
      .send({ razorpay_order_id: payment.gatewayOrderId });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('FAILED');

    const updatedPayment = await Payment.findById(payment._id);
    expect(updatedPayment.status).toBe('FAILED');
  });

  it('does not overwrite a payment that already succeeded (e.g. a late/duplicate dismiss event)', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course);
    const paymentId = 'pay_fake123';
    const signature = realSignature(payment.gatewayOrderId, paymentId);

    await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', authHeader(student))
      .send({
        razorpay_order_id: payment.gatewayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      });

    const res = await request(app)
      .post('/api/v1/payments/cancel')
      .set('Authorization', authHeader(student))
      .send({ razorpay_order_id: payment.gatewayOrderId });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUCCESS'); // unchanged, not clobbered back to FAILED

    const updatedCourse = await Course.findById(course._id);
    expect(updatedCourse.studentsEnrolled.map(String)).toContain(String(student._id));
  });

  it("rejects cancelling a payment that belongs to someone else", async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const otherStudent = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course);

    const res = await request(app)
      .post('/api/v1/payments/cancel')
      .set('Authorization', authHeader(otherStudent))
      .send({ razorpay_order_id: payment.gatewayOrderId });

    expect(res.status).toBe(403);

    const updatedPayment = await Payment.findById(payment._id);
    expect(updatedPayment.status).toBe('PENDING'); // untouched
  });

  it('404s for an unknown order id', async () => {
    const student = await createUser();

    const res = await request(app)
      .post('/api/v1/payments/cancel')
      .set('Authorization', authHeader(student))
      .send({ razorpay_order_id: 'order_does_not_exist' });

    expect(res.status).toBe(404);
  });

  it('rejects an unauthenticated request with 401', async () => {
    const instructor = await createUser({ role: 'INSTRUCTOR' });
    const student = await createUser();
    const course = await createCourse(instructor);
    const payment = await createPendingPayment(student, course);

    const res = await request(app)
      .post('/api/v1/payments/cancel')
      .send({ razorpay_order_id: payment.gatewayOrderId });

    expect(res.status).toBe(401);
  });
});
