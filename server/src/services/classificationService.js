const classifyCandidate = (placementScore) => {
  if (placementScore >= 85) {
    return "Placement Ready";
  }

  if (placementScore >= 70) {
    return "High Potential Candidate";
  }

  if (placementScore >= 50) {
    return "Needs Improvement";
  }

  return "Not Ready";
};

module.exports = {
  classifyCandidate,
};