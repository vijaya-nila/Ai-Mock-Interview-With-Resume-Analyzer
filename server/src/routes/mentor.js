const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.js");
const { requireRole } = require("../middleware/authorize.js");

const {
  getStudentPerformance,
  getAllStudentsPerformance,
  updateStudentFeedback,
} = require("../controllers/mentorController.js");

// All mentor routes require authentication
router.use(protect);

// Get all students performance
router.get(
  "/students",
  requireRole("Mentor"),
  getAllStudentsPerformance
);

// Get one student's performance
router.get(
  "/students/:studentId",
  requireRole("Mentor"),
  getStudentPerformance
);

// Create / update feedback
router.put(
  "/feedback/:interviewId",
  requireRole("Mentor"),
  updateStudentFeedback
);

module.exports = router;