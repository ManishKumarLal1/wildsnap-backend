const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
  getMyLeaderboard,
} = require("../controllers/leaderboard.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getMyLeaderboard);

module.exports = router;