import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional()
});

export const updateTagSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional()
});
