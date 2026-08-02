function compareHistory(previous, current) {
  if (!previous) {
    return {
      progress: "First assessment completed.",
      scoreChange: 0,
      recommendation:
        "Continue attending interviews to track your improvement."
    };
  }

  const scoreChange =
    current.placementScore - previous.placementScore;

  let progress = "";
  let recommendation = "";

  if (scoreChange > 0) {
    progress = `Improved by ${scoreChange}%`;
    recommendation =
      "Great progress! Continue improving your weak skills.";
  } else if (scoreChange < 0) {
    progress = `Dropped by ${Math.abs(scoreChange)}%`;
    recommendation =
      "Performance has decreased. Revise your weak areas and practice more interviews.";
  } else {
    progress = "No change";
    recommendation =
      "Maintain consistency and continue learning.";
  }

  return {
    scoreChange,
    progress,
    recommendation,
  };
}

module.exports = {
  compareHistory,
};