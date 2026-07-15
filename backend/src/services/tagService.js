import { StatusCodes } from 'http-status-codes';

import tagRepository from '../repository/tagRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { ValidationError } from '../utils/errors/validationError.js';

// Normalizes Mongoose validation/cast/duplicate-key errors into the shared custom error types.
const handleTagError = (error) => {
  if (error.name === 'ValidationError') {
    throw new ValidationError({ error: error.errors }, error.message);
  }

  if (error.name === 'CastError') {
    throw new ClientError({
      message: 'Invalid tag id',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Tag id is not a valid identifier']
    });
  }

  const mongoCode = error.code ?? error?.cause?.code;
  if (mongoCode === 11000) {
    const keyVal = error.keyValue ?? error?.cause?.keyValue;
    const field = keyVal ? Object.keys(keyVal)[0] : 'field';
    const message = `A tag with this ${field} already exists`;

    throw new ValidationError({ error: [message] }, message);
  }

  throw error;
};

export const createTagService = async (data) => {
  try {
    const existingTag = await tagRepository.getByName(data.name);
    if (existingTag) {
      throw new ClientError({
        message: 'Tag already exists',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['A tag with this name already exists']
      });
    }

    const tag = await tagRepository.create(data);
    return tag;
  } catch (error) {
    handleTagError(error);
  }
};

export const getAllTagsService = async () => {
  try {
    const tags = await tagRepository.getAll();
    return tags;
  } catch (error) {
    handleTagError(error);
  }
};

export const getTagByIdService = async (id) => {
  try {
    const tag = await tagRepository.getById(id);
    if (!tag) {
      throw new ClientError({
        message: 'Tag not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No tag exists with this id']
      });
    }

    return tag;
  } catch (error) {
    handleTagError(error);
  }
};

export const updateTagService = async (id, data) => {
  try {
    const existingTag = await tagRepository.getById(id);
    if (!existingTag) {
      throw new ClientError({
        message: 'Tag not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No tag exists with this id']
      });
    }

    const updatedTag = await tagRepository.update(id, data);
    return updatedTag;
  } catch (error) {
    handleTagError(error);
  }
};

export const deleteTagService = async (id) => {
  try {
    const existingTag = await tagRepository.getById(id);
    if (!existingTag) {
      throw new ClientError({
        message: 'Tag not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No tag exists with this id']
      });
    }

    await tagRepository.delete(id);
    return;
  } catch (error) {
    handleTagError(error);
  }
};
