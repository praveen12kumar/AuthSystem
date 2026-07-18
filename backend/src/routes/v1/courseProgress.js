import express from 'express';

import {
  getCourseProgress,
  markLessonComplete
} from '../../controller/courseProgressController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { markCompleteSchema } from '../../validators/courseProgressSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

router.get('/', isAuthenticated, getCourseProgress);

router.post(
  '/complete',
  isAuthenticated,
  validate(markCompleteSchema),
  markLessonComplete
);

export default router;
