import express from 'express';

import {
  createTag,
  deleteTag,
  getAllTags,
  getTagById,
  updateTag
} from '../../controller/tagController.js';
import { authorize, isAuthenticated } from '../../middlewares/authMiddleware.js';
import { createTagSchema, updateTagSchema } from '../../validators/tagSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

router.get('/', getAllTags);

router.get('/:id', getTagById);

router.post(
  '/',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  validate(createTagSchema),
  createTag
);

router.put(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  validate(updateTagSchema),
  updateTag
);

router.delete(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  deleteTag
);

export default router;
