import express from 'express';

import {
  createSubSection,
  deleteSubSection,
  getSubSectionById,
  getSubSectionsBySection,
  updateSubSection
} from '../../controller/subSectionController.js';
import {
  authorize,
  isAuthenticated,
  isSubSectionOwnerOrAdmin
} from '../../middlewares/authMiddleware.js';
import {
  requireFile,
  uploadVideoSingle
} from '../../middlewares/uploadMiddleware.js';
import {
  createSubSectionSchema,
  updateSubSectionSchema
} from '../../validators/subSectionSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

router.get('/', getSubSectionsBySection);

router.get('/:id', getSubSectionById);

router.post(
  '/',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  uploadVideoSingle('video'),
  requireFile('video'),
  validate(createSubSectionSchema),
  isSubSectionOwnerOrAdmin,
  createSubSection
);

router.put(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  uploadVideoSingle('video'),
  validate(updateSubSectionSchema),
  isSubSectionOwnerOrAdmin,
  updateSubSection
);

router.delete(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  isSubSectionOwnerOrAdmin,
  deleteSubSection
);

export default router;
