const express = require("express");

const {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterview,
  deleteInterview,
} = require("../controllers/interviewcontroller.js");

const { protect } = require("../middleware/auth.js");
const { requireRole } = require("../middleware/authorize.js");

const router = express.Router();

router.use(protect); // all routes require auth

router.post("/start", requireRole("Student"), startInterview);

router.post("/submit-answer", requireRole("Student"), submitAnswer);

router.get("/", requireRole("Student"), getInterviews);

router.get("/:id", requireRole("Student"), getInterview);

router.delete("/:id", requireRole("Student"), deleteInterview);

module.exports = router;