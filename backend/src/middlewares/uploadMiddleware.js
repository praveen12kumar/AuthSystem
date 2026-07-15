import { StatusCodes } from 'http-status-codes';
import multer from 'multer';

import { customErrorResponse } from '../utils/common/responseObject.js';

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter
});

// multer reports errors through a callback rather than a thrown exception,
// so a normal controller try/catch never sees them - this wrapper formats
// them itself, the same way validate() formats its own Zod errors.
export const uploadSingle = (fieldName) => {
  const middleware = upload.single(fieldName);

  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          customErrorResponse({
            message: 'File upload failed',
            explanation: [error.message]
          })
        );
      }
      return next();
    });
  };
};

export const requireFile = (fieldName) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json(
        customErrorResponse({
          message: `${fieldName} is required`,
          explanation: [`No ${fieldName} file was uploaded`]
        })
      );
    }
    return next();
  };
};
