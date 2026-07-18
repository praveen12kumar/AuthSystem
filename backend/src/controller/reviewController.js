import { StatusCodes } from 'http-status-codes';

import {
  createReviewService,
  deleteReviewService,
  getReviewsByCourseService,
  updateReviewService
} from '../services/reviewService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// get reviews for a course (public)
export const getReviewsByCourse = async (req, res) => {
  try {
    const response = await getReviewsByCourseService(req.query.course);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Reviews fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// create a review for a course
export const createReview = async (req, res) => {
  try {
    const response = await createReviewService(req.body, req.user.id, req.user.role);
    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(response, 'Review posted successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// update my own review
export const updateReview = async (req, res) => {
  try {
    const response = await updateReviewService(req.params.id, req.body);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Review updated successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// delete my own review
export const deleteReview = async (req, res) => {
  try {
    await deleteReviewService(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse({}, 'Review deleted successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
