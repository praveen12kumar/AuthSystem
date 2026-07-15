import { StatusCodes } from 'http-status-codes';

import {
  createSectionService,
  deleteSectionService,
  getSectionByIdService,
  getSectionsByCourseService,
  updateSectionService
} from '../services/sectionService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// create section
export const createSection = async (req, res) => {
  try {
    const response = await createSectionService(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(response, 'Section created successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get sections by course
export const getSectionsByCourse = async (req, res) => {
  try {
    const response = await getSectionsByCourseService(req.query.course);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Sections fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get section by id
export const getSectionById = async (req, res) => {
  try {
    const response = await getSectionByIdService(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Section fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// update section
export const updateSection = async (req, res) => {
  try {
    const response = await updateSectionService(req.params.id, req.body);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Section updated successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// delete section
export const deleteSection = async (req, res) => {
  try {
    await deleteSectionService(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse({}, 'Section deleted successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
