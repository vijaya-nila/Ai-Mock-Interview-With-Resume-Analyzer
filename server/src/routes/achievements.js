const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json({
      achievements: {
        rank: "Gold",
        badges: ["First Interview", "7 Day Streak", "High Scorer"],
        streak: {
          current: 3,
          longest: 7,
          lastInterviewDate: null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch achievements",
    });
  }
});

module.exports = router;