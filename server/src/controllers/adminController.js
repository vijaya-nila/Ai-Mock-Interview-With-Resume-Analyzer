const LoginHistory = require("../models/LoginHistory");
const SecurityAlert = require("../models/SecurityAlert");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");
// ======================================================
// Get Login History
// Admin only
// ======================================================

const getLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find()
      .populate("user", "name email role")
      .sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Get Login History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch login history",
      error: error.message,
    });
  }
};

// ======================================================
// Get Security Alerts
// Admin only
// ======================================================

const getSecurityAlerts = async (req, res) => {
  try {
    const alerts = await SecurityAlert.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("Get Security Alerts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch security alerts",
      error: error.message,
    });
  }
};

// ======================================================
// Get All Users
// Admin only
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -emailVerificationToken -passwordResetToken")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
// ======================================================
// Get System Settings
// Admin only
// ======================================================

const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get System Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch system settings",
    });
  }
};

// ======================================================
// Update System Settings
// Admin only
// ======================================================

const updateSystemSettings = async (req, res) => {
  try {
    const {
      registrationEnabled,
      interviewEnabled,
      maintenanceMode,
    } = req.body;

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = new SystemSettings();
    }

    if (typeof registrationEnabled === "boolean") {
      settings.registrationEnabled = registrationEnabled;
    }

    if (typeof interviewEnabled === "boolean") {
      settings.interviewEnabled = interviewEnabled;
    }

    if (typeof maintenanceMode === "boolean") {
      settings.maintenanceMode = maintenanceMode;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "System settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update System Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update system settings",
    });
  }
};

module.exports = {
  getLoginHistory,
  getSecurityAlerts,
  getAllUsers,
  getSystemSettings,
  updateSystemSettings,
};