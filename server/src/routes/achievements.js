const express = require("express");
const ChallengeAttempt = require("../models/ChallengeAttempt");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Get user's achievements
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.userId;

    // Get current user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get completed challenges
    const completedAttempts = await ChallengeAttempt.find({
      userId,
      isCompleted: true,
    }).sort({ completedAt: 1 });

    const completedCount = completedAttempts.length;

    // ==================================================
    // BADGES
    // ==================================================

    const badges = [];

    // First Challenge
    if (completedCount >= 1) {
      badges.push("First Challenge");
    }

    // 5 Challenges
    if (completedCount >= 5) {
      badges.push("5 Challenges");
    }

    // 10 Challenges
    if (completedCount >= 10) {
      badges.push("10 Challenges");
    }

    // High Scorer
    const highScore = completedAttempts.some(
      (attempt) => attempt.totalScore >= 80
    );

    if (highScore) {
      badges.push("High Scorer");
    }

    // ==================================================
    // STREAK
    // ==================================================

    let currentStreak = 0;
    let longestStreak = 0;

    const dates = completedAttempts
      .filter((attempt) => attempt.completedAt)
      .map((attempt) => {
        const date = new Date(attempt.completedAt);

        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime();
      });

    // Remove duplicate dates
    const uniqueDates = [...new Set(dates)].sort(
      (a, b) => a - b
    );

    if (uniqueDates.length > 0) {
      let streak = 1;
      longestStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const previous = uniqueDates[i - 1];
        const current = uniqueDates[i];

        const difference =
          (current - previous) / (1000 * 60 * 60 * 24);

        if (difference === 1) {
          streak++;
        } else {
          streak = 1;
        }

        longestStreak = Math.max(
          longestStreak,
          streak
        );
      }

      // Calculate current streak from latest activity
      currentStreak = 1;

      for (
        let i = uniqueDates.length - 1;
        i > 0;
        i--
      ) {
        const current = uniqueDates[i];
        const previous = uniqueDates[i - 1];

        const difference =
          (current - previous) /
          (1000 * 60 * 60 * 24);

        if (difference === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // 7 Day Streak Badge
    if (longestStreak >= 7) {
      badges.push("7 Day Streak");
    }

    // ==================================================
    // RANK
    // ==================================================

    let rank = "Bronze";

    const averageScore =
      completedCount > 0
        ? completedAttempts.reduce(
            (sum, attempt) =>
              sum + (attempt.totalScore || 0),
            0
          ) / completedCount
        : 0;

    if (averageScore >= 90 && completedCount >= 10) {
      rank = "Platinum";
    } else if (
      averageScore >= 80 &&
      completedCount >= 7
    ) {
      rank = "Gold";
    } else if (
      averageScore >= 60 &&
      completedCount >= 3
    ) {
      rank = "Silver";
    }

    // ==================================================
    // UPDATE USER
    // ==================================================

    user.badges = badges;
    user.rank = rank;
    user.streak.current = currentStreak;
    user.streak.longest = longestStreak;

    if (completedAttempts.length > 0) {
      user.streak.lastInterviewDate =
        completedAttempts[
          completedAttempts.length - 1
        ].completedAt;
    }

    await user.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      success: true,
      achievements: {
        rank,
        badges,
        streak: {
          current: currentStreak,
          longest: longestStreak,
          lastInterviewDate:
            user.streak.lastInterviewDate,
        },
      },
    });
  } catch (error) {
    console.error(
      "Achievements Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch achievements",
      error: error.message,
    });
  }
});

module.exports = router;