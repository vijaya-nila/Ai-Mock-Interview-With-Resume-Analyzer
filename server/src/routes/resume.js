const express = require("express");
const { protect } = require("../middleware/auth.js");
const multer=require("multer");

const {
  analyzeResume,
  getCandidateProfile,
  getHistory,
} = require("../controllers/resumecontroller.js");
const router = express.Router();

const upload=multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:5*1024*1024}, // 5MB limit
    fileFilter:(req,file,cb)=>{
        const allowedTypes=["application/pdf","text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if(allowedTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(new Error("Invalid file type"),false);
        }
    }
});

const { requireRole } = require("../middleware/authorize.js");
router.post(
  "/analyze",
  protect,
  requireRole("Student"),
  upload.single("resume"),
  analyzeResume,
);

router.get(
  "/candidate-profile",
  protect,
  requireRole("Student"),
  getCandidateProfile,
);

router.get("/history", protect, requireRole("Student"), getHistory);
module.exports = router;