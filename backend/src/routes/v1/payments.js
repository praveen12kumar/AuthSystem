import express from 'express';

import {
  createOrder,
  getEarnings,
  getMyPayments,
  verifyPayment
} from '../../controller/paymentController.js';
import { authorize, isAuthenticated } from '../../middlewares/authMiddleware.js';
import {
  createOrderSchema,
  verifyPaymentSchema
} from '../../validators/paymentSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

router.get('/my', isAuthenticated, getMyPayments);

router.get(
  '/earnings',
  isAuthenticated,
  authorize('INSTRUCTOR', 'ADMIN'),
  getEarnings
);

router.post('/orders', isAuthenticated, validate(createOrderSchema), createOrder);

router.post(
  '/verify',
  isAuthenticated,
  validate(verifyPaymentSchema),
  verifyPayment
);

export default router;
