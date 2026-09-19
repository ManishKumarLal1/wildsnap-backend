const pool = require("../config/database");

async function findUserByEmail(email) {
  const result = await pool.query(
    `
    SELECT
      id,
      username,
      email,
      password_hash,
      email_verified,
      avatar,
      xp,
      level,
      streak,
      last_observation_date,
      location,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}
async function findUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT
      id,
      username,
      email,
      password_hash,
      email_verified,
      avatar,
      xp,
      level,
      streak,
      last_observation_date,
      location,
      created_at,
      updated_at
    FROM users
    WHERE username = $1
    `,
    [username]
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query(
    `
    SELECT
      id,
      username,
      email,
      avatar,
      xp,
      level,
      streak,
      last_observation_date,
      location,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function createUser({
  username,
  email,
  passwordHash,
}) {
  const result = await pool.query(
    `
    INSERT INTO users (
      username,
      email,
      password_hash
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      username,
      email,
      avatar,
      xp,
      level,
      streak,
      last_observation_date,
      location,
      created_at,
      updated_at
    `,
    [username, email, passwordHash]
  );

  return result.rows[0];
}

async function findUserByIdentifier(identifier) {
  const result = await pool.query(
    `
    SELECT
      id,
      username,
      email,
      password_hash,
      email_verified,
      avatar,
      xp,
      level,
      streak,
      last_observation_date,
      location,
      created_at,
      updated_at
    FROM users
    WHERE email = $1 OR username = $1
    `,
    [identifier]
  );

  return result.rows[0] || null;
}

async function setVerificationToken(
  userId,
  token,
  expiresAt
) {
  const result = await pool.query(
    `
    UPDATE users
    SET
      verification_token = $1,
      verification_token_expires = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id
    `,
    [token, expiresAt, userId]
  );

  return result.rows[0];
}

async function verifyEmail(token) {
  const result = await pool.query(
    `
    UPDATE users
    SET
      email_verified = TRUE,
      verification_token = NULL,
      verification_token_expires = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE
      verification_token = $1
      AND verification_token_expires > CURRENT_TIMESTAMP
    RETURNING id, username, email
    `,
    [token]
  );

  return result.rows[0] || null;
}

async function resetPasswordWithToken(token, newPasswordHash) {
  const userResult = await pool.query(
    `
    SELECT id, username, email, password_hash
    FROM users
    WHERE password_reset_token = $1
      AND password_reset_token_expires > CURRENT_TIMESTAMP
    `,
    [token]
  );

  const user = userResult.rows[0];

  if (!user) {
    return null;
  }

  const bcrypt = require("bcrypt");

  const samePassword = await bcrypt.compare(
    // We need the plain password here, so this approach isn't ideal.
  );
}

async function findUserByEmailForPasswordReset(email) {
  const result = await pool.query(
    `
    SELECT id, username, email
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function resetPasswordWithToken(token, passwordHash) {
  const result = await pool.query(
    `
    UPDATE users
    SET password_hash = $1,
        password_reset_token = NULL,
        password_reset_token_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE password_reset_token = $2
      AND password_reset_token_expires > CURRENT_TIMESTAMP
    RETURNING id, username, email
    `,
    [passwordHash, token]
  );

  return result.rows[0] || null;
}

async function findUserByResetToken(token) {
  const result = await pool.query(
    `
    SELECT id, username, email, password_hash
    FROM users
    WHERE password_reset_token = $1
      AND password_reset_token_expires > CURRENT_TIMESTAMP
    `,
    [token]
  );

  return result.rows[0] || null;
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserByIdentifier,
  findUserById,
  createUser,
  setVerificationToken,
  verifyEmail,
  setPasswordResetToken,
  resetPasswordWithToken,
  findUserByEmailForPasswordReset,
  findUserByResetToken,
};
