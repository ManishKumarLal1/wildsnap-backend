const express = require("express");

const {
  getMyDex,
} = require("../controllers/dex.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getMyDex
);

module.exports = router;
