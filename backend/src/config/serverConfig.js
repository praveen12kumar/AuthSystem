import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DEV_DB_URL = process.env.DEV_DB_URL;
export const PROD_DB_URL = process.env.PROD_DB_URL;

export const CLIENT_URL = process.env.CLIENT_URL;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const REDIS_URL = process.env.REDIS_URL;
export const REDIS_REST_TOKEN = process.env.REDIS_REST_TOKEN;

export const GMAIL_USER = process.env.GMAIL_USER;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const RAZORPAY_API_KEY = process.env.RAZORPAY_API_KEY;
export const RAZORPAY_API_SECRET = process.env.RAZORPAY_API_SECRET;

// Percentage of each sale the platform keeps; the rest is the instructor's
// earning. Snapshotted onto each Payment at verification time (see
// paymentService.js) so a later change here never rewrites past earnings.
export const PLATFORM_COMMISSION_PERCENT = Number(
  process.env.PLATFORM_COMMISSION_PERCENT || 20
);
