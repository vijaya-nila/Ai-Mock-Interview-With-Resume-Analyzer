const mongoose = require("mongoose");

const securityAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "multiple_failed_logins",
        "account_locked",
        "suspicious_activity",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    ipAddress: {
      type: String,
      default: "Unknown",
    },

    deviceInfo: {
      type: String,
      default: "Unknown",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model("SecurityAlert", securityAlertSchema);