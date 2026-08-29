const express = require("express");

const {
  getActivityLogs,
  getSecurityAlerts,
  getActivityStatistics,
} = require("../controllers/activityController");

const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

// ======================================================
// Get Login Activity Logs
// Administrator only
// ======================================================

router.get(
  "/logs",
  protect,
  requireRole("Administrator"),
  getActivityLogs
);

// ======================================================
// Get Security Alerts
// Administrator only
// ======================================================

router.get(
  "/security-alerts",
  protect,
  requireRole("Administrator"),
  getSecurityAlerts
);

// ======================================================
// Get Activity Statistics
// Administrator only
// ======================================================

router.get(
  "/statistics",
  protect,
  requireRole("Administrator"),
  getActivityStatistics
);

module.exports = router;