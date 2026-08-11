const Groq = require("groq-sdk");
const Interview = require("../models/Interview.js");
const { updateAchievements } = require("../utils/achievement");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = (domain, company) =>
  `
You are a senior technical interviewer from ${company}.

Conduct a realistic ${company} interview for a ${domain} role.

Rules:
- Ask one technical question at a time.
- Questions should match ${company}'s interview style.
- Start with easy questions and gradually increase difficulty.
- Do not explain the answer.
- Return ONLY the interview question.
`.trim();

// ── Start Interview ───────────────────────────────────────
const startInterview = async (req, res) => {
  try {
    const { domain, company } = req.body;

    if (!domain || !company)
      return res.status(400).json({
        message: "Domain and Company are required",
      });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt(domain, company) },
        {
          role: "user",
          content: `Start a ${company} style interview for a ${domain} position. Ask only the first technical question.`,
        },
      ],
      temperature: 0.7,
    });

    const firstQuestion =
      completion.choices[0].message.content ||
      "Tell me about yourself and your experience.";

    const interview = await Interview.create({
      userId: req.userId,
      domain,
      company,

      difficulty: "Easy",

      currentQuestion: firstQuestion,
      currentQuestionIndex: 1,
      askedQuestions: [firstQuestion],
      skippedQuestions: [],

      score: 0,
      questionsAnswered: 0,
      skipCount: 0,

      messages: [
        {
          role: "ai",
          content: firstQuestion,
        },
      ],
    });
    res.status(201).json({
      sessionId: interview._id,
      company,
      question: firstQuestion,
    });
  } catch (err) {
    console.error("startInterview error:", err);
    res
      .status(500)
      .json({ message: "Failed to start interview", error: err.message });
  }
};

// ── Submit Answer ─────────────────────────────────────────
const submitAnswer = async (req, res) => {
  try {
    const {
      sessionId,
      answer,
      domain = "General",
      company = "Startup",
      
    } = req.body;
    if (!sessionId || !answer)
      return res.status(400).json({ message: "Missing required fields" });

    const interview = await Interview.findOne({
      _id: sessionId,
      userId: req.userId,
    });

    if (!interview)
      return res.status(404).json({ message: "Session not found" });

    let currentDifficulty = interview.difficulty;
    const previousAnswers = interview.messages
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content.toLowerCase().trim());

    const repeated = previousAnswers.includes(answer.toLowerCase().trim());
    if (repeated) {
      return res.json({
        repeated: true,
        message:
          "You are repeating the same answer. Please answer differently.",
      });
    }
    // Handle skipped question
    if (answer === "__SKIP__") {
      const skipResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `
            Candidate skipped the previous question.

            Current difficulty: ${currentDifficulty}

            Generate ONE easier ${company} style ${domain} interview question.

            Rules:
            - Ask only ONE question.
            - Do not repeat previous questions.
            - Return ONLY the question.
        `,
          },
        ],
        temperature: 0.5,
      });

      const nextQuestion = skipResponse.choices[0].message.content.trim();
      interview.skippedQuestions.push(interview.currentQuestion);

      interview.messages.push({
        role: "ai",
        content: nextQuestion,
        timestamp: new Date(),
      });

      interview.currentQuestion = nextQuestion;
      interview.currentQuestionIndex += 1;

      interview.askedQuestions.push(nextQuestion);

      interview.questionsAnswered += 1;
      interview.skipCount += 1;

      await interview.save();

      return res.json({
        nextQuestion,
        skipped: true,
        isComplete: false,
        skipCount: interview.skipCount,
        difficulty: interview.difficulty,
      });
    }

    // 1️⃣ Generate feedback on the answer
    const feedbackResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are an expert ${domain} interview evaluator.
          Provide constructive feedback on this interview answer in 2-3 sentences.
          Focus on:
          - Clarity and structure of the response
          - Technical accuracy and depth
          - Communication skills
          - Areas for improvement

          Answer: "${answer}"

          Return ONLY the feedback, no additional text.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const feedback = feedbackResponse.choices[0].message.content.trim();

    // Generate score and difficulty suggestion
    const evaluationResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
          Evaluate this interview answer.

          Answer:
         "${answer}"

          Return ONLY JSON like this:

          {
            "score": 85,
            "difficulty": "Medium"
          }

          Rules:
          - If the answer is excellent → difficulty = Hard
          - If the answer is average → difficulty = Medium
          - If the answer is weak → difficulty = Easy

          Score should be between 0-100.
          Difficulty must be Easy, Medium or Hard.
          `,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    let score = 75;
    let difficulty = "Medium";

    try {
      const raw = evaluationResponse.choices[0].message.content;

      const clean = raw
        .replace(/```json\s*/i, "")
        .replace(/```/g, "")
        .trim();

      const evaluation = JSON.parse(clean);

      score = evaluation.score || 75;
      difficulty = evaluation.difficulty || "Medium";

      // AI decides the next difficulty
      currentDifficulty = difficulty;
    } catch (error) {
      console.log("Evaluation parsing failed:", error.message);
    }

    const isComplete = interview.questionsAnswered >= 2; 
    
    let overallAnalysis = null;
    // 2️⃣ Save messages to DB
    interview.messages.push({
      role: "user",
      content: answer,
      timestamp: new Date(),
    });
    interview.messages.push({
      role: "ai",
      content: feedback,
      timestamp: new Date(),
    });
    interview.questionsAnswered += 1;
    interview.difficulty = currentDifficulty;

    if (isComplete) {
      const conversation = interview.messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n");

      const analysisResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `
            You are a senior interviewer.

            Based on this interview conversation, return ONLY JSON.
            Rules:
            - strengths must contain at least 3 meaningful points.
            - weaknesses must contain at least 2 meaningful points.
            - improvements must contain at least 3 meaningful points.
            - Never leave any field empty.
            - Never return "" inside arrays.
            - Even if the candidate performs poorly, provide positive strengths such as willingness to answer, participation, or eagerness to learn.
            Conversation:
            ${conversation}

            JSON Format:

            {
             "overallFeedback":"",

              "strengths":[
              "",
              "",
              ""
              ],

             "weaknesses":[
              "",
              ""
              ],

             "improvements":[
              "",
              "",
              ""
             ]
            }
          `,
          },
        ],
        temperature: 0.4,
      });

      console.log("Groq Response:");
      console.log(analysisResponse.choices[0].message.content);

      try {
        const raw = analysisResponse.choices[0].message.content;

        console.log("Evaluation Response:");
        console.log(raw);
        const clean = raw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        overallAnalysis = JSON.parse(clean);
      } catch (error) {
        console.log("Overall Analysis Parse Error:", error.message);

        overallAnalysis = {
          overallFeedback: feedback,
          strengths: [],
          weaknesses: [],
          improvements: [],
        };
      }
    }
    if (isComplete) {
      let companyReadiness = "Not Ready";

      if (score >= 85) {
        companyReadiness = "Strong Fit";
      } else if (score >= 70) {
        companyReadiness = "Potential Fit";
      } else if (score >= 50) {
        companyReadiness = "Needs Improvement";
      }

      interview.companyReadiness = companyReadiness;
      const answerScores = interview.messages
        .filter((msg) => msg.role === "user")
        .map((msg) => msg.score || 0);

      answerScores.push(score);

      const totalScore = answerScores.reduce(
        (total, value) => total + value,
        0,
      );

      const finalScore = Math.round(totalScore / answerScores.length);

      interview.score = finalScore;
      interview.isComplete = true;

      interview.feedback = overallAnalysis?.overallFeedback || feedback;

      interview.strengths = (overallAnalysis?.strengths || []).filter(
        (item) => item.trim() !== "",
      );

      interview.weaknesses = (overallAnalysis?.weaknesses || []).filter(
        (item) => item.trim() !== "",
      );

      interview.improvements = (overallAnalysis?.improvements || []).filter(
        (item) => item.trim() !== "",
      );

      interview.duration = Math.max(
        1,
        Math.round((Date.now() - interview.createdAt.getTime()) / 60000),
      );

      await interview.save();
      const achievements = await updateAchievements(req.userId);
      return res.json({
        sessionId: interview._id,
        score,
        difficulty: currentDifficulty,
        companyReadiness,
        isComplete: true,
        achievements,
        overallFeedback: overallAnalysis?.overallFeedback,

        strengths: overallAnalysis?.strengths || [],

        weaknesses: overallAnalysis?.weaknesses || [],

        improvements: overallAnalysis?.improvements || [],
      });
    }

    const previousQuestions = interview.messages
      .filter((msg) => msg.role === "ai")
      .map((msg) => msg.content)
      .join("\n");

    // ── Continue path ──────────────────────────────────────
    const nextQuestionResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are an expert interviewer from ${company}.
          Generate questions similar to ${company}'s real interview process.

          Current interview difficulty is ${currentDifficulty}.

          Previously asked questions:

          ${previousQuestions}

          Generate ONE ${currentDifficulty} level interview question.

          Rules:
          - Ask only ONE question.
          - NEVER repeat any question from the previously asked questions.
          - If difficulty is Easy, ask basic concepts.
          - If difficulty is Medium, ask implementation-based questions.
          - If difficulty is Hard, ask advanced scenario-based questions.

          Candidate's previous answer:
          "${answer}"

          Return ONLY the question.
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const nextQuestion = nextQuestionResponse.choices[0].message.content.trim();

    // Prevent duplicate questions
    if (interview.askedQuestions.includes(nextQuestion)) {
      return res.json({
        feedback,
        score,
        difficulty: currentDifficulty,
        nextQuestion:
          "Can you explain a real-world project where you used " + domain + "?",
        isComplete: false,
      });
    }

    interview.currentQuestion = nextQuestion;
    interview.currentQuestionIndex += 1;
    interview.askedQuestions.push(nextQuestion);

    interview.messages.push({
      role: "user",
      content: answer,
      score: score,
      timestamp: new Date(),
    });

    await interview.save();

    return res.json({
      feedback,
      score,
      difficulty: currentDifficulty,
      nextQuestion,
      isComplete: false,
    });
  } catch (err) {
    console.error("submitAnswer error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// ── Get All Completed Interviews ──────────────────────────
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.userId,
      isComplete: true,
    })
      .select("domain company difficulty score duration questionsAnswered createdAt")
      .sort({ createdAt: -1 });

    const mapped = interviews.map((i) => ({
      id: i._id,
      topic: i.domain,
      company: i.company,
      difficulty: i.difficulty,
      score: i.score,
      duration: i.duration,
      questionsAnswered: i.questionsAnswered,
      date: i.createdAt,
    }));
    res.json({ interviews: mapped });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch interviews",
      error: err.message,
    });
  }
};

// ── Get Single Interview ──────────────────────────────────
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    res.json({ interview });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterview,
};
