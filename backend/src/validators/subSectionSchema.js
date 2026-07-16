import { z } from 'zod';

export const createSubSectionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  section: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section id')
});
