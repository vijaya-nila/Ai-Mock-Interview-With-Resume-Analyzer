const Challenge = require("../models/Challenge");
const { generateChallenge } = require("../services/challengeService");

// Get all active challenges
const getChallenges = async (req, res) => {
  try {
    const { category, type } = req.query;

    const filter = {
      isActive: true,
    };

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.type = type;
    }

    const challenges = await Challenge.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      challenges,
    });
  } catch (error) {
    console.error("Get Challenges Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challenges",
    });
  }
};

// Get single challenge
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    res.status(200).json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("Get Challenge Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challenge",
    });
  }
};

// Create a challenge
const createChallenge = async (req, res) => {
  try {
    const {
      category,
      type = "Daily",
      domain,
      company,
      difficulty = "Medium",
    } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const generatedChallenge = await generateChallenge(
      category,
      type,
      domain,
      company,
    );

    const challenge = await Challenge.create({
      title: generatedChallenge.title,
      description: generatedChallenge.question,
      category,
      domain,
      company,
      type,
      difficulty,
      questions: [generatedChallenge.question],
    });

    res.status(201).json({
      success: true,
      message: "Challenge generated successfully",
      challenge,
    });
  } catch (error) {
    console.error("Create Challenge Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate challenge",
      error: error.message,
    });
  }
};
module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge,
};