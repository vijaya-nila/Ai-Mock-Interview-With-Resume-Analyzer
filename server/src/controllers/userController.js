const User = require("../models/User");
const Interview = require("../models/Interview");


// ======================================================
// Get Ranking History
// ======================================================
const getRankingHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "rank rankingHistory"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      currentRank: user.rank,
      rankingHistory: user.rankingHistory || [],
    });
  } catch (error) {
    console.error("Ranking History Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch ranking history",
      error: error.message,
    });
  }
};


// ======================================================
// Change Password
// ======================================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Get current user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent using the same password
    const isSamePassword = await user.comparePassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Set new password
    // User model pre-save hook will hash it automatically
    user.password = newPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
// ======================================================
// Get User Profile
// ======================================================
const getProfile = async (req, res) => {
  try {
    // Get current user
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==================================================
    // Get Completed Interviews
    // ==================================================
    const interviews = await Interview.find({
      userId: req.userId,
      isComplete: true,
    }).sort({ createdAt: 1 });

    const totalInterviews = interviews.length;

    // ==================================================
    // Calculate Average Score
    // ==================================================
    const averageScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce(
              (sum, interview) => sum + (interview.score || 0),
              0
            ) / totalInterviews
          )
        : 0;

    // ==================================================
    // Calculate Best Score
    // ==================================================
    const bestScore =
      totalInterviews > 0
        ? Math.max(
            ...interviews.map(
              (interview) => interview.score || 0
            )
          )
        : 0;

    // ==================================================
    // DAY 4: Rank Calculation
    // ==================================================
    let rank = "Bronze";

    if (bestScore >= 90) {
      rank = "Platinum";
    } else if (bestScore >= 75) {
      rank = "Gold";
    } else if (bestScore >= 60) {
      rank = "Silver";
    }

    // ==================================================
    // DAY 4: Badge Unlocking
    // ==================================================
    const badges = [];

    // First Interview
    if (totalInterviews >= 1) {
      badges.push("First Interview");
    }

    // 5 Interviews
    if (totalInterviews >= 5) {
      badges.push("5 Interviews");
    }

    // 10 Interviews
    if (totalInterviews >= 10) {
      badges.push("10 Interviews");
    }

    // High Scorer
    if (bestScore >= 80) {
      badges.push("High Scorer");
    }

    // Top Performer
    if (bestScore >= 90) {
      badges.push("Top Performer");
    }

    // ==================================================
    // DAY 4: Streak Calculation
    // ==================================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Make sure streak object exists
    if (!user.streak) {
      user.streak = {
        current: 0,
        longest: 0,
        lastInterviewDate: null,
      };
    }

    let currentStreak = user.streak.current || 0;
    let longestStreak = user.streak.longest || 0;

    if (interviews.length > 0) {
      const latestInterview =
        interviews[interviews.length - 1].createdAt;

      const lastPractice = new Date(latestInterview);
      lastPractice.setHours(0, 0, 0, 0);

      const difference = Math.floor(
        (today.getTime() - lastPractice.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (difference === 0) {
        // Practiced today
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

      // Update last practice date
      user.streak.lastInterviewDate = latestInterview;
    }

    // ==================================================
    // Streak Badges
    // ==================================================

    if (
      currentStreak >= 3 &&
      !badges.includes("3 Day Streak")
    ) {
      badges.push("3 Day Streak");
    }

    if (
      currentStreak >= 7 &&
      !badges.includes("7 Day Streak")
    ) {
      badges.push("7 Day Streak");
    }

    if (
      currentStreak >= 30 &&
      !badges.includes("30 Day Streak")
    ) {
      badges.push("30 Day Streak");
    }

    // ==================================================
    // Save Day 4 Data
    // ==================================================

    user.rank = rank;
    user.badges = badges;

    user.streak.current = currentStreak;
    user.streak.longest = longestStreak;

    await user.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      success: true,

      name: user.name,
      email: user.email,
      joined: user.createdAt,

      // Interview Statistics
      totalInterviews,
      averageScore,
      bestScore,

      // Day 4 Achievements
      rank: user.rank,
      badges: user.badges,

      streak: {
        current: user.streak.current,
        longest: user.streak.longest,
        lastInterviewDate:
          user.streak.lastInterviewDate,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// ======================================================
// Export Controller
// ======================================================

module.exports = {
  getProfile,
  getRankingHistory,
    changePassword,
};