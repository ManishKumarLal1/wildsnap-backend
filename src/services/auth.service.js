const {
  findUserByEmail,
  findUserByUsername,
  findUserByIdentifier,
  findUserById,
  createUser,
  setVerificationToken,
  verifyEmail: verifyEmailModel,
  setPasswordResetToken,
  resetPasswordWithToken,
  findUserByEmailForPasswordReset,
  findUserByResetToken,
} = require("../models/user.model");

const {
  hashPassword,
  comparePassword,
} = require("../utils/password");

const {
  generateToken,
} = require("../utils/jwt");

const {
  generatePasswordResetToken,
} = require("../utils/passwordResetToken");


const {
  generateVerificationToken,
} = require("../utils/verificationToken");

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("./email.service");

const { validatePassword } = require("../utils/passwordValidator");

async function register({ username, email, password }) {

  const passwordErrors = validatePassword(password);

  if (passwordErrors.length > 0) {
    throw new Error(
      `WEAK_PASSWORD:${passwordErrors.join("|")}`
    );
  }

  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const existingUsername = await findUserByUsername(username);

  if (existingUsername) {
    throw new Error("USERNAME_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser({
    username,
    email,
    passwordHash,
  });

  // Generate verification token
  const verificationToken = generateVerificationToken();

  // Token expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Save token in database
  await setVerificationToken(
    user.id,
    verificationToken,
    expiresAt
  );

  // Send verification email
  await sendVerificationEmail(
    email,
    username,
    verificationToken
  );

  return {
    user,
  };
}

async function login({
  identifier,
  password,
}) {
  const user =
    await findUserByIdentifier(identifier);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid =
    await comparePassword(
      password,
      user.password_hash
    );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Email verification check
  if (!user.email_verified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const token = generateToken(user.id);

  delete user.password_hash;

  return {
    user,
    token,
  };
}

async function getCurrentUser(userId) {
  return findUserById(userId);
}

async function verifyEmail(token) {
  console.log("TOKEN RECEIVED:", token);

  const user = await verifyEmailModel(token);

  console.log("VERIFY RESULT:", user);

  return user;
}

async function resendVerificationEmail(identifier) {
  const user = await findUserByIdentifier(identifier);

  if (!user || user.email_verified) {
    return;
  }

  const verificationToken = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await setVerificationToken(
    user.id,
    verificationToken,
    expiresAt
  );

  await sendVerificationEmail(
    user.email,
    user.username,
    verificationToken
  );
}

async function forgotPassword(email) {
  const user = await findUserByEmailForPasswordReset(email);

  // Don't reveal whether the email exists
  if (!user) {
    return;
  }

  const resetToken = generatePasswordResetToken();

  // 15 minute expiration
  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  await setPasswordResetToken(
    user.id,
    resetToken,
    expiresAt
  );

  await sendPasswordResetEmail(
    user.email,
    user.username,
    resetToken
  );
}
async function resetPassword(token, newPassword) {
  const passwordErrors = validatePassword(newPassword);

  if (passwordErrors.length > 0) {
    throw new Error(
      `WEAK_PASSWORD:${passwordErrors.join("|")}`
    );
  }

  // Find user using reset token
  const user = await findUserByResetToken(token);

  if (!user) {
    throw new Error("INVALID_OR_EXPIRED_RESET_TOKEN");
  }

  // Check if new password is same as old password
  const samePassword = await comparePassword(
    newPassword,
    user.password_hash
  );

  if (samePassword) {
    throw new Error("PASSWORD_SAME_AS_OLD");
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  const updatedUser = await resetPasswordWithToken(
    token,
    passwordHash
  );

  if (!updatedUser) {
    throw new Error("INVALID_OR_EXPIRED_RESET_TOKEN");
  }

  return updatedUser;
}
module.exports = {
  register,
  login,
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};