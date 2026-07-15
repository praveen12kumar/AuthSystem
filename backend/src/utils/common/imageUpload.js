import cloudinary from '../../libs/cloudinaryConfig.js';

// Expects a multer memoryStorage file (file.buffer + file.mimetype), not
// express-fileupload's tempFilePath - this project uses multer.
export function uploadImageToCloudinary(file, folder, height, quality) {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }

  const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  return cloudinary.uploader.upload(base64File, options);
}

export function deleteImageFromCloudinary(publicId) {
  if (!publicId) {
    return Promise.resolve();
  }
  return cloudinary.uploader.destroy(publicId);
}
