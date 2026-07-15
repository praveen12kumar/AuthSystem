import { StatusCodes } from 'http-status-codes';

import {
  createTagService,
  deleteTagService,
  getAllTagsService,
  getTagByIdService,
  updateTagService
} from '../services/tagService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

// create tag
export const createTag = async (req, res) => {
  try {
    const response = await createTagService(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(response, 'Tag created successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get all tags
export const getAllTags = async (req, res) => {
  try {
    const response = await getAllTagsService();
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Tags fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get tag by id
export const getTagById = async (req, res) => {
  try {
    const response = await getTagByIdService(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Tag fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// update tag
export const updateTag = async (req, res) => {
  try {
    const response = await updateTagService(req.params.id, req.body);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Tag updated successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// delete tag
export const deleteTag = async (req, res) => {
  try {
    await deleteTagService(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse({}, 'Tag deleted successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
