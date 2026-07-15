import { StatusCodes } from 'http-status-codes';

import courseRepository from '../repository/courseRepository.js';
import sectionRepository from '../repository/sectionRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { ValidationError } from '../utils/errors/validationError.js';

// Normalizes Mongoose validation/cast errors into the shared custom error types.
const handleSectionError = (error) => {
  if (error.name === 'ValidationError') {
    throw new ValidationError({ error: error.errors }, error.message);
  }

  if (error.name === 'CastError') {
    throw new ClientError({
      message: 'Invalid id',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Section or course id is not a valid identifier']
    });
  }

  throw error;
};

export const createSectionService = async (data) => {
  try {
    const section = await sectionRepository.create(data);
    await courseRepository.addSection(data.course, section._id);

    return section;
  } catch (error) {
    handleSectionError(error);
  }
};

export const getSectionsByCourseService = async (courseId) => {
  try {
    if (!courseId) {
      throw new ClientError({
        message: 'course query parameter is required',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['Pass ?course=<courseId> to list its sections']
      });
    }

    const course = await courseRepository.getById(courseId);
    if (!course) {
      throw new ClientError({
        message: 'Course not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No course exists with this id']
      });
    }

    const sections = await sectionRepository.getByCourse(courseId);
    return sections;
  } catch (error) {
    handleSectionError(error);
  }
};

export const getSectionByIdService = async (id) => {
  try {
    const section = await sectionRepository.getById(id);
    if (!section) {
      throw new ClientError({
        message: 'Section not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No section exists with this id']
      });
    }

    return section;
  } catch (error) {
    handleSectionError(error);
  }
};

export const updateSectionService = async (id, data) => {
  try {
    const section = await sectionRepository.getById(id);
    if (!section) {
      throw new ClientError({
        message: 'Section not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No section exists with this id']
      });
    }

    const updatedSection = await sectionRepository.update(id, data);
    return updatedSection;
  } catch (error) {
    handleSectionError(error);
  }
};

export const deleteSectionService = async (id) => {
  try {
    const section = await sectionRepository.getById(id);
    if (!section) {
      throw new ClientError({
        message: 'Section not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No section exists with this id']
      });
    }

    await sectionRepository.delete(id);
    await courseRepository.removeSection(section.course, id);

    return;
  } catch (error) {
    handleSectionError(error);
  }
};
