import cloudinaryPkg from 'cloudinary';

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME
} from '../config/serverConfig.js';

// The 'cloudinary' package's default export is its legacy v1 API, which
// silently ignores `resource_type` on upload (always routes to the image
// endpoint - confirmed live: a real video upload with resource_type:'video'
// failed with "Invalid image file" under v1, and succeeded correctly,
// reporting the real duration, once switched to .v2). Always use v2.
const cloudinary = cloudinaryPkg.v2;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

export default cloudinary;
