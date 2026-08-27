/**
 * Priority Scoring Engine for ResQNet Incidents
 * Dynamically computes a score from 0 to 100 based on severity, trapped count,
 * vulnerable count, total affected population, waiting time, and report confidence.
 */

export function calculatePriorityScore(incident) {
  const {
    severity = 'MEDIUM',
    peopleTrapped = 0,
    vulnerablePeople = 0,
    peopleAffected = 0,
    waitingTimeMinutes = 10,
    confidenceScore = 85
  } = incident;

  // 1. Severity Score (Max 35)
  let severityScore = 15;
  if (severity === 'CRITICAL') severityScore = 35;
  else if (severity === 'HIGH') severityScore = 26;
  else if (severity === 'MEDIUM') severityScore = 18;
  else if (severity === 'LOW') severityScore = 8;

  // 2. Trapped Population Score (Max 25)
  // 1 trapped person = 6pts, 2 = 12pts, 3+ = max 25pts
  const trappedScore = Math.min(25, Math.round(peopleTrapped * 6.5));

  // 3. Vulnerable Population Score (Max 20)
  // Elderly, children, injured
  const vulnerabilityScore = Math.min(20, Math.round(vulnerablePeople * 7.0));

  // 4. People Affected Score (Max 10)
  const affectedScore = Math.min(10, Math.round(peopleAffected * 0.4));

  // 5. Waiting Time Urgency Score (Max 10)
  // 5 mins = 2pts, 30 mins = 6pts, 60+ mins = 10pts
  const timeScore = Math.min(10, Math.round((waitingTimeMinutes / 60) * 10));

  // Raw sum out of 100
  let totalScore = severityScore + trappedScore + vulnerabilityScore + affectedScore + timeScore;
  totalScore = Math.min(100, Math.max(10, Math.round(totalScore)));

  // Component breakdown normalized to 0-100 bars for visual UI gauge
  const breakdown = {
    severity: Math.round((severityScore / 35) * 100),
    peopleAffected: Math.min(100, Math.round((peopleAffected / 30) * 100)),
    waitingTime: Math.min(100, Math.round((waitingTimeMinutes / 60) * 100)),
    vulnerability: Math.min(100, Math.round((vulnerablePeople / 5) * 100) || 40),
    confidence: confidenceScore
  };

  return {
    score: totalScore,
    breakdown,
    urgencyLabel: totalScore >= 85 ? 'CRITICAL EMERGENCY' : totalScore >= 70 ? 'HIGH PRIORITY' : totalScore >= 50 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'
  };
}
