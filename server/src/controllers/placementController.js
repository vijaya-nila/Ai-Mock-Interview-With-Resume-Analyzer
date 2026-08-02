const Resume = require("../models/Resume");
const Interview = require("../models/Interview");

const getCandidateProfile = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    const interview = await Interview.findOne({
      userId: req.userId,
      isComplete: true,
    }).sort({ createdAt: -1 });

    if (!resume || !interview) {
      return res.status(404).json({
        message: "Resume or Interview data not found",
      });
    }

    const resumeScore = resume.resumeScore;
    const interviewScore = interview.score;

    const placementScore = Math.round(
      resumeScore * 0.4 + interviewScore * 0.6
    );

    let status = "";

    if (placementScore >= 85) {
      status = "Excellent";
    } else if (placementScore >= 70) {
      status = "Placement Ready";
    } else if (placementScore >= 50) {
      status = "Needs Improvement";
    } else {
      status = "Not Ready";
    }

    return res.json({
      resumeScore,
      interviewScore,
      placementScore,
      status,

      skills: resume.skillsDetected,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,

      recommendations: resume.recommendations,
      roadmap: resume.roadmap,   // Day 5

      overallFeedback: interview.feedback,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch candidate profile",
      error: err.message,
    });
  }
};

module.exports = {
  getCandidateProfile,
};