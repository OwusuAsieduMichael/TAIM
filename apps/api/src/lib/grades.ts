/**
 * WAEC-style: CA contributes 30%, Exam 70%. Final 0–100, grade 1–9, remark.
 */
export function computeResult(caScore: number, examScore: number): {
  finalScore: number;
  grade: number;
  remark: string;
} {
  const ca = clamp(caScore, 0, 30);
  const ex = clamp(examScore, 0, 70);
  const finalScore = round1(ca + ex);
  const grade = scoreToGrade(finalScore);
  return { finalScore, grade, remark: gradeToRemark(grade) };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function scoreToGrade(score: number): number {
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

export function gradeToRemark(grade: number): string {
  switch (grade) {
    case 1:
      return 'Outstanding';
    case 2:
      return 'Excellent';
    case 3:
      return 'Very Good';
    case 4:
      return 'Good';
    case 5:
      return 'Credit';
    case 6:
      return 'Credit';
    case 7:
      return 'Pass';
    case 8:
      return 'Weak Pass';
    default:
      return 'Fail';
  }
}
