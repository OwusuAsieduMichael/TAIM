import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAdminSchoolSnapshot } from '@/hooks/useAdminSchoolSnapshot';

export type AdminModuleSummaryId =
  | 'students'
  | 'teachers'
  | 'classes'
  | 'subjects'
  | 'attendance'
  | 'results'
  | 'reports'
  | 'settings';

type Metric = { label: string; value: string; hint: string };

function fmt(n: number | null | undefined, loading: boolean) {
  if (loading) return '…';
  if (n === null || n === undefined) return '—';
  return String(n);
}

function avgClassSize(students: number | null, classes: number | null, loading: boolean) {
  if (loading) return '…';
  if (students == null || classes == null || classes === 0) return '—';
  return String(Math.max(1, Math.round(students / classes)));
}

export function AdminModuleSummaryBar({ moduleId }: { moduleId: AdminModuleSummaryId }) {
  const s = useAdminSchoolSnapshot();

  const metrics: Metric[] = useMemo(() => {
    if (s.isSuper) {
      return [
        { label: 'Organisations', value: fmt(s.schoolCount, s.isLoading), hint: 'Schools on platform' },
        { label: 'Scope', value: 'Platform', hint: 'Cross-tenant administration' },
        { label: 'Modules', value: '9', hint: 'Aligned admin workspaces' },
      ];
    }

    if (!s.isSchoolAdmin) {
      return [
        { label: 'Workspace', value: 'Limited', hint: 'Use an admin account for full metrics' },
        { label: 'Dashboard', value: '—', hint: 'KPIs unlock with school scope' },
        { label: 'Actions', value: '—', hint: 'Module tools below' },
      ];
    }

    const rate = s.attendanceRatePct == null ? '—' : `${s.attendanceRatePct}%`;
    const avg = avgClassSize(s.studentCount, s.classCount, s.isLoading);

    const commonTriple: Metric[] = [
      { label: 'Students', value: fmt(s.studentCount, s.isLoading), hint: 'Enrolled learners' },
      { label: 'Attendance today', value: rate, hint: `Present rate · ${s.today}` },
      { label: 'Classes', value: fmt(s.classCount, s.isLoading), hint: 'Active streams' },
    ];

    switch (moduleId) {
      case 'students':
        return [
          { label: 'Total students', value: fmt(s.studentCount, s.isLoading), hint: 'Directory size' },
          { label: 'Present today', value: fmt(s.presentToday, s.isLoading), hint: 'Across recorded marks' },
          { label: 'Avg. class size', value: avg, hint: 'Students ÷ classes' },
        ];
      case 'teachers':
        return [
          { label: 'Teaching staff', value: fmt(s.teacherCount, s.isLoading), hint: 'Unique assigned teachers' },
          { label: 'Assignments', value: fmt(s.teacherAssignmentRows, s.isLoading), hint: 'Subject-class links' },
          { label: 'Classes', value: fmt(s.classCount, s.isLoading), hint: 'Streams to cover' },
        ];
      case 'classes':
        return [
          { label: 'Classes', value: fmt(s.classCount, s.isLoading), hint: 'Cohorts / streams' },
          { label: 'Avg. class size', value: avg, hint: 'Students ÷ classes' },
          { label: 'Attendance today', value: rate, hint: 'School-wide pulse' },
        ];
      case 'subjects':
        return [
          { label: 'Students', value: fmt(s.studentCount, s.isLoading), hint: 'Learners in scope' },
          { label: 'Assignments', value: fmt(s.teacherAssignmentRows, s.isLoading), hint: 'Teaching coverage' },
          { label: 'Classes served', value: fmt(s.classCount, s.isLoading), hint: 'Structural reach' },
        ];
      case 'attendance':
        return [
          { label: 'Present', value: fmt(s.presentToday, s.isLoading), hint: 'Marked present today' },
          { label: 'Absent', value: fmt(s.absentToday, s.isLoading), hint: 'Marked absent / not present' },
          { label: 'Rate', value: rate, hint: 'Present ÷ marks' },
        ];
      case 'results':
        return [
          { label: 'Students', value: fmt(s.studentCount, s.isLoading), hint: 'Result recipients' },
          { label: 'Classes', value: fmt(s.classCount, s.isLoading), hint: 'Publish targets' },
          { label: 'Attendance', value: rate, hint: 'Readiness signal' },
        ];
      case 'reports':
        return commonTriple;
      case 'settings':
        return [
          { label: 'Students', value: fmt(s.studentCount, s.isLoading), hint: 'Data under governance' },
          { label: 'Teachers', value: fmt(s.teacherCount, s.isLoading), hint: 'Staff accounts' },
          { label: 'Classes', value: fmt(s.classCount, s.isLoading), hint: 'Structural records' },
        ];
      default:
        return commonTriple;
    }
  }, [moduleId, s]);

  return (
    <section
      className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklch,var(--admin-rail-chip)_55%,transparent)] p-4 shadow-sm backdrop-blur-sm sm:p-5"
      aria-label="Module summary aligned with dashboard intelligence"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-rail-muted)]">Live snapshot</p>
        <p className="text-xs text-[var(--admin-rail-muted)]">Same data layer as Dashboard KPIs</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              'rounded-xl border border-[var(--admin-rail-border)] bg-[var(--color-card)]/90 px-3 py-3 transition-colors',
              'hover:bg-[color-mix(in_oklch,var(--admin-rail-hover)_45%,transparent)]',
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-rail-muted)]">{m.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-[var(--admin-rail-fg)]">{m.value}</p>
            <p className="mt-0.5 text-xs text-[var(--admin-rail-muted)]">{m.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
