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
    });

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

    res.json({
      name: user.name,
      email: user.email,
      joined: user.createdAt,
      totalInterviews,
      averageScore,
      bestScore,
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