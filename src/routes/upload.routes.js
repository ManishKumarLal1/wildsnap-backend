const express = require("express");

const upload = require("../middleware/upload.middleware");
const authenticate = require("../middleware/auth.middleware");

const {
  uploadObservationImage,
} = require("../controllers/upload.controller");

const router = express.Router();

router.post(
  "/observation",
  authenticate,
  upload.single("image"),
  uploadObservationImage
);

module.exports = router;