import { localDateKey } from '@/lib/teacherLocalDate';

export type AttendanceTrendPoint = {
  date: string;
  label: string;
  present: number;
  total: number;
  ratePct: number;
};

export type ClassPerformancePoint = {
  classId: string;
  className: string;
  averageScore: number;
  subjectsAssessed: number;
};

export type AttendanceClassSlice = {
  className: string;
  ratePct: number;
  present: number;
  total: number;
};

export type AttendanceAnalysis = {
  points: AttendanceTrendPoint[];
  averageRate: number;
  peak: AttendanceTrendPoint | null;
  lowest: AttendanceTrendPoint | null;
  weekDeltaPct: number | null;
  classSlices: AttendanceClassSlice[];
};

export type PerformanceAnalysis = {
  classes: ClassPerformancePoint[];
  schoolAverage: number;
  topClass: ClassPerformancePoint | null;
  needsAttention: ClassPerformancePoint[];
};

type AttRow = { date?: string; status?: string; classId?: string | null; studentId?: string };
type ClassRow = { id: string; name: string };
type ResultRow = { classId?: string | null; finalScore?: number; published?: boolean | string };
type StudentRow = { id: string; classId?: string | null };

function dateLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
}

export function lastNDates(n: number, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    out.push(localDateKey(d));
  }
  return out;
}

export function aggregateAttendanceTrend(rows: AttRow[], days = 14): AttendanceAnalysis {
  const dates = lastNDates(days);
  const byDate = new Map<string, { present: number; total: number }>();
  dates.forEach((d) => byDate.set(d, { present: 0, total: 0 }));

  rows.forEach((r) => {
    const key = String(r.date ?? '').slice(0, 10);
    if (!byDate.has(key)) return;
    const bucket = byDate.get(key)!;
    bucket.total += 1;
    if ((r.status ?? 'PRESENT') === 'PRESENT') bucket.present += 1;
  });

  const points: AttendanceTrendPoint[] = dates.map((date) => {
    const bucket = byDate.get(date)!;
    const ratePct = bucket.total > 0 ? Math.round((bucket.present / bucket.total) * 100) : 0;
    return { date, label: dateLabel(date), present: bucket.present, total: bucket.total, ratePct };
  });

  const withMarks = points.filter((p) => p.total > 0);
  const averageRate =
    withMarks.length > 0
      ? Math.round(withMarks.reduce((sum, p) => sum + p.ratePct, 0) / withMarks.length)
      : 0;

  const peak = withMarks.length ? [...withMarks].sort((a, b) => b.ratePct - a.ratePct)[0]! : null;
  const lowest = withMarks.length ? [...withMarks].sort((a, b) => a.ratePct - b.ratePct)[0]! : null;

  const recent = withMarks.slice(-7);
  const prior = withMarks.slice(-14, -7);
  const recentAvg =
    recent.length > 0 ? recent.reduce((s, p) => s + p.ratePct, 0) / recent.length : null;
  const priorAvg =
    prior.length > 0 ? prior.reduce((s, p) => s + p.ratePct, 0) / prior.length : null;
  const weekDeltaPct =
    recentAvg != null && priorAvg != null ? Math.round(recentAvg - priorAvg) : null;

  return { points, averageRate, peak, lowest, weekDeltaPct, classSlices: [] };
}

export function aggregateAttendanceByClass(
  rows: AttRow[],
  classes: ClassRow[],
  students: StudentRow[],
  days = 14,
): AttendanceClassSlice[] {
  const cutoff = lastNDates(days)[0]!;
  const studentClass = new Map(students.map((s) => [s.id, s.classId ?? null]));
  const classNames = new Map(classes.map((c) => [c.id, c.name]));
  const buckets = new Map<string, { present: number; total: number }>();

  rows.forEach((r) => {
    const key = String(r.date ?? '').slice(0, 10);
    if (key < cutoff) return;
    const classId = r.classId ?? studentClass.get(String(r.studentId)) ?? 'unassigned';
    const name = classId === 'unassigned' ? 'Unassigned' : (classNames.get(String(classId)) ?? 'Class');
    const bucket = buckets.get(name) ?? { present: 0, total: 0 };
    bucket.total += 1;
    if ((r.status ?? 'PRESENT') === 'PRESENT') bucket.present += 1;
    buckets.set(name, bucket);
  });

  return [...buckets.entries()]
    .map(([className, b]) => ({
      className,
      present: b.present,
      total: b.total,
      ratePct: b.total > 0 ? Math.round((b.present / b.total) * 100) : 0,
    }))
    .sort((a, b) => b.ratePct - a.ratePct);
}

export function aggregateClassPerformance(
  results: ResultRow[],
  classes: ClassRow[],
): PerformanceAnalysis {
  const classNames = new Map(classes.map((c) => [c.id, c.name]));
  const buckets = new Map<string, number[]>();

  results.forEach((r) => {
    const published = r.published === true || String(r.published) === 'true';
    if (!published || r.classId == null) return;
    const scores = buckets.get(String(r.classId)) ?? [];
    scores.push(Number(r.finalScore));
    buckets.set(String(r.classId), scores);
  });

  const classesOut: ClassPerformancePoint[] = [...buckets.entries()].map(([classId, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      classId,
      className: classNames.get(classId) ?? classId,
      averageScore: Math.round(avg),
      subjectsAssessed: scores.length,
    };
  });

  classesOut.sort((a, b) => b.averageScore - a.averageScore);

  const schoolAverage =
    classesOut.length > 0
      ? Math.round(classesOut.reduce((s, c) => s + c.averageScore, 0) / classesOut.length)
      : 0;

  return {
    classes: classesOut,
    schoolAverage,
    topClass: classesOut[0] ?? null,
    needsAttention: classesOut.filter((c) => c.averageScore < 65),
  };
}

/** Realistic preview dataset aligned with admin mock snapshot (~93% attendance). */
export function mockAttendanceAnalysis(days = 14): AttendanceAnalysis {
  const rates = [91, 93, 89, 94, 92, 88, 90, 93, 95, 91, 89, 92, 94, 93];
  const totalPerDay = 220;
  const dates = lastNDates(days);
  const points: AttendanceTrendPoint[] = dates.map((date, i) => {
    const ratePct = rates[i % rates.length]!;
    const present = Math.round((ratePct / 100) * totalPerDay);
    return {
      date,
      label: dateLabel(date),
      present,
      total: totalPerDay,
      ratePct,
    };
  });

  const classSlices: AttendanceClassSlice[] = [
    { className: 'JHS 1A', ratePct: 96, present: 28, total: 29 },
    { className: 'JHS 1B', ratePct: 94, present: 27, total: 29 },
    { className: 'JHS 2A', ratePct: 91, present: 25, total: 27 },
    { className: 'JHS 2B', ratePct: 93, present: 26, total: 28 },
    { className: 'JHS 3A', ratePct: 88, present: 24, total: 27 },
  ];

  return {
    points,
    averageRate: 92,
    peak: points[8] ?? null,
    lowest: points[5] ?? null,
    weekDeltaPct: 2,
    classSlices,
  };
}

export function mockPerformanceAnalysis(): PerformanceAnalysis {
  const classes: ClassPerformancePoint[] = [
    { classId: 'c1', className: 'JHS 1A', averageScore: 78, subjectsAssessed: 42 },
    { classId: 'c2', className: 'JHS 1B', averageScore: 74, subjectsAssessed: 40 },
    { classId: 'c3', className: 'JHS 2A', averageScore: 71, subjectsAssessed: 38 },
    { classId: 'c4', className: 'JHS 2B', averageScore: 69, subjectsAssessed: 36 },
    { classId: 'c5', className: 'JHS 3A', averageScore: 82, subjectsAssessed: 44 },
    { classId: 'c6', className: 'JHS 3B', averageScore: 64, subjectsAssessed: 35 },
  ];

  return {
    classes,
    schoolAverage: 73,
    topClass: classes[4]!,
    needsAttention: [classes[5]!],
  };
}

export function linePath(values: number[], w: number, h: number, pad = 10): string {
  if (values.length === 0) return '';
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const span = maxY - minY || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  return values
    .map((y, i) => {
      const x = pad + i * step;
      const py = pad + ((maxY - y) / span) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');
}
