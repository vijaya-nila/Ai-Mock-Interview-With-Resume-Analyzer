const Groq = require("groq-sdk");
const Interview = require("../models/Interview.js");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = (domain) =>
  `
You are a senior technical interviewer conducting a mock interview for a ${domain} developer role.
Ask one clear, specific technical question at a time.
After the candidate answers, provide feedback and the next question.

Return ONLY the question, nothing else.


`.trim();

// ── Start Interview ───────────────────────────────────────
const startInterview = async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ message: "Domain is required" });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt(domain) },
        {
          role: "user",
          content: `Start the interview. Ask me the first ${domain} technical question. Only ask the question, no preamble.`,
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
      difficulty: "Easy",
      messages: [{ role: "ai", content: firstQuestion }],
    });
    res.status(201).json({
      sessionId: interview._id,
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
      questionsAnswered = 0,
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

            Generate ONE easier ${domain} interview question.

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

      interview.messages.push({
        role: "ai",
        content: nextQuestion,
        timestamp: new Date(),
      });

      interview.questionsAnswered = questionsAnswered + 1;
      interview.skipCount += 1;
      await interview.save();

      return res.json({
        nextQuestion,
        skipped: true,
        isComplete: false,
      });
    }

    // const interview = await Interview.findOne({
    //   _id: sessionId,
    //   userId: req.userId,
    // });
    // if (!interview)
    //   return res.status(404).json({ message: "Session not found" });
    // let currentDifficulty = interview.difficulty;

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
            "difficulty": "Hard"
          }

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
      // Adaptive difficulty
      if (score >= 80) {
        if (currentDifficulty === "Easy") {
          currentDifficulty = "Medium";
        } else if (currentDifficulty === "Medium") {
          currentDifficulty = "Hard";
        }
      } else if (score < 50) {
        if (currentDifficulty === "Hard") {
          currentDifficulty = "Medium";
        } else if (currentDifficulty === "Medium") {
          currentDifficulty = "Easy";
        }
      }
    } catch (error) {
      console.log("Evaluation parsing failed:", error.message);
    }

    const isComplete = questionsAnswered >= 2; // complete after 3 questions (0, 1, 2)
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
    interview.questionsAnswered = questionsAnswered + 1;
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
      interview.score = score;
      interview.isComplete = true;

      interview.feedback = overallAnalysis?.overallFeedback || feedback;
      interview.strengths = overallAnalysis?.strengths || [];
      interview.weaknesses = overallAnalysis?.weaknesses || [];
      interview.improvements = overallAnalysis?.improvements || [];

      interview.duration = Math.max(
        1,
        Math.round((Date.now() - interview.createdAt.getTime()) / 60000),
      );

      await interview.save();

      return res.json({
        score,
        difficulty,
        isComplete: true,

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
          content: `You are an expert ${domain} interviewer.

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

    interview.messages.push({
      role: "ai",
      content: nextQuestion,
      timestamp: new Date(),
    });
    await interview.save();

    return res.json({
      feedback,
      score,
      difficulty,
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
      .select("domain score duration questionsAnswered createdAt")
      .sort({ createdAt: -1 });

    const mapped = interviews.map((i) => ({
      id: i._id,
      topic: i.domain,
      score: i.score,
      duration: i.duration,
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
