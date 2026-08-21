const Session = require("../models/Session");

// Get Active Sessions
const getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.userId,
      status: "active",
    }).select(
      "-_id sessionId deviceInfo ipAddress createdAt lastActiveAt status"
    );

    res.status(200).json({
      sessions,
    });
  } catch (err) {
    console.error("Get Active Sessions Error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Terminate Selected Session
const terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      sessionId,
      user: req.userId,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({
        message: "Active session not found",
      });
    }

    session.status = "terminated";
    session.terminatedAt = new Date();

    await session.save();

    res.status(200).json({
      message: "Session terminated successfully",
    });
  } catch (err) {
    console.error("Terminate Session Error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getActiveSessions,
  terminateSession,
};