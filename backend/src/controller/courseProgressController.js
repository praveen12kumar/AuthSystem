import { StatusCodes } from 'http-status-codes';

import {
  getCourseProgressService,
  markLessonCompleteService
} from '../services/courseProgressService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// get the current user's progress summary for a course
export const getCourseProgress = async (req, res) => {
  try {
    const response = await getCourseProgressService(
      req.query.course,
      req.user.id,
      req.user.role
    );
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Progress fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// mark a lesson complete for the current user
export const markLessonComplete = async (req, res) => {
  try {
    const response = await markLessonCompleteService(
      req.body.course,
      req.body.subSection,
      req.user.id,
      req.user.role
    );
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Lesson marked complete'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
