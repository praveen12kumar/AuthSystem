import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const markCompleteSchema = z.object({
  course: objectIdSchema,
  subSection: objectIdSchema
});
