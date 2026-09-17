const authService = require("../services/auth.service");

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const result = await authService.register({
      username,
      email,
      password,
    });

    return res.status(201).json({
      message:
        "Account created successfully. Please check your email to verify your account.",
      user: result.user,
    });
  } catch (error) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    if (error.message === "USERNAME_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Username is already taken",
      });
    }

    if (error.message.startsWith("WEAK_PASSWORD:")) {
      const errors = error.message
        .replace("WEAK_PASSWORD:", "")
        .split("|");

      return res.status(400).json({
        message:
          "Password does not meet the security requirements",
        errors,
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    const result = await authService.login({
      identifier,
      password,
    });

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });

  } catch (error) {

    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid username/email or password",
      });
    }

    if (error.message === "EMAIL_NOT_VERIFIED") {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function logout(req, res) {
  return res.status(200).json({
    message: "Logout successful",
  });
}

async function getMe(req, res) {
  try {
    const user =
      await authService.getCurrentUser(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await authService.verifyEmail(token);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    return res.status(200).json({
      message: "Email verified successfully",
      user,
    });

  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        message: "Username or email is required",
      });
    }

    await authService.resendVerificationEmail(identifier.trim());

    return res.status(200).json({
      message: "If the account exists and is unverified, a verification email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    // Always return the same response
    // whether the email exists or not.
    return res.status(200).json({
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
     if (error.message.startsWith("WEAK_PASSWORD:")) {
      const errors = error.message
        .replace("WEAK_PASSWORD:", "")
        .split("|");

      return res.status(400).json({
        message: "Password does not meet the security requirements",
        errors,
      });
    }

    // 👇 Same password
    if (error.message === "PASSWORD_SAME_AS_OLD") {
      return res.status(400).json({
        message:
          "New password cannot be the same as your previous password",
      });
    }

    // 👇 Invalid/expired token
    if (error.message === "INVALID_OR_EXPIRED_RESET_TOKEN") {
      return res.status(400).json({
        message: "Invalid or expired password reset link",
      });
    }

    // 👇 Generic error should be LAST
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};