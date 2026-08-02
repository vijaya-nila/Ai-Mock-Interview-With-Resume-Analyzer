const express = require("express");
const router = express.Router();

const { getCandidateProfile } = require("../controllers/placementController");
const { protect } = require("../middleware/auth");

router.get("/candidate-profile", protect, getCandidateProfile);

module.exports = router;