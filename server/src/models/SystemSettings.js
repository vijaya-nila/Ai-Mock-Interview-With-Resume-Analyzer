const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    registrationEnabled: {
      type: Boolean,
      default: true,
    },

    interviewEnabled: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SystemSettings",
  systemSettingsSchema
);