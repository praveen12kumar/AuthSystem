import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course id');

// amount is intentionally absent - it's always computed server-side from the
// course's own price/discount, never accepted from the client (a client-
// supplied amount would let anyone pay whatever they want for a course).
export const createOrderSchema = z.object({
  course: objectIdSchema
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export const cancelPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1)
});
