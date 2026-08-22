const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

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

module.exports = router;