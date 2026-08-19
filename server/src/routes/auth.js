const express = require("express");

const {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authcontroller.js");

const { protect } = require("../middleware/auth.js");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.get("/verify-email", verifyEmail);

// Day 2 - Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;