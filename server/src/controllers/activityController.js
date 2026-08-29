const LoginHistory = require("../models/LoginHistory");
const SecurityAlert = require("../models/SecurityAlert");

// ======================================================
// Get Login Activity Logs
// Admin only
// ======================================================

const getActivityLogs = async (req, res) => {
  try {
    const logs = await LoginHistory.find()
      .populate("user", "name email role")
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get Activity Logs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
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
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: alerts.length,
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
// Get Activity Statistics
// Admin only
// ======================================================

const getActivityStatistics = async (req, res) => {
  try {
    const totalLogins = await LoginHistory.countDocuments({
      status: "success",
    });

    const failedLogins = await LoginHistory.countDocuments({
      status: "failure",
    });

    const totalAlerts = await SecurityAlert.countDocuments();

    return res.status(200).json({
      success: true,
      statistics: {
        totalLogins,
        failedLogins,
        totalAlerts,
      },
    });
  } catch (error) {
    console.error("Get Activity Statistics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity statistics",
      error: error.message,
    });
  }
};

// ======================================================
// Export Controllers
// ======================================================

module.exports = {
  getActivityLogs,
  getSecurityAlerts,
  getActivityStatistics,
};