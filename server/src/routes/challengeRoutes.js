const express = require("express");

const {
  getChallenges,
  getChallengeById,
  createChallenge,
} = require("../controllers/challengeController");

const router = express.Router();

// Get all challenges
router.get("/", getChallenges);

// Get single challenge
router.get("/:id", getChallengeById);

// Create new challenge
router.post("/", createChallenge);

module.exports = router;