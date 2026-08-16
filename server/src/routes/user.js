const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");

const {
  getProfile,
  getRankingHistory,
} = require("../controllers/userController");

router.get("/profile", protect, getProfile);

router.get("/ranking-history", protect, getRankingHistory);

module.exports = router;