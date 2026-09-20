const Interview = require("../models/Interview");
const User = require("../models/User");

// ======================================================
// Get Student Performance
// Mentor only
// ======================================================

const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check student exists
    const student = await User.findOne({
      _id: studentId,
      role: "Student",
    }).select("name email role");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get completed interviews
    const interviews = await Interview.find({
      userId: studentId,
      isComplete: true,
    })
      .select(
        "domain company score difficulty companyReadiness duration questionsAnswered feedback strengths weaknesses improvements mentorFeedback mentorFeedbackSent mentorFeedbackSentAt createdAt",
      )
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalInterviews = interviews.length;

    const averageScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce(
              (sum, interview) => sum + (interview.score || 0),
              0
            ) / totalInterviews
          )
        : 0;

    const bestScore =
      totalInterviews > 0
        ? Math.max(
            ...interviews.map(
              (interview) => interview.score || 0
            )
          )
        : 0;

    return res.status(200).json({
      success: true,

      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },

      performance: {
        totalInterviews,
        averageScore,
        bestScore,
        interviews,
      },
    });
  } catch (error) {
    console.error("Get Student Performance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student performance",
      error: error.message,
    });
  }
};


// ======================================================
// Get All Students Performance
// Mentor only
// ======================================================

const getAllStudentsPerformance = async (req, res) => {
  try {
    const students = await User.find({
      role: "Student",
    }).select("name email createdAt");

    const performance = await Promise.all(
      students.map(async (student) => {
        const interviews = await Interview.find({
          userId: student._id,
          isComplete: true,
        }).select("score");

        const totalInterviews = interviews.length;

        const averageScore =
          totalInterviews > 0
            ? Math.round(
                interviews.reduce(
                  (sum, interview) =>
                    sum + (interview.score || 0),
                  0
                ) / totalInterviews
              )
            : 0;

        const bestScore =
          totalInterviews > 0
            ? Math.max(
                ...interviews.map(
                  (interview) => interview.score || 0
                )
              )
            : 0;

        return {
          studentId: student._id,
          name: student.name,
          email: student.email,
          totalInterviews,
          averageScore,
          bestScore,
        };
      })
    );

    return res.status(200).json({
      success: true,
      students: performance,
    });
  } catch (error) {
    console.error(
      "Get All Students Performance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students performance",
      error: error.message,
    });
  }
};


// ======================================================
// Create / Update Mentor Feedback
// Mentor only
// ======================================================

const updateStudentFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        message: "Feedback is required",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      isComplete: true,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Completed interview not found",
      });
    }

    interview.mentorFeedback = feedback.trim();
    interview.mentorFeedbackSent = true;
    interview.mentorFeedbackSentAt = new Date();

    await interview.save();

   return res.status(200).json({
     success: true,
     message: "Feedback sent to student successfully",
     interviewId: interview._id,
     mentorFeedback: interview.mentorFeedback,
     mentorFeedbackSent: interview.mentorFeedbackSent,
     mentorFeedbackSentAt: interview.mentorFeedbackSentAt,
   }); 
  } catch (error) {
    console.error(
      "Update Student Feedback Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message,
    });
  }
};
// ======================================================
// Get Mentor Dashboard Statistics
// Mentor only
// ======================================================

const getMentorDashboardStats = async (req, res) => {
  try {
    // Get all students
    const students = await User.find({
      role: "Student",
    }).select("_id name email");

    // Get all completed interviews
    const interviews = await Interview.find({
      isComplete: true,
    }).select("userId score createdAt domain company");

    const totalStudents = students.length;
    const totalInterviews = interviews.length;

    // Calculate average score
    const totalScore = interviews.reduce(
      (sum, interview) => sum + (interview.score || 0),
      0
    );

    const averageScore =
      totalInterviews > 0
        ? Math.round(totalScore / totalInterviews)
        : 0;

    // Best score
    const bestScore =
      totalInterviews > 0
        ? Math.max(
            ...interviews.map(
              (interview) => interview.score || 0
            )
          )
        : 0;

    // Student-wise performance
    const studentPerformance = students.map((student) => {
      const studentInterviews = interviews.filter(
        (interview) =>
          interview.userId?.toString() ===
          student._id.toString()
      );

      const studentTotal = studentInterviews.length;

      const studentAverage =
        studentTotal > 0
          ? Math.round(
              studentInterviews.reduce(
                (sum, interview) =>
                  sum + (interview.score || 0),
                0
              ) / studentTotal
            )
          : 0;

      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        totalInterviews: studentTotal,
        averageScore: studentAverage,
      };
    });

    // Top performing students
    const topStudents = [...studentPerformance]
      .filter((student) => student.totalInterviews > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Students who need improvement
    const studentsNeedingImprovement = [...studentPerformance]
      .filter(
        (student) =>
          student.totalInterviews > 0 &&
          student.averageScore < 60
      )
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalInterviews,
        averageScore,
        bestScore,
        topStudents,
        studentsNeedingImprovement,
      },
    });
  } catch (error) {
    console.error(
      "Mentor Dashboard Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentor dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentPerformance,
  getAllStudentsPerformance,
  updateStudentFeedback,
  getMentorDashboardStats,
};