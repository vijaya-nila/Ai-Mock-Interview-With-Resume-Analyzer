const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    candidateType: String,

    resumeScore: Number,

    interviewScore: Number,

    placementScore: Number,

    status: String,

    roadmap: {
      technologies: [String],
      projects: [String],
      certifications: [String],
      interviewTopics: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);