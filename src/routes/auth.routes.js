const express = require("express");

const {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const authenticate = require("../middleware/auth.middleware");

const {
  registerValidation,
  loginValidation,
  validateRequest,
} = require("../middleware/validation");

const router = express.Router();

router.post(
  "/register",
  registerValidation,
  validateRequest,
  register
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  login
);

router.post(
  "/logout",
  authenticate,
  logout
);

router.get(
  "/me",
  authenticate,
  getMe
);

router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get(
  "/verify-email-link",
  authController.verifyEmailLink
);

module.exports = router;