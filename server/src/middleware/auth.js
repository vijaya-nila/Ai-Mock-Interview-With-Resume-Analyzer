const jwt = require("jsonwebtoken");
const Session = require("../models/Session.js");

const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const token = header.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Check session ID from JWT
    if (!decoded.sessionId) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    // Check whether session is still active
    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      user: decoded.userId,
      status: "active",
    });

    if (!session) {
      return res.status(401).json({
        message: "Session expired or terminated",
      });
    }

    // Update last activity time
    session.lastActiveAt = new Date();
    await session.save();

    req.userId = decoded.userId;
    req.sessionId = decoded.sessionId;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = { protect };