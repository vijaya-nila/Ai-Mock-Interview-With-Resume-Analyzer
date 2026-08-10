const Challenge = require("../models/Challenge");
const ChallengeAttempt = require("../models/ChallengeAttempt");
const { generateChallenge } = require("../services/challengeService");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ======================================================
// Get all active challenges
// Automatically generate challenge if none exists
// ======================================================
const getChallenges = async (req, res) => {
  try {
    const { category, type = "Daily" } = req.query;

    const filter = {
      isActive: true,
      type,
    };

    if (category) {
      filter.category = category;
    }

    // Check existing challenges
    let challenges = await Challenge.find(filter).sort({
      createdAt: -1,
    });

    // If no challenge exists, generate one automatically
    if (challenges.length === 0) {
      const selectedCategory = category || "Technical";

      console.log(
        `No ${type} challenge found. Generating AI challenge...`
      );

      const generatedChallenge = await generateChallenge(
        selectedCategory,
        type,
        "General",
        "General"
      );

      const newChallenge = await Challenge.create({
        title: generatedChallenge.title,
        description: generatedChallenge.description,
        category: selectedCategory,
        domain: "General",
        company: "General",
        type: type,
        difficulty: generatedChallenge.difficulty || "Medium",
        questions: [generatedChallenge.question],
        isActive: true,
      });

      challenges = [newChallenge];

      console.log(
        "AI Challenge created successfully:",
        newChallenge._id
      );
    }

    res.status(200).json({
      success: true,
      challenges,
    });
  } catch (error) {
    console.error("Get Challenges Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challenges",
      error: error.message,
    });
  }
};
// ======================================================
// Get single challenge
// ======================================================
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

// ======================================================
// Create a challenge
// ======================================================
const createChallenge = async (req, res) => {
  try {
    const {
      category,
      type = "Daily",
      domain = "General",
      company = "General",
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
      company
    );

   const challenge = await Challenge.create({
     title: generatedChallenge.title,
     description: generatedChallenge.description,
     category,
     domain,
     company,
     type,
     difficulty: generatedChallenge.difficulty || difficulty,
     questions: [generatedChallenge.question],
     correctAnswer: generatedChallenge.correctAnswer,
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

// ======================================================
// Start Challenge
// ======================================================
const startChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({
        success: false,
        message: "Challenge ID is required",
      });
    }

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    if (!challenge.isActive) {
      return res.status(400).json({
        success: false,
        message: "Challenge is no longer active",
      });
    }

    const attempt = await ChallengeAttempt.create({
      userId: req.userId,
      challengeId: challenge._id,
      answers: [],
      totalScore: 0,
      feedback: "",
      isCompleted: false,
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Challenge started successfully",
      attemptId: attempt._id,
      challenge,
    });
  } catch (error) {
    console.error("Start Challenge Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start challenge",
      error: error.message,
    });
  }
};

// ======================================================
// Submit and Evaluate Answer
// ======================================================
const submitChallengeAnswer = async (req, res) => {
  try {
    const { attemptId, question, answer } = req.body;

    if (!attemptId || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID, question and answer are required",
      });
    }

    const attempt = await ChallengeAttempt.findOne({
      _id: attemptId,
      userId: req.userId,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Challenge attempt not found",
      });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Challenge is already completed",
      });
    }

    // AI Evaluation
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are an expert interview evaluator.

Evaluate the candidate's answer strictly against the given question.

IMPORTANT RULES:

1. First determine the correct answer to the question yourself.
2. Compare the candidate's answer with the correct answer.
3. For Aptitude, Mathematics, Logical Reasoning, and quantitative questions:
   - Calculate the answer yourself before evaluating.
   - Do NOT assume the candidate is correct.
   - If the candidate answer is numerically wrong, give a low score.
4. For Technical questions:
   - Check whether the answer is technically correct.
   - Consider important concepts, examples, and reasoning.
5. For HR questions:
   - Evaluate relevance, clarity, professionalism, and completeness.
6. Never give 100 unless the candidate's answer is actually correct and sufficiently complete.
7. Score must be between 0 and 100.
8. Give constructive feedback explaining why the answer is correct or incorrect.
9. Return ONLY valid JSON.
10. Do not include markdown or code blocks.

Return exactly:

{
  "score": 0,
  "feedback": ""
}

Question:
The question will be provided by the user.

Candidate Answer:
The candidate's answer will be provided by the user.
`.trim(),
        },
        {
          role: "user",
          content: `
Question:
${question}

Candidate Answer:
${answer}
          `.trim(),
        },
      ],
      temperature: 0.3,
      max_tokens: 250,
    });

    const raw = completion.choices[0].message.content;

    const clean = raw
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    let evaluation;

    try {
      evaluation = JSON.parse(clean);
    } catch (parseError) {
      console.error(
        "Challenge Evaluation Parse Error:",
        parseError.message
      );

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid evaluation",
      });
    }

    const score = Math.max(
      0,
      Math.min(100, Number(evaluation.score) || 0)
    );

    const feedback =
      evaluation.feedback || "No feedback available.";

    // Save answer
    attempt.answers.push({
      question,
      answer,
      score,
      feedback,
    });

    // Calculate average score
    const totalScore = attempt.answers.reduce(
      (total, item) => total + item.score,
      0
    );

    attempt.totalScore = Math.round(
      totalScore / attempt.answers.length
    );

    attempt.feedback = feedback;

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Answer evaluated successfully",
      score,
      feedback,
      totalScore: attempt.totalScore,
      isCompleted: attempt.isCompleted,
    });
  } catch (error) {
    console.error("Submit Challenge Answer Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to evaluate answer",
      error: error.message,
    });
  }
};

// ======================================================
// Complete Challenge
// ======================================================
const completeChallenge = async (req, res) => {
  try {
    const { attemptId } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    const attempt = await ChallengeAttempt.findOne({
      _id: attemptId,
      userId: req.userId,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Challenge attempt not found",
      });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Challenge is already completed",
      });
    }

    attempt.isCompleted = true;
    attempt.completedAt = new Date();

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Challenge completed successfully",
      result: {
        attemptId: attempt._id,
        totalScore: attempt.totalScore,
        feedback: attempt.feedback,
        isCompleted: attempt.isCompleted,
        completedAt: attempt.completedAt,
      },
    });
  } catch (error) {
    console.error("Complete Challenge Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to complete challenge",
      error: error.message,
    });
  }
};

// ======================================================
// Export Controllers
// ======================================================
module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge,
  startChallenge,
  submitChallengeAnswer,
  completeChallenge,
};