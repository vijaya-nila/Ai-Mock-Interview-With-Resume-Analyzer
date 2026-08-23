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
router.get("/", getChallenges);

// Create new challenge
router.post(
  "/",
  protect,
  requireRole("Mentor", "Administrator"),
  createChallenge
);

// Start Challenge
router.post("/start", protect, startChallenge);

// Submit and Evaluate Answer
router.post("/submit", protect, submitChallengeAnswer);

// Complete Challenge
router.post("/complete", protect, completeChallenge);

// Challenge History
router.get("/history", protect, getChallengeHistory);

// Challenge Statistics
router.get("/statistics", protect, getChallengeStatistics);

// Get single challenge
router.get("/:id", getChallengeById);

module.exports = router;