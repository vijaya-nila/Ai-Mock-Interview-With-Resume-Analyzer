const express = require("express");

const {
  getChallenges,
  getChallengeById,
  createChallenge,
  startChallenge,
  submitChallengeAnswer,
  completeChallenge,
} = require("../controllers/challengeController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// Get all challenges
router.get("/", getChallenges);

// Create new challenge
router.post("/", createChallenge);

// Start Challenge
router.post("/start", protect, startChallenge);

// Submit and Evaluate Answer
router.post("/submit", protect, submitChallengeAnswer);

// Complete Challenge
router.post("/complete", protect, completeChallenge);

// Get single challenge
router.get("/:id", getChallengeById);

module.exports = router;