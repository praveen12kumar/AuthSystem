import { StatusCodes } from 'http-status-codes';

import courseRepository from '../repository/courseRepository.js';
import sectionRepository from '../repository/sectionRepository.js';
import tagRepository from '../repository/tagRepository.js';
import userRepository from '../repository/userRepository.js';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary
} from '../utils/common/imageUpload.js';
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

const verifyTagsExist = async (tagIds) => {
  const existingTags = await tagRepository.findByIds(tagIds);
  if (existingTags.length !== tagIds.length) {
    const foundIds = existingTags.map((tag) => String(tag._id));
    const missingIds = tagIds.filter((id) => !foundIds.includes(id));

    throw new ClientError({
      message: 'One or more tags do not exist',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: [`Unknown tag id(s): ${missingIds.join(', ')}`]
    });
  }
};

// Cleaning up an old/orphaned Cloudinary image is best-effort: it must never
// fail an otherwise-successful create/update/delete of the course itself.
const safeDeleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }
  try {
    await deleteImageFromCloudinary(publicId);
  } catch (error) {
    console.log('Failed to delete Cloudinary image (non-fatal):', publicId, error.message);
  }
};

export const createCourseService = async (data, instructorId, thumbnailFile) => {
  try {
    await verifyTagsExist(data.tags);

    const uploadResult = await uploadImageToCloudinary(
      thumbnailFile,
      'course-thumbnails'
    );

    const course = await courseRepository.create({
      ...data,
      instructor: instructorId,
      thumbnail: uploadResult.secure_url,
      thumbnailPublicId: uploadResult.public_id
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

export const updateCourseService = async (id, data, thumbnailFile) => {
  try {
    const existingCourse = await courseRepository.getById(id);
    if (!existingCourse) {
      throw new ClientError({
        message: 'Course not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No course exists with this id']
      });
    }

    if (data.tags) {
      await verifyTagsExist(data.tags);
    }

    const updates = { ...data };
    if (thumbnailFile) {
      const uploadResult = await uploadImageToCloudinary(
        thumbnailFile,
        'course-thumbnails'
      );
      updates.thumbnail = uploadResult.secure_url;
      updates.thumbnailPublicId = uploadResult.public_id;
    }

    const updatedCourse = await courseRepository.update(id, updates);

    if (thumbnailFile) {
      await safeDeleteCloudinaryImage(existingCourse.thumbnailPublicId);
    }

    return updatedCourse;
  } catch (error) {
    handleCourseError(error);
  }
};

export const deleteCourseService = async (id) => {
  try {
    const course = await courseRepository.getById(id);
    if (!course) {
      throw new ClientError({
        message: 'Course not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No course exists with this id']
      });
    }

    await sectionRepository.deleteByCourse(id);
    await courseRepository.delete(id);
    await userRepository.removeCourse(course.instructor, id);
    await safeDeleteCloudinaryImage(course.thumbnailPublicId);

    return;
  } catch (error) {
    handleCourseError(error);
  }
};
