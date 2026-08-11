const User = require("../models/User");
const Interview = require("../models/Interview");

const updateAchievements = async (userId) => {
  const user = await User.findById(userId);

  if (!user) return null;

  // Get completed interviews
  const interviews = await Interview.find({
    userId,
    isComplete: true,
  });

  const totalInterviews = interviews.length;

  const bestScore =
    totalInterviews > 0
      ? Math.max(...interviews.map((interview) => interview.score || 0))
      : 0;

  // -----------------------------
  // STREAK
  // -----------------------------

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = user.streak?.current || 0;

  if (user.streak?.lastInterviewDate) {
    const lastDate = new Date(user.streak.lastInterviewDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today - lastDate) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // Same day → don't increase streak
      currentStreak = currentStreak || 1;
    } else if (diffDays === 1) {
      // Consecutive day
      currentStreak += 1;
    } else {
      // Missed one or more days
      currentStreak = 1;
    }
  } else {
    // First interview
    currentStreak = 1;
  }

  user.streak.current = currentStreak;

  if (currentStreak > (user.streak.longest || 0)) {
    user.streak.longest = currentStreak;
  }

  user.streak.lastInterviewDate = today;

  // -----------------------------
  // RANK
  // -----------------------------

  if (bestScore >= 90 && totalInterviews >= 10) {
    user.rank = "Platinum";
  } else if (bestScore >= 80 && totalInterviews >= 5) {
    user.rank = "Gold";
  } else if (bestScore >= 70 && totalInterviews >= 3) {
    user.rank = "Silver";
  } else {
    user.rank = "Bronze";
  }

  // -----------------------------
  // BADGES
  // -----------------------------

  const badges = new Set(user.badges || []);

  if (totalInterviews >= 1) {
    badges.add("First Interview");
  }

  if (totalInterviews >= 5) {
    badges.add("5 Interviews");
  }

  if (totalInterviews >= 10) {
    badges.add("10 Interviews");
  }

  if (bestScore >= 80) {
    badges.add("High Scorer");
  }

  if (bestScore >= 90) {
    badges.add("Excellent Performer");
  }

  if (currentStreak >= 3) {
    badges.add("3 Day Streak");
  }

  if (currentStreak >= 7) {
    badges.add("7 Day Streak");
  }

  user.badges = [...badges];

  await user.save();

  return {
    rank: user.rank,
    badges: user.badges,
    currentStreak: user.streak.current,
    longestStreak: user.streak.longest,
    totalInterviews,
    bestScore,
  };
};

module.exports = {
  updateAchievements,
};