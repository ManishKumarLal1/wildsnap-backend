const cloudinary = require("../config/cloudinary");

function uploadImage(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "wildlife",
        resource_type: "image",
        ...options,
      },
      (error, result) => {
  if (error) {
    console.error("Cloudinary FULL ERROR:");
    console.error(error);
    reject(error);
    return;
  }

  resolve(result);
}
    );

    uploadStream.end(buffer);
  });
}

async function deleteImage(publicId) {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}

module.exports = {
  uploadImage,
  deleteImage,
};