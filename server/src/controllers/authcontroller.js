const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User.js");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService.js");

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ======================================================
// Password Strength Validation
// ======================================================
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
};

// ======================================================
// Register
// ======================================================
const register = async (req, res) => {
  try {
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    console.log("REQUEST BODY:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Password strength check
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "Password does not meet security requirements",
        errors: passwordErrors,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({
      email: normalizedEmail,
    });

    if (exists) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken
      );
    } catch (emailError) {
      console.error(
        "Verification Email Error:",
        emailError.message
      );

      // Remove user if email could not be sent
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message:
          "Registration failed because verification email could not be sent",
      });
    }

    res.status(201).json({
      message:
        "Registration successful. Please verify your email before logging in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ======================================================
// Verify Email
// ======================================================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification token",
      });
    }

    // Check token expiry
    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "Verification token has expired. Please request a new verification email.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Verify Email Error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ======================================================
// Login
// ======================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("========== LOGIN ==========");
    console.log("Email received:", email);
    console.log("Password received:", password ? "YES" : "NO");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log("Normalized email:", normalizedEmail);

    const user = await User.findOne({
      email: normalizedEmail,
    });

    console.log("User found:", !!user);

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please check your email.",
      });
    }

    console.log("User email:", user.email);
    console.log("Email verified:", user.emailVerified);

    const passwordMatch = await user.comparePassword(password);

    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    const token = signToken(user._id.toString());

    console.log("✅ LOGIN SUCCESS");

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
// ======================================================
// Forgot Password
// ======================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether an account exists
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store HASHED token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    const resetExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetExpires;

    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(
        user.email,
        resetToken
      );
    } catch (emailError) {
      console.error(
        "Password Reset Email Error:",
        emailError.message
      );

      // Remove reset token if email failed
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save();

      return res.status(500).json({
        message:
          "Password reset email could not be sent",
      });
    }

    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// Reset Password
// ======================================================
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    // Password strength validation
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "Password does not meet security requirements",
        errors: passwordErrors,
      });
    }

    // Hash token received from frontend
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired password reset token",
      });
    }

    // Update password
    user.password = password;

    // Invalidate token immediately
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
// ======================================================
// Get Current User
// ======================================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// Export
// ======================================================
module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
};