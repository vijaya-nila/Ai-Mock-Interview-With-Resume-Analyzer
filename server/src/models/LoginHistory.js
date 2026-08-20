const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: ["success", "failure"],
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  device: {
    type: String,
    default: "Unknown",
  },

  ipAddress: {
    type: String,
    default: "Unknown",
  },
});

module.exports = mongoose.model("LoginHistory", loginHistorySchema);