const {
  getLeaderboard,
  getUserRank,
} = require("../models/leaderboard.model");

async function getMyLeaderboard(req, res) {
  try {
    const userId = req.user.id;

    const leaderboard = await getLeaderboard(100);
    const rank = await getUserRank(userId);

    return res.status(200).json({
      leaderboard,
      rank,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch leaderboard",
    });
  }
}

module.exports = {
  getMyLeaderboard,
};