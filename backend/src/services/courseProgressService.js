import { StatusCodes } from 'http-status-codes';

import courseProgressRepository from '../repository/courseProgressRepository.js';
import courseRepository from '../repository/courseRepository.js';
import sectionRepository from '../repository/sectionRepository.js';
import subSectionRepository from '../repository/subSectionRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { ValidationError } from '../utils/errors/validationError.js';

const handleProgressError = (error) => {
  if (error.name === 'ValidationError') {
    throw new ValidationError({ error: error.errors }, error.message);
  }

  if (error.name === 'CastError') {
    throw new ClientError({
      message: 'Invalid id',
      statusCode: StatusCodes.BAD_REQUEST,
      explanation: ['Course or lesson id is not a valid identifier']
    });
  }

  throw error;
};

// Same eligibility rule as SubSection reads (isEnrolledOrOwnerOrAdmin): only
// an enrolled student, the owning instructor, or an admin has any business
// tracking/seeing progress on a course.
const assertCanAccessProgress = (course, userId, userRole) => {
  const isOwner = String(course.instructor) === userId;
  const isAdmin = userRole === 'ADMIN';
  const isEnrolled = Boolean(
    course.studentsEnrolled?.some((id) => String(id) === userId)
  );

  if (!isOwner && !isAdmin && !isEnrolled) {
    throw new ClientError({
      message: 'Enrollment required',
      statusCode: StatusCodes.FORBIDDEN,
      explanation: ['You must be enrolled in this course to view its progress']
    });
  }
};

const buildProgressSummary = (sections, progress) => {
  const totalLessons = sections.reduce(
    (sum, section) => sum + (section.subSections?.length || 0),
    0
  );
  const completedSubSections = (progress?.completedSubSections || []).map(String);
  const completedCount = completedSubSections.length;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return { completedSubSections, totalLessons, completedCount, percent };
};

export const getCourseProgressService = async (courseId, userId, userRole) => {
  try {
    if (!courseId) {
      throw new ClientError({
        message: 'course query parameter is required',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['Pass ?course=<courseId> to fetch its progress']
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

    assertCanAccessProgress(course, userId, userRole);

    const [sections, progress] = await Promise.all([
      sectionRepository.getByCourse(courseId),
      courseProgressRepository.getByUserAndCourse(userId, courseId)
    ]);

    return buildProgressSummary(sections, progress);
  } catch (error) {
    handleProgressError(error);
  }
};

export const markLessonCompleteService = async (courseId, subSectionId, userId, userRole) => {
  try {
    const course = await courseRepository.getById(courseId);
    if (!course) {
      throw new ClientError({
        message: 'Course not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No course exists with this id']
      });
    }

    assertCanAccessProgress(course, userId, userRole);

    const subSection = await subSectionRepository.getById(subSectionId);
    if (!subSection) {
      throw new ClientError({
        message: 'Lesson not found',
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ['No lesson exists with this id']
      });
    }

    const section = await sectionRepository.getById(subSection.section);
    if (!section || String(section.course) !== courseId) {
      throw new ClientError({
        message: 'Lesson does not belong to this course',
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ['The lesson id does not belong to the given course id']
      });
    }

    await courseProgressRepository.markComplete(userId, courseId, subSectionId);

    const sections = await sectionRepository.getByCourse(courseId);
    const progress = await courseProgressRepository.getByUserAndCourse(userId, courseId);
    return buildProgressSummary(sections, progress);
  } catch (error) {
    handleProgressError(error);
  }
};
