import { StatusCodes } from 'http-status-codes';

import courseRepository from '../repository/courseRepository.js';
import tagRepository from '../repository/tagRepository.js';
import userRepository from '../repository/userRepository.js';
import { uploadImageToCloudinary } from '../utils/common/imageUpload.js';
import ClientError from '../utils/errors/clientError.js';
import { ValidationError } from '../utils/errors/validationError.js';

// Normalizes Mongoose validation/cast errors into the shared custom error types.
const handleCourseError = (error) => {
  if (error.name === 'ValidationError') {
    throw new ValidationError({ error: error.errors }, error.message);
  }

  if (error.name === 'CastError') {
    throw new ClientError({
      message: 'Invalid course id',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Course id is not a valid identifier']
    });
  }

  throw error;
};

export const createCourseService = async (data, instructorId, thumbnailFile) => {
  try {
    const existingTags = await tagRepository.findByIds(data.tags);
    if (existingTags.length !== data.tags.length) {
      const foundIds = existingTags.map((tag) => String(tag._id));
      const missingIds = data.tags.filter((id) => !foundIds.includes(id));

      throw new ClientError({
        message: 'One or more tags do not exist',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: [`Unknown tag id(s): ${missingIds.join(', ')}`]
      });
    }

    const uploadResult = await uploadImageToCloudinary(
      thumbnailFile,
      'course-thumbnails'
    );

    const course = await courseRepository.create({
      ...data,
      instructor: instructorId,
      thumbnail: uploadResult.secure_url
    });

    await userRepository.addCourse(instructorId, course._id);

    return course;
  } catch (error) {
    handleCourseError(error);
  }
};

export const getAllCoursesService = async () => {
  try {
    const courses = await courseRepository.getAll();
    return courses;
  } catch (error) {
    handleCourseError(error);
  }
};

export const getCourseByIdService = async (id) => {
  try {
    const course = await courseRepository.getById(id);
    if (!course) {
      throw new ClientError({
        message: 'Course not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No course exists with this id']
      });
    }

    return course;
  } catch (error) {
    handleCourseError(error);
  }
};
