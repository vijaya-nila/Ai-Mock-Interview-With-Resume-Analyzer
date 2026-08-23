const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["Student", "Mentor", "Administrator"],
    default: "Student",
  },

  emailVerificationToken: {
    type: String,
    default: null,
  },

  emailVerificationExpires: {
    type: Date,
    default: null,
  },

  // Day 2 - Password Reset
  passwordResetToken: {
    type: String,
    default: null,
  },

  passwordResetExpires: {
    type: Date,
    default: null,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  // Day 3 - Account Lockout
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },

  lockUntil: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Day 4 - Badges
  badges: {
    type: [String],
    default: [],
  },

  // Day 4 - Streak
  streak: {
    current: {
      type: Number,
      default: 0,
    },

    longest: {
      type: Number,
      default: 0,
    },

    lastInterviewDate: {
      type: Date,
      default: null,
    },
  },

  // Day 4 - Rank
  rank: {
    type: String,
    enum: ["Bronze", "Silver", "Gold", "Platinum"],
    default: "Bronze",
  },

  rankingHistory: [
    {
      rank: {
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Platinum"],
      },

      achievedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);