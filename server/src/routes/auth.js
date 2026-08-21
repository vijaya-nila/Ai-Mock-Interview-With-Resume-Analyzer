
const express = require("express");
const {
  getActiveSessions,
  terminateSession,
} = require("../controllers/sessionController.js");
const {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authcontroller.js");

const { protect } = require("../middleware/auth.js");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.post("/logout", protect, logout);

router.get("/me", protect, getMe);

router.get("/verify-email", verifyEmail);
// Day 4 - Session Management

router.get("/sessions", protect, getActiveSessions);

router.delete("/sessions/:sessionId", protect, terminateSession);

// Day 2 - Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;