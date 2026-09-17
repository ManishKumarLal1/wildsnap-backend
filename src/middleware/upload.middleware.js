const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isImageMimeType = file.mimetype.startsWith("image/");
  const isImageExtension = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(
    file.originalname
  );

  if (isImageMimeType || isImageExtension) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter,
});

module.exports = upload;
