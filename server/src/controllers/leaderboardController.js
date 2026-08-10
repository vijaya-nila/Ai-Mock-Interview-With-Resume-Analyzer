const Interview = require("../models/Interview.js");

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Interview.aggregate([
      {
        $match: {
          isComplete: true,
        },
      },

      {
        $group: {
          _id: "$userId",
          bestScore: { $max: "$score" },
          totalInterviews: { $sum: 1 },
          lastInterview: { $max: "$createdAt" },
        },
      },

      {
        $sort: {
          bestScore: -1,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: "$user",
      },

      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          score: "$bestScore",
          totalInterviews: 1,
          lastInterview: 1,
        },
      },
    ]);

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      name: user.name,
      score: user.score,
      totalInterviews: user.totalInterviews,
      lastInterview: user.lastInterview,
    }));

    res.json({
      leaderboard: rankedLeaderboard,
    });
  } catch (err) {
    console.error("Leaderboard error:", err);

    res.status(500).json({
      message: "Failed to fetch leaderboard",
      error: err.message,
    });
  }
};

module.exports = {
  getLeaderboard,
};