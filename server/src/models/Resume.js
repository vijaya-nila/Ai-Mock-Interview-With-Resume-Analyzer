const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  resumeScore: {
    type: Number,
    default: 0,
  },

  summary: {
    type: String,
    default: "",
  },

  experienceLevel: {
    type: String,
    enum: ["Junior", "Mid", "Senior"],
    default: "Junior",
  },
  candidateType: {
    type: String,
    enum: ["Fresher", "Intern", "Experienced"],
    default: "Fresher",
  },
  skillsDetected: {
    type: [String],
    default: [],
  },

  projects: {
    type: [String],
    default: [],
  },

  education: {
    type: [String],
    default: [],
  },

  certifications: {
    type: [String],
    default: [],
  },

  missingSkills: {
    type: [String],
    default: [],
  },

  strengths: {
    type: [String],
    default: [],
  },

  recommendedDomains: [
    {
      label: String,
      reason: String,
      confidence: Number,
    },
  ],
  placementReadiness: {
    type: Number,
    default: 0,
  },

  recommendations: {
    type: [String],
    default: [],
  },

  roadmap: {
    technologies: {
      type: [String],
      default: [],
    },

    projects: {
      type: [String],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
    },

    interviewTopics: {
      type: [String],
      default: [],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", ResumeSchema);