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
  isEnrolledOrOwnerOrAdmin,
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
// browsable metadata. Gated to the enrolled student, the owning instructor,
// or an admin (see isEnrolledOrOwnerOrAdmin).
router.get('/', isAuthenticated, isEnrolledOrOwnerOrAdmin, getSubSectionsBySection);

router.get('/:id', isAuthenticated, isEnrolledOrOwnerOrAdmin, getSubSectionById);

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
