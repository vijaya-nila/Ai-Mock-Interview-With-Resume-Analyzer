const express = require("express");
const router = express.Router();

const { getCandidateProfile } = require("../controllers/placementController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
router.get(
  "/candidate-profile",
  protect,
  requireRole("Student"),
  getCandidateProfile
);

module.exports = router;