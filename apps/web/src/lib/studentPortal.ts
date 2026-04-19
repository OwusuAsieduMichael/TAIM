export function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstNameFromFull(fullName: string): string {
  const t = fullName.trim();
  if (!t) return 'there';
  return t.split(/\s+/)[0] ?? t;
}

export type ResultScoreRow = {
  subject: { name: string };
  finalScore: number;
  grade: number;
  remark: string;
};

export function performanceInsights(rows: ResultScoreRow[]): {
  best?: { subject: string; score: number };
  weak?: { subject: string; score: number };
  average: number | null;
} {
  if (rows.length === 0) return { average: null };
  let best = rows[0]!;
  let lowest = rows[0]!;
  for (const r of rows) {
    if (r.finalScore > best.finalScore) best = r;
    if (r.finalScore < lowest.finalScore) lowest = r;
  }
  const sum = rows.reduce((a, r) => a + r.finalScore, 0);
  const weak =
    lowest.finalScore < 70 ? { subject: lowest.subject.name, score: lowest.finalScore } : undefined;
  return {
    best: { subject: best.subject.name, score: best.finalScore },
    weak,
    average: Math.round((sum / rows.length) * 10) / 10,
  };
}

export function motivationalLine(insights: ReturnType<typeof performanceInsights>): string {
  if (insights.average === null) {
    return 'Your published results will show up here once teachers release them.';
  }
  if (insights.average >= 80 && insights.best) {
    return `You're doing great in ${insights.best.subject}. Keep it up.`;
  }
  if (insights.weak && insights.average < 65) {
    return `A little more focus on ${insights.weak.subject} could lift your overall average.`;
  }
  if (insights.best) {
    return `${insights.best.subject} is a strong subject for you right now.`;
  }
  return 'Stay consistent — small steps add up each term.';
}
