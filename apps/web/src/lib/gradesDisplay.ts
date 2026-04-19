/** Mirrors API WAEC-style weighting for client-side previews (CA 30%, Exam 70%). */
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function scoreToGrade(score: number): number {
  if (score >= 90) return 1;
  if (score >= 80) return 2;
  if (score >= 70) return 3;
  if (score >= 65) return 4;
  if (score >= 60) return 5;
  if (score >= 55) return 6;
  if (score >= 50) return 7;
  if (score >= 45) return 8;
  return 9;
}

export function computeResultDisplay(caScore: number, examScore: number) {
  const ca = clamp(caScore, 0, 30);
  const ex = clamp(examScore, 0, 70);
  const finalScore = round1(ca + ex);
  const grade = scoreToGrade(finalScore);
  return { finalScore, grade };
}
