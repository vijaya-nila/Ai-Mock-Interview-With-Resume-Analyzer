const User = require("../models/User");
const Interview = require("../models/Interview");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const interviews = await Interview.find({
      userId: req.userId,
      isComplete: true,
    }).sort({ createdAt: 1 });

    const totalInterviews = interviews.length;

    const averageScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce((sum, i) => sum + i.score, 0) /
              totalInterviews
          )
        : 0;

    const bestScore =
      totalInterviews > 0
        ? Math.max(...interviews.map((i) => i.score))
        : 0;

    // ─────────────────────────────────────
    // DAY 4: Rank Calculation
    // ─────────────────────────────────────

    let rank = "Bronze";

    if (bestScore >= 90) {
      rank = "Platinum";
    } else if (bestScore >= 75) {
      rank = "Gold";
    } else if (bestScore >= 60) {
      rank = "Silver";
    }

    // ─────────────────────────────────────
    // DAY 4: Badge Unlocking
    // ─────────────────────────────────────

    const badges = [];

    if (totalInterviews >= 1) {
      badges.push("First Interview");
    }

    if (totalInterviews >= 5) {
      badges.push("5 Interviews");
    }

    if (totalInterviews >= 10) {
      badges.push("10 Interviews");
    }

    if (bestScore >= 80) {
      badges.push("High Scorer");
    }

    if (bestScore >= 90) {
      badges.push("Top Performer");
    }

    // ─────────────────────────────────────
    // DAY 4: Streak Calculation
    // ─────────────────────────────────────

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = user.currentStreak || 0;
    let longestStreak = user.longestStreak || 0;

    if (interviews.length > 0) {
      const latestInterview =
        interviews[interviews.length - 1].createdAt;

      const lastPractice = new Date(latestInterview);
      lastPractice.setHours(0, 0, 0, 0);

      const difference =
        Math.floor(
          (today.getTime() - lastPractice.getTime()) /
            (1000 * 60 * 60 * 24)
        );

      if (difference === 0) {
        // Already practiced today
        currentStreak = Math.max(currentStreak, 1);
      } else if (difference === 1) {
        // Practiced yesterday
        currentStreak += 1;
      } else {
        // Streak broken
        currentStreak = 1;
      }

      longestStreak = Math.max(
        longestStreak,
        currentStreak
      );
    }

    // Save Day 4 data
    user.rank = rank;
    user.badges = badges;
    user.currentStreak = currentStreak;
    user.longestStreak = longestStreak;

    if (interviews.length > 0) {
      user.lastPracticeDate =
        interviews[interviews.length - 1].createdAt;
    }

    await user.save();

    res.json({
      name: user.name,
      email: user.email,
      joined: user.createdAt,

      totalInterviews,
      averageScore,
      bestScore,

      // Day 4
      rank: user.rank,
      badges: user.badges,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastPracticeDate: user.lastPracticeDate,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: err.message,
    });
  }
};

module.exports = {
  getProfile,
};