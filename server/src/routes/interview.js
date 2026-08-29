const express = require("express");
const {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterview,
} = require("../controllers/interviewcontroller.js");
const { protect } = require("../middleware/auth.js");
const router = express.Router();
router.use(protect); // all routes require auth

const { requireRole } = require("../middleware/authorize.js");

router.post("/start", requireRole("Student"), startInterview);

router.post("/submit-answer", requireRole("Student"), submitAnswer);

router.get("/", requireRole("Student"), getInterviews);

router.get("/:id", requireRole("Student"), getInterview);
module.exports = router;
