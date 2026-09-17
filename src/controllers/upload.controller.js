const {
  uploadImage,
} = require("../services/cloudinary.service");

async function uploadObservationImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const userId = req.user.id;

    const result = await uploadImage(req.file.buffer, {
      folder: `wildlife/observations/${userId}`,
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return res.status(500).json({
      message: "Failed to upload image",
    });
  }
}


module.exports = {
  uploadObservationImage,
};