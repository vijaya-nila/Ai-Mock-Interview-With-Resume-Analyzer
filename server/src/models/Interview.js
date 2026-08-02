const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["ai", "user"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  domain: { type: String, required: true },

  score: { type: Number, default: 0 },

  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy",
  },
  currentQuestion: {
    type: String,
    default: "",
  },

  currentQuestionIndex: {
    type: Number,
    default: 0,
  },

  askedQuestions: {
    type: [String],
    default: [],
  },

  skippedQuestions: {
    type: [String],
    default: [],
  },
  duration: { type: Number, default: 0 },
  questionsAnswered: { type: Number, default: 0 },
  skipCount: {
    type: Number,
    default: 0,
  },

  messages: [MessageSchema],

  feedback: { type: String, default: "" },

  strengths: {
    type: [String],
    default: [],
  },

  weaknesses: {
    type: [String],
    default: [],
  },

  improvements: {
    type: [String],
    default: [],
  },

  isComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Interview", InterviewSchema);
