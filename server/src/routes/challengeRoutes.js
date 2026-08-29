const express = require("express");

const {
  getChallenges,
  getChallengeById,
  createChallenge,
  startChallenge,
  submitChallengeAnswer,
  completeChallenge,
  getChallengeHistory,
  getChallengeStatistics,
} = require("../controllers/challengeController");

const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();
// Get all challenges
router.get(
  "/",
  protect,
  getChallenges
);

// Create new challenge - Mentor / Administrator
router.post(
  "/",
  protect,
  requireRole("Mentor", "Administrator"),
  createChallenge
);

// Challenge History - Student
router.get(
  "/history",
  protect,
  requireRole("Student"),
  getChallengeHistory
);

// Challenge Statistics - Student
router.get(
  "/statistics",
  protect,
  requireRole("Student"),
  getChallengeStatistics
);

// Get single challenge
router.get(
  "/:id",
  protect,
  getChallengeById
);

// Start Challenge - Student
router.post(
  "/start",
  protect,
  requireRole("Student"),
  startChallenge
);

// Submit Challenge Answer - Student
router.post(
  "/submit",
  protect,
  requireRole("Student"),
  submitChallengeAnswer
);

// Complete Challenge - Student
router.post(
  "/complete",
  protect,
  requireRole("Student"),
  completeChallenge
);
module.exports = router;