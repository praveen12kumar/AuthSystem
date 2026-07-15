import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid tag id');

// multipart/form-data fields all arrive as strings - price/discount need
// coercion, and tags is sent as a JSON-encoded array string (e.g. '["id1","id2"]')
// since HTML form fields can't natively carry arrays.
const tagsFromFormField = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}, z.array(objectIdSchema).min(1, 'At least one tag is required'));

export const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100).optional(),
  tags: tagsFromFormField
});
