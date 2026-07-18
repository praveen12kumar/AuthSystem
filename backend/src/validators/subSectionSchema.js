import { z } from 'zod';

export const createSubSectionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  section: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section id')
});

// section is intentionally absent - a lesson can't be moved to a different
// section in this scope, and the video (if any) is optional here since
// req.file carries a replacement rather than a body field.
export const updateSubSectionSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional()
});
