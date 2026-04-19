import type { StudentResultApi } from '@/hooks/useStudentPortal';

export type StudentAchievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function computeStudentAchievements(
  rows: StudentResultApi[],
  attendanceRecent: { status: string }[] | undefined,
): StudentAchievement[] {
  const scores = rows.map((r) => r.finalScore);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const max = scores.length ? Math.max(...scores) : null;
  const min = scores.length ? Math.min(...scores) : null;
  const spread = max !== null && min !== null ? max - min : null;

  const recent = attendanceRecent ?? [];
  const last5 = recent.slice(0, 5);
  const perfectWeek =
    last5.length >= 3 && last5.every((r) => r.status === 'PRESENT' || r.status === 'EXCUSED');

  return [
    {
      id: 'first',
      title: 'First steps',
      description: 'Published results are visible for you.',
      unlocked: rows.length >= 1,
    },
    {
      id: 'scholar',
      title: 'Scholar',
      description: 'Overall average at or above 80%.',
      unlocked: avg !== null && avg >= 80,
    },
    {
      id: 'steady',
      title: 'Steady climb',
      description: 'Three or more subjects, each at 65% or higher.',
      unlocked: rows.length >= 3 && scores.every((s) => s >= 65),
    },
    {
      id: 'balanced',
      title: 'Balanced',
      description: 'Scores stay within 15 points across subjects.',
      unlocked: rows.length >= 2 && spread !== null && spread <= 15,
    },
    {
      id: 'peak',
      title: 'Peak performance',
      description: 'At least one subject at 95% or above.',
      unlocked: max !== null && max >= 95,
    },
    {
      id: 'presence',
      title: 'Present mind',
      description: 'Strong recent attendance streak in your register.',
      unlocked: perfectWeek,
    },
  ];
}
