const Groq = require("groq-sdk");
const Resume = require("../models/Resume");
const Interview = require("../models/Interview");
const pdfParse = require("pdf-parse");
const { classifyCandidate } = require("../services/classificationService");
const History = require("../models/History");
const { compareHistory } = require("../services/comparisonService");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DOMAINS = [
  "JavaScript/Node.js",
  "React",
  "Python",
  "Data Science",
  "DevOps",
  "System Design",
  "Database Design",
  "General",
];

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// ================= Resume Analyzer =================


const analyzeResume = async (req, res) => {
  try {
    
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    let resumeText = "";

    if (req.file.mimetype === "application/pdf") {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else {
      resumeText = req.file.buffer.toString("utf-8");
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Failed to extract text from resume",
      });
    }

    const truncated = resumeText.slice(0, 6000);

    const prompt = `
You are an expert technical recruiter and career coach.

Analyze the following resume.

Respond ONLY with a VALID JSON object.

First identify the candidate type.

Rules:

- Fresher = No work experience or internship.
- Intern = Has internship experience but no full-time experience.
- Experienced = Has full-time work experience.

Generate the roadmap according to the candidate type.

For Freshers:
- Focus on fundamentals, DSA, projects and aptitude.

For Interns:
- Focus on advanced projects, Git, teamwork, deployment and interview preparation.

For Experienced:
- Focus on system design, leadership, scalability and advanced backend concepts.

Available interview domains:
${DOMAINS.join(", ")}

Resume:
${truncated}

Return ONLY this JSON:

{
  "resumeScore": 85,
  "candidateType": "Fresher",
  "summary": "",
  "experienceLevel": "Junior",
  "skillsDetected": [],
  "strengths": [],
  "recommendedDomains": [
    {
      "label": "",
      "reason": "",
      "confidence": 90
    }
  ],
  "education": [],
  "projects": [],
  "certifications": [],
  "missingSkills": [],
  "recommendations": [
    "",
    "",
    ""
  ],

"roadmap": {
  "technologies": [
    "",
    "",
    ""
  ],
  "projects": [
    "",
    "",
    ""
  ],
  "certifications": [
    "",
    "",
    ""
  ],
  "interviewTopics": [
    "",
    "",
    ""
  ]
}

`;

    const response = await groq.chat.completions.create({
      // model: "llama-3.3-70b-versatile",
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const raw = response.choices[0].message.content || "{}";

    let analysis;

    try {
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      analysis = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw,
      });
    }

    if (analysis.recommendedDomains) {
      analysis.recommendedDomains = analysis.recommendedDomains.filter((d) =>
        DOMAINS.includes(d.label),
      );
    }

    await Resume.create({
      userId: req.userId,
      candidateType: analysis.candidateType || "Fresher",
      resumeScore: analysis.resumeScore || 0,
      summary: analysis.summary || "",
      experienceLevel: analysis.experienceLevel || "Junior",
      skillsDetected: analysis.skillsDetected || [],
      strengths: analysis.strengths || [],
      recommendedDomains: analysis.recommendedDomains || [],
      education: analysis.education || [],
      projects: analysis.projects || [],
      certifications: analysis.certifications || [],
      missingSkills: analysis.missingSkills || [],
      placementReadiness: analysis.placementReadiness || 0,
      roadmap: analysis.roadmap || {
        technologies: [],
        projects: [],
        certifications: [],
        interviewTopics: [],
      },
    });

    return res.json({
      analysis,
    });
  } catch (error) {
    // console.error("Error analyzing resume:", error);
    console.error("❌ ERROR ANALYZING RESUME");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ================= Candidate Profile =================

const getCandidateProfile = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    const interview = await Interview.findOne({
      userId: req.userId,
      isComplete: true,
    }).sort({ createdAt: -1 });

    if (!resume || !interview) {
      return res.status(404).json({
        message: "Resume or Interview data not found",
      });
    }

    const resumeScore = resume.resumeScore;
    const interviewScore = interview.score;

    const placementScore = Math.round(resumeScore * 0.4 + interviewScore * 0.6);

    const status = classifyCandidate(placementScore);

    await History.create({
      userId: req.userId,
      candidateType: resume.candidateType,
      resumeScore,
      interviewScore,
      placementScore,
      status,
      roadmap: resume.roadmap,
    });

    const histories = await History.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    let progressReport = null;

    if (histories.length >= 2) {
      progressReport = compareHistory(
        histories[1], // previous attempt
        histories[0], // latest attempt
      );
    }

    res.json({
      candidateType: resume.candidateType,
      resumeScore,
      interviewScore,
      placementScore,
      status,
      skills: resume.skillsDetected,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      recommendations: resume.recommendations,
      roadmap: resume.roadmap,

      overallFeedback: interview.feedback,

      progressReport,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch candidate profile",
      error: err.message,
    });
  }
};
const getHistory = async (req, res) => {
  try {
    const history = await History.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch history",
      error: err.message,
    });
  }
};
module.exports = {
  analyzeResume,
  getCandidateProfile,
  getHistory,
};
