import express from 'express';

import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse
} from '../../controller/courseController.js';
import {
  authorize,
  isAuthenticated,
  isCourseOwnerOrAdmin
} from '../../middlewares/authMiddleware.js';
import { requireFile, uploadSingle } from '../../middlewares/uploadMiddleware.js';
import {
  createCourseSchema,
  updateCourseSchema
} from '../../validators/courseSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

router.get('/', getAllCourses);

router.get('/:id', getCourseById);

router.post(
  '/',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  uploadSingle('thumbnail'),
  requireFile('thumbnail'),
  validate(createCourseSchema),
  createCourse
);

router.put(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  isCourseOwnerOrAdmin,
  uploadSingle('thumbnail'),
  validate(updateCourseSchema),
  updateCourse
);

router.delete(
  '/:id',
  isAuthenticated,
  authorize('ADMIN', 'INSTRUCTOR'),
  isCourseOwnerOrAdmin,
  deleteCourse
);

export default router;
