import express from 'express';

import {
  createSection,
  deleteSection,
  getSectionById,
  getSectionsByCourse,
  updateSection
} from '../../controller/sectionController.js';
import {
  authorize,
  isAuthenticated,
  isCourseOwnerOrAdmin,
  isSectionOwnerOrAdmin
} from '../../middlewares/authMiddleware.js';
import {
  createSectionSchema,
  updateSectionSchema
} from '../../validators/sectionSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

router.get('/', getSectionsByCourse);

router.get('/:id', getSectionById);

router.post(
  '/',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  validate(createSectionSchema),
  isCourseOwnerOrAdmin,
  createSection
);

router.put(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  validate(updateSectionSchema),
  isSectionOwnerOrAdmin,
  updateSection
);

router.delete(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  isSectionOwnerOrAdmin,
  deleteSection
);

export default router;
