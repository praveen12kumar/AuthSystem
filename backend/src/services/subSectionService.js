import { StatusCodes } from 'http-status-codes';

import sectionRepository from '../repository/sectionRepository.js';
import subSectionRepository from '../repository/subSectionRepository.js';
import {
  deleteVideoFromCloudinary,
  uploadVideoToCloudinary
} from '../utils/common/videoUpload.js';
import ClientError from '../utils/errors/clientError.js';
import { ValidationError } from '../utils/errors/validationError.js';

// Normalizes Mongoose validation/cast errors into the shared custom error types.
const handleSubSectionError = (error) => {
  if (error.name === 'ValidationError') {
    throw new ValidationError({ error: error.errors }, error.message);
  }

  if (error.name === 'CastError') {
    throw new ClientError({
      message: 'Invalid id',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Section or subsection id is not a valid identifier']
    });
  }

  throw error;
};

// Cleaning up an old/orphaned Cloudinary video is best-effort: it must never
// fail an otherwise-successful update/delete of the lesson itself.
const safeDeleteCloudinaryVideo = async (publicId) => {
  if (!publicId) {
    return;
  }
  try {
    await deleteVideoFromCloudinary(publicId);
  } catch (error) {
    console.log('Failed to delete Cloudinary video (non-fatal):', publicId, error.message);
  }
};

export const createSubSectionService = async (data, videoFile) => {
  try {
    const section = await sectionRepository.getById(data.section);
    if (!section) {
      throw new ClientError({
        message: 'Section not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No section exists with this id']
      });
    }

    const uploadResult = await uploadVideoToCloudinary(
      videoFile,
      'lesson-videos'
    );

    const subSection = await subSectionRepository.create({
      ...data,
      videoUrl: uploadResult.secure_url,
      videoPublicId: uploadResult.public_id,
      duration: uploadResult.duration
    });

    await sectionRepository.addSubSection(data.section, subSection._id);

    return subSection;
  } catch (error) {
    handleSubSectionError(error);
  }
};

export const getSubSectionsBySectionService = async (sectionId) => {
  try {
    if (!sectionId) {
      throw new ClientError({
        message: 'section query parameter is required',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['Pass ?section=<sectionId> to list its lessons']
      });
    }

    const section = await sectionRepository.getById(sectionId);
    if (!section) {
      throw new ClientError({
        message: 'Section not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No section exists with this id']
      });
    }

    const subSections = await subSectionRepository.getBySection(sectionId);
    return subSections;
  } catch (error) {
    handleSubSectionError(error);
  }
};

export const getSubSectionByIdService = async (id) => {
  try {
    const subSection = await subSectionRepository.getById(id);
    if (!subSection) {
      throw new ClientError({
        message: 'Lesson not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No lesson exists with this id']
      });
    }

    return subSection;
  } catch (error) {
    handleSubSectionError(error);
  }
};

export const updateSubSectionService = async (id, data, videoFile) => {
  try {
    const existingSubSection = await subSectionRepository.getById(id);
    if (!existingSubSection) {
      throw new ClientError({
        message: 'Lesson not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No lesson exists with this id']
      });
    }

    const updates = { ...data };
    if (videoFile) {
      const uploadResult = await uploadVideoToCloudinary(
        videoFile,
        'lesson-videos'
      );
      updates.videoUrl = uploadResult.secure_url;
      updates.videoPublicId = uploadResult.public_id;
      updates.duration = uploadResult.duration;
    }

    const updatedSubSection = await subSectionRepository.update(id, updates);

    if (videoFile) {
      await safeDeleteCloudinaryVideo(existingSubSection.videoPublicId);
    }

    return updatedSubSection;
  } catch (error) {
    handleSubSectionError(error);
  }
};

export const deleteSubSectionService = async (id) => {
  try {
    const subSection = await subSectionRepository.getById(id);
    if (!subSection) {
      throw new ClientError({
        message: 'Lesson not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No lesson exists with this id']
      });
    }

    await subSectionRepository.delete(id);
    await sectionRepository.removeSubSection(subSection.section, id);
    await safeDeleteCloudinaryVideo(subSection.videoPublicId);

    return;
  } catch (error) {
    handleSubSectionError(error);
  }
};
