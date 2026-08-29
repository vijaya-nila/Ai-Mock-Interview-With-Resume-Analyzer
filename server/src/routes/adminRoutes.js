const express = require("express");

const {
  getLoginHistory,
  getSecurityAlerts,
  getAllUsers,
  getSystemSettings,
  updateSystemSettings,
} = require("../controllers/adminController");

const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

// ======================================================
// Get All Login History
// Admin only
// ======================================================

router.get(
  "/login-history",
  protect,
  requireRole("Administrator"),
  getLoginHistory
);

// ======================================================
// Get Security Alerts
// Admin only
// ======================================================

router.get(
  "/security-alerts",
  protect,
  requireRole("Administrator"),
  getSecurityAlerts
);

// ======================================================
// Get All Users
// Admin only
// ======================================================

router.get(
  "/users",
  protect,
  requireRole("Administrator"),
  getAllUsers
);

// ======================================================
// Get System Settings
// Admin only
// ======================================================

router.get(
  "/settings",
  protect,
  requireRole("Administrator"),
  getSystemSettings
);

// ======================================================
// Update System Settings
// Admin only
// ======================================================

router.put(
  "/settings",
  protect,
  requireRole("Administrator"),
  updateSystemSettings
);

module.exports = router;