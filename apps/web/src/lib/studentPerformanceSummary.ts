import type { StudentResultApi } from '@/hooks/useStudentPortal';
import { performanceInsights } from '@/lib/studentPortal';

export function buildStudentPerformanceSummary(fullName: string | undefined, rows: StudentResultApi[]): string {
  const name = (fullName ?? 'Student').trim() || 'Student';
  const ins = performanceInsights(rows);
  const lines: string[] = [`TAIM — ${name} performance summary`];
  if (rows.length === 0) {
    lines.push('No published results yet.');
    return lines.join('\n');
  }
  lines.push(`Subjects: ${rows.length}`);
  if (ins.average !== null) lines.push(`Overall average: ${ins.average}%`);
  if (ins.best) lines.push(`Strongest: ${ins.best.subject} (${ins.best.score}%)`);
  if (ins.weak) lines.push(`Focus area: ${ins.weak.subject} (${ins.weak.score}%)`);
  lines.push('');
  lines.push('By subject:');
  for (const r of [...rows].sort((a, b) => a.subject.name.localeCompare(b.subject.name))) {
    lines.push(`• ${r.subject.name}: ${r.finalScore}% (CA ${r.caScore}, Exam ${r.examScore})`);
  }
  return lines.join('\n');
}
