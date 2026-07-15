import { StatusCodes } from 'http-status-codes';

import {
  createCourseService,
  getAllCoursesService,
  getCourseByIdService
} from '../services/courseService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// create course
export const createCourse = async (req, res) => {
  try {
    const response = await createCourseService(req.body, req.user.id, req.file);
    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(response, 'Course created successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get all courses
export const getAllCourses = async (req, res) => {
  try {
    const response = await getAllCoursesService();
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Courses fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get course by id
export const getCourseById = async (req, res) => {
  try {
    const response = await getCourseByIdService(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Course fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
