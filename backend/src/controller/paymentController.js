import { StatusCodes } from 'http-status-codes';

import {
  createOrderService,
  getMyPaymentsService,
  verifyPaymentService
} from '../services/paymentService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// create a Razorpay order for a course purchase
export const createOrder = async (req, res) => {
  try {
    const response = await createOrderService(req.body.course, req.user.id);
    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(response, 'Order created successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// list the current user's own successful purchases
export const getMyPayments = async (req, res) => {
  try {
    const response = await getMyPaymentsService(req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Purchases fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// verify a completed Razorpay payment and enroll the student
export const verifyPayment = async (req, res) => {
  try {
    const response = await verifyPaymentService(req.body, req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Payment verified successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
