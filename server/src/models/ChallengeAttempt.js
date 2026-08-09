const mongoose = require("mongoose");

const ChallengeAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },

    answers: [
      {
        question: {
          type: String,
          required: true,
        },

        answer: {
          type: String,
          required: true,
        },

        score: {
          type: Number,
          default: 0,
        },

        feedback: {
          type: String,
          default: "",
        },
      },
    ],

    totalScore: {
      type: Number,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ChallengeAttempt",
  ChallengeAttemptSchema
);