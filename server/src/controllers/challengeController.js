const Challenge = require("../models/Challenge");
const ChallengeAttempt = require("../models/ChallengeAttempt");
const { generateChallenge } = require("../services/challengeService");
const Groq = require("groq-sdk");
const User = require("../models/User");

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
// Get Challenge Statistics
// ======================================================
const getChallengeStatistics = async (req, res) => {
  try {
    const attempts = await ChallengeAttempt.find({
      userId: req.userId,
    });

    const completedAttempts = attempts.filter(
      (attempt) => attempt.isCompleted
    );

    const totalChallenges = attempts.length;
    const completedChallenges = completedAttempts.length;

    const scores = completedAttempts.map(
      (attempt) => attempt.totalScore || 0
    );

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) /
              scores.length
          )
        : 0;

    const bestScore =
      scores.length > 0 ? Math.max(...scores) : 0;

    const completionRate =
      totalChallenges > 0
        ? Math.round(
            (completedChallenges / totalChallenges) * 100
          )
        : 0;

    res.status(200).json({
      success: true,
      statistics: {
        totalChallenges,
        completedChallenges,
        completionRate,
        averageScore,
        bestScore,
      },
    });
  } catch (error) {
    console.error("Challenge Statistics Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challenge statistics",
      error: error.message,
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
      model: "openai/gpt-oss-120b",
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
// Complete Challenge + Rank + Badges + Streak
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

    // Find user's challenge attempt
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

    // Mark challenge as completed
    attempt.isCompleted = true;
    attempt.completedAt = new Date();

    await attempt.save();

    // ==================================================
    // Get User
    // ==================================================
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==================================================
    // DAY 4 - RANK SYSTEM
    // ==================================================
    const score = attempt.totalScore || 0;

    let newRank = "Bronze";

    if (score >= 90) {
      newRank = "Platinum";
    } else if (score >= 75) {
      newRank = "Gold";
    } else if (score >= 50) {
      newRank = "Silver";
    } else {
      newRank = "Bronze";
    }

    user.rank = newRank;

    if (!user.rankingHistory) {
      user.rankingHistory = [];
    }

    user.rankingHistory.push({
      rank: newRank,
      achievedAt: new Date(),
    });

    // ==================================================
    // DAY 4 - BADGE SYSTEM
    // ==================================================

    if (!user.badges) {
      user.badges = [];
    }

    // First Challenge
    if (!user.badges.includes("First Challenge")) {
      user.badges.push("First Challenge");
    }

    // Score based badges
    if (score >= 90 && !user.badges.includes("90+ Score")) {
      user.badges.push("90+ Score");
    }

    if (score === 100 && !user.badges.includes("Perfect Score")) {
      user.badges.push("Perfect Score");
    }

    // Rank badges
    if (newRank === "Silver" && !user.badges.includes("Silver Achiever")) {
      user.badges.push("Silver Achiever");
    }

    if (newRank === "Gold" && !user.badges.includes("Gold Achiever")) {
      user.badges.push("Gold Achiever");
    }

    if (newRank === "Platinum" && !user.badges.includes("Platinum Achiever")) {
      user.badges.push("Platinum Achiever");
    }

    // ==================================================
    // DAY 4 - STREAK SYSTEM
    // ==================================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.streak) {
      user.streak = {
        current: 0,
        longest: 0,
        lastInterviewDate: null,
      };
    }

    let lastDate = null;

    if (user.streak.lastInterviewDate) {
      lastDate = new Date(user.streak.lastInterviewDate);
      lastDate.setHours(0, 0, 0, 0);
    }

    if (!lastDate) {
      // First completed challenge
      user.streak.current = 1;
    } else {
      const difference = today.getTime() - lastDate.getTime();

      const oneDay = 24 * 60 * 60 * 1000;

      if (difference === oneDay) {
        // Completed on consecutive day
        user.streak.current += 1;
      } else if (difference > oneDay) {
        // Streak broken
        user.streak.current = 1;
      }
      // If difference === 0, user already completed today
    }

    // Update longest streak
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    // Update last challenge date
    user.streak.lastInterviewDate = new Date();

    // Streak badges
    if (user.streak.current >= 3 && !user.badges.includes("3 Day Streak")) {
      user.badges.push("3 Day Streak");
    }

    if (user.streak.current >= 7 && !user.badges.includes("7 Day Streak")) {
      user.badges.push("7 Day Streak");
    }

    if (user.streak.current >= 30 && !user.badges.includes("30 Day Streak")) {
      user.badges.push("30 Day Streak");
    }

    // ==================================================
    // Save User
    // ==================================================

    await user.save();

    // ==================================================
    // Final Response
    // ==================================================

    res.status(200).json({
      success: true,
      message: "Challenge completed successfully",

      result: {
        attemptId: attempt._id,
        totalScore: attempt.totalScore,
        feedback: attempt.feedback,

        isCompleted: attempt.isCompleted,
        completedAt: attempt.completedAt,

        rank: user.rank,
        badges: user.badges,

        streak: {
          current: user.streak.current,
          longest: user.streak.longest,
          lastInterviewDate: user.streak.lastInterviewDate,
        },
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
// Get Challenge History
// ======================================================
const getChallengeHistory = async (req, res) => {
  try {
    const history = await ChallengeAttempt.find({
      userId: req.userId,
      isCompleted: true,
    })
      .populate("challengeId")
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Challenge History Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challenge history",
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
  getChallengeHistory,
  getChallengeStatistics,
};