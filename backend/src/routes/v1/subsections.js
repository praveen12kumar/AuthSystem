import express from 'express';

import {
  createSubSection,
  getSubSectionById,
  getSubSectionsBySection
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
import { createSubSectionSchema } from '../../validators/subSectionSchema.js';
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

export default router;
