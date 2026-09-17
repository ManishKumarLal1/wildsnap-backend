const express = require("express");

const {
  identifyWithNatureVisionController,
} = require("../controllers/natureVision.controller");

const router = express.Router();

router.post(
  "/identify",
  identifyWithNatureVisionController
);

module.exports = router;
