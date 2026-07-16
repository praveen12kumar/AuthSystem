import { StatusCodes } from 'http-status-codes';

import {
  createSubSectionService,
  getSubSectionByIdService,
  getSubSectionsBySectionService
} from '../services/subSectionService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// create lesson (subsection)
export const createSubSection = async (req, res) => {
  try {
    const response = await createSubSectionService(req.body, req.file);
    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(response, 'Lesson created successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get lessons by section
export const getSubSectionsBySection = async (req, res) => {
  try {
    const response = await getSubSectionsBySectionService(req.query.section);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Lessons fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get lesson by id
export const getSubSectionById = async (req, res) => {
  try {
    const response = await getSubSectionByIdService(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Lesson fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
