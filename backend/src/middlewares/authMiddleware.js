import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/serverConfig.js';
import courseRepository from '../repository/courseRepository.js';
import sectionRepository from '../repository/sectionRepository.js';
import subSectionRepository from '../repository/subSectionRepository.js';
import userRepository from '../repository/userRepository.js';
import {
  customErrorResponse,
  internalErrorResponse
} from '../utils/common/responseObject.js';

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1) Read token (prefer Authorization: Bearer <token>)
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;
    const headerToken = req.headers['x-access-token']; // optional fallback
    const token = bearerToken || headerToken;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: 'Missing authentication token',
          message: 'No token provided'
        })
      );
    }

    // 2) Verify token (throws on error)
    const decoded = jwt.verify(token, JWT_SECRET); // { id, iat, exp, ... }

    // 3) Load user (ensure still valid/exists)
    const user = await userRepository.getById(decoded.id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: 'User no longer exists or is disabled',
          message: 'Invalid token'
        })
      );
    }

    // 4) Attach minimal info to request
    req.user = { id: String(user.id), role: user?.role }; // adapt fields as needed
    return next();
  } catch (error) {
    console.log('Auth middleware error:', error);

    // JWT-specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: 'Your session token has expired',
          message: 'Token expired'
        })
      );
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation:
            'Token could not be verified (malformed/invalid signature)',
          message: 'Invalid token'
        })
      );
    }
    if (error.name === 'NotBeforeError') {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: 'Token not active yet',
          message: 'Token not active'
        })
      );
    }

    // Fallback
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Must run after isAuthenticated - relies on req.user.role being set.
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json(
        customErrorResponse({
          explanation: `Requires one of the following roles: ${allowedRoles.join(', ')}`,
          message: 'You do not have permission to perform this action'
        })
      );
    }
    return next();
  };
};

// Must run after isAuthenticated. Resolves the course either from
// req.body.course (Section create - must also run after validate(), since that's
// where the id gets shape-confirmed) or req.params.id (Course update/delete -
// the id is the course itself, no body validation needed first). ADMIN bypasses
// the ownership check.
export const isCourseOwnerOrAdmin = async (req, res, next) => {
  try {
    // req.body can be undefined here: Express's body-parsers only populate it
    // for JSON/urlencoded content types, and a pure multipart request with no
    // text fields never gets to multer (which runs after this middleware for
    // Course update) at all.
    const courseId = req.body?.course || req.params.id;
    const course = await courseRepository.getById(courseId);
    if (!course) {
      return res.status(StatusCodes.NOT_FOUND).json(
        customErrorResponse({
          explanation: 'No course exists with this id',
          message: 'Course not found'
        })
      );
    }

    const isOwner = String(course.instructor) === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json(
        customErrorResponse({
          explanation:
            "Only this course's instructor or an admin can perform this action",
          message: 'You do not have permission to perform this action'
        })
      );
    }

    return next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          explanation: 'Course id is not a valid identifier',
          message: 'Invalid course id'
        })
      );
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Must run after isAuthenticated (+ validate() for create, since it reads
// req.body.section). Resolves the section either from req.body.section
// (SubSection create) or by looking up the subsection via req.params.id
// (SubSection update/delete - no section id in those requests), then walks
// up to that section's course. ADMIN bypasses the ownership check.
export const isSubSectionOwnerOrAdmin = async (req, res, next) => {
  try {
    let sectionId = req.body?.section;
    if (!sectionId) {
      const subSection = await subSectionRepository.getById(req.params.id);
      if (!subSection) {
        return res.status(StatusCodes.NOT_FOUND).json(
          customErrorResponse({
            explanation: 'No lesson exists with this id',
            message: 'Lesson not found'
          })
        );
      }
      sectionId = subSection.section;
    }

    const section = await sectionRepository.getById(sectionId);
    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).json(
        customErrorResponse({
          explanation: 'No section exists with this id',
          message: 'Section not found'
        })
      );
    }

    const course = await courseRepository.getById(section.course);
    const isOwner = course && String(course.instructor) === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json(
        customErrorResponse({
          explanation:
            "Only this section's course instructor or an admin can perform this action",
          message: 'You do not have permission to perform this action'
        })
      );
    }

    return next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          explanation: 'Section or lesson id is not a valid identifier',
          message: 'Invalid id'
        })
      );
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Must run after isAuthenticated. Gates SubSection reads: the response
// carries the real, playable videoUrl (paid content), so only the enrolled
// student, the owning instructor, or an admin may view it - "any logged-in
// user" was only ever an interim policy until Payment/Enrollment existed.
// Resolves the course from req.query.section (list route) or by looking up
// the subsection via req.params.id (single route), then walks up
// section -> course.
export const isEnrolledOrOwnerOrAdmin = async (req, res, next) => {
  try {
    let sectionId = req.query.section;
    if (!sectionId && req.params.id) {
      const subSection = await subSectionRepository.getById(req.params.id);
      if (!subSection) {
        return res.status(StatusCodes.NOT_FOUND).json(
          customErrorResponse({
            explanation: 'No lesson exists with this id',
            message: 'Lesson not found'
          })
        );
      }
      sectionId = subSection.section;
    }

    if (!sectionId) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          explanation: 'Pass ?section=<sectionId> to list its lessons',
          message: 'section query parameter is required'
        })
      );
    }

    const section = await sectionRepository.getById(sectionId);
    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).json(
        customErrorResponse({
          explanation: 'No section exists with this id',
          message: 'Section not found'
        })
      );
    }

    const course = await courseRepository.getById(section.course);
    const isOwner = course && String(course.instructor) === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isEnrolled = Boolean(
      course?.studentsEnrolled?.some((id) => String(id) === req.user.id)
    );

    if (!isOwner && !isAdmin && !isEnrolled) {
      return res.status(StatusCodes.FORBIDDEN).json(
        customErrorResponse({
          explanation: 'You must be enrolled in this course to view its lessons',
          message: 'Enrollment required'
        })
      );
    }

    return next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          explanation: 'Section or lesson id is not a valid identifier',
          message: 'Invalid id'
        })
      );
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Must run after isAuthenticated - resolves ownership via the section's own
// course, since update/delete only have the section id (req.params.id), not a
// course id in the body. ADMIN bypasses the ownership check.
export const isSectionOwnerOrAdmin = async (req, res, next) => {
  try {
    const section = await sectionRepository.getById(req.params.id);
    if (!section) {
      return res.status(StatusCodes.NOT_FOUND).json(
        customErrorResponse({
          explanation: 'No section exists with this id',
          message: 'Section not found'
        })
      );
    }

    const course = await courseRepository.getById(section.course);
    const isOwner = course && String(course.instructor) === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json(
        customErrorResponse({
          explanation:
            "Only this section's course instructor or an admin can perform this action",
          message: 'You do not have permission to perform this action'
        })
      );
    }

    req.section = section;
    return next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          explanation: 'Section id is not a valid identifier',
          message: 'Invalid section id'
        })
      );
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
