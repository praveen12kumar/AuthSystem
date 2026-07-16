import cloudinary from '../../libs/cloudinaryConfig.js';

// Same multer memoryStorage -> base64 data-URI approach as imageUpload.js,
// just with resource_type: 'video' so Cloudinary parses it as media (and
// returns a `duration` in its response, in seconds) instead of an image.
export function uploadVideoToCloudinary(file, folder) {
  const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  return cloudinary.uploader.upload(base64File, {
    folder,
    resource_type: 'video'
  });
}

export function deleteVideoFromCloudinary(publicId) {
  if (!publicId) {
    return Promise.resolve();
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
}
