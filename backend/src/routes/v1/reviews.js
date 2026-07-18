import express from 'express';

import {
  createReview,
  deleteReview,
  getReviewsByCourse,
  updateReview
} from '../../controller/reviewController.js';
import { isAuthenticated, isReviewOwnerOrAdmin } from '../../middlewares/authMiddleware.js';
import { createReviewSchema, updateReviewSchema } from '../../validators/reviewSchema.js';
import { validate } from '../../validators/zodValidators.js';

const router = express.Router();

router.get('/', getReviewsByCourse);

router.post('/', isAuthenticated, validate(createReviewSchema), createReview);

router.put(
  '/:id',
  isAuthenticated,
  isReviewOwnerOrAdmin,
  validate(updateReviewSchema),
  updateReview
);

router.delete('/:id', isAuthenticated, isReviewOwnerOrAdmin, deleteReview);

export default router;
