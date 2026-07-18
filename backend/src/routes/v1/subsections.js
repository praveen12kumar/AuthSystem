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

// Unlike Tag/Course/Section, SubSection reads are NOT public - the response
// carries the real, playable videoUrl (the paid content itself), not just
// browsable metadata. Until real enrollment exists, "logged in" is the
// interim gate; tighten to an ownership/enrollment check once that's built.
router.get('/', isAuthenticated, getSubSectionsBySection);

router.get('/:id', isAuthenticated, getSubSectionById);

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
