const express = require("express");

const {
  register,
  login,
  getMe,
  verifyEmail,
} = require("../controllers/authcontroller.js");

const { protect } = require("../middleware/auth.js");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.get("/verify-email", verifyEmail);

module.exports = router;