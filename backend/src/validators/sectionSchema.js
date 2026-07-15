import { z } from 'zod';

export const createSectionSchema = z.object({
  title: z.string().min(3).max(100),
  course: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course id')
});

export const updateSectionSchema = z.object({
  title: z.string().min(3).max(100).optional()
});
