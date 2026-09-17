const pool = require("../config/database");

async function getLeaderboard(limit = 100) {
  const result = await pool.query(
    `
    SELECT
      id,
      username,
      avatar,
      xp,
      level,
      streak
    FROM users
    ORDER BY xp DESC, created_at ASC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

async function getUserRank(userId) {
  const result = await pool.query(
    `
    SELECT COUNT(*) + 1 AS rank
    FROM users u1
    WHERE u1.xp > (
      SELECT xp
      FROM users
      WHERE id = $1
    )
    `,
    [userId]
  );

  return Number(result.rows[0].rank);
}

module.exports = {
  getLeaderboard,
  getUserRank,
};