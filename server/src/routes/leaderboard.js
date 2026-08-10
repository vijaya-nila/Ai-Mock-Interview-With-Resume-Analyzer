const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.js");
const {
  getLeaderboard,
} = require("../controllers/leaderboardController.js");

router.get("/", protect, getLeaderboard);

module.exports = router;