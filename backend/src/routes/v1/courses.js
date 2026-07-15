import express from 'express';

import {
  createCourse,
  getAllCourses,
  getCourseById
} from '../../controller/courseController.js';
import { authorize, isAuthenticated } from '../../middlewares/authMiddleware.js';
import { requireFile, uploadSingle } from '../../middlewares/uploadMiddleware.js';
import { createCourseSchema } from '../../validators/courseSchema.js';
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

export default router;
