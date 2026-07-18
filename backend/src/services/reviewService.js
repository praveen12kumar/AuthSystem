import { StatusCodes } from 'http-status-codes';

import courseRepository from '../repository/courseRepository.js';
import reviewRepository from '../repository/reviewRepository.js';
import userRepository from '../repository/userRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { ValidationError } from '../utils/errors/validationError.js';

const handleReviewError = (error) => {
  if (error.name === 'ValidationError') {
    throw new ValidationError({ error: error.errors }, error.message);
  }

  if (error.name === 'CastError') {
    throw new ClientError({
      message: 'Invalid id',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Course or review id is not a valid identifier']
    });
  }

  const mongoCode = error.code ?? error?.cause?.code;
  if (mongoCode === 11000) {
    throw new ClientError({
      message: 'You have already reviewed this course',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Use update instead of posting a second review for the same course']
    });
  }

  throw error;
};

// Recomputes and persists Course.averageRating/numberOfRatings from the
// course's current reviews - simple in-JS average (not an aggregation
// pipeline), matching this codebase's existing "fetch and sum" style
// (courseProgressService does the same for lesson-completion percentages).
const recomputeCourseRatingStats = async (courseId) => {
  const reviews = await reviewRepository.getByCourse(courseId);
  const numberOfRatings = reviews.length;
  const averageRating = numberOfRatings
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / numberOfRatings) * 10) / 10
    : 0;
  await courseRepository.updateRatingStats(courseId, averageRating, numberOfRatings);
};

export const getReviewsByCourseService = async (courseId) => {
  try {
    if (!courseId) {
      throw new ClientError({
        message: 'course query parameter is required',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['Pass ?course=<courseId> to list its reviews']
      });
    }
    return await reviewRepository.getByCourse(courseId);
  } catch (error) {
    handleReviewError(error);
  }
};

export const createReviewService = async (data, userId, userRole) => {
  try {
    const course = await courseRepository.getById(data.course);
    if (!course) {
      throw new ClientError({
        message: 'Course not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No course exists with this id']
      });
    }

    if (String(course.instructor) === userId) {
      throw new ClientError({
        message: 'Cannot review your own course',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['Instructors cannot review a course they teach']
      });
    }

    const isEnrolled = course.studentsEnrolled?.some((id) => String(id) === userId);
    if (!isEnrolled && userRole !== 'ADMIN') {
      throw new ClientError({
        message: 'Enrollment required',
        statusCode: StatusCodes.FORBIDDEN,
        explanation: ['You must be enrolled in this course to review it']
      });
    }

    const reviewer = await userRepository.getById(userId);

    const review = await reviewRepository.create({
      ...data,
      user: userId,
      reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
      reviewerAvatar: reviewer.avatar
    });

    await courseRepository.addReview(data.course, review._id);
    await recomputeCourseRatingStats(data.course);

    return review;
  } catch (error) {
    handleReviewError(error);
  }
};

export const updateReviewService = async (reviewId, data) => {
  try {
    const updatedReview = await reviewRepository.update(reviewId, data);
    if (!updatedReview) {
      throw new ClientError({
        message: 'Review not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No review exists with this id']
      });
    }

    await recomputeCourseRatingStats(updatedReview.course);

    return updatedReview;
  } catch (error) {
    handleReviewError(error);
  }
};

export const deleteReviewService = async (reviewId) => {
  try {
    const review = await reviewRepository.getById(reviewId);
    if (!review) {
      throw new ClientError({
        message: 'Review not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No review exists with this id']
      });
    }

    await reviewRepository.delete(reviewId);
    await courseRepository.removeReview(review.course, reviewId);
    await recomputeCourseRatingStats(review.course);

    return;
  } catch (error) {
    handleReviewError(error);
  }
};
