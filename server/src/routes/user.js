const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const {
  getProfile,
  getRankingHistory,
  changePassword,
} = require("../controllers/userController");

const {
  getActiveSessions,
  terminateSession,
} = require("../controllers/sessionController");

router.get("/profile", protect, getProfile);

router.get("/ranking-history", protect, getRankingHistory);

router.put("/change-password", protect, changePassword);

// Active Sessions
router.get("/sessions", protect, getActiveSessions);

// Terminate Selected Session
router.delete("/sessions/:sessionId", protect, terminateSession);

// Day 1 - RBAC Test
router.get(
  "/admin-test",
  protect,
  requireRole("Administrator"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Administrator access granted",
      role: req.user.role,
    });
  }
);

module.exports = router;