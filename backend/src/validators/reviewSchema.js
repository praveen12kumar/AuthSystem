import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

// Plain JSON body (no file upload involved), so numbers arrive as real
// numbers - no z.coerce needed here, unlike the multipart Course/Payment routes.
export const createReviewSchema = z.object({
  course: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional()
});
