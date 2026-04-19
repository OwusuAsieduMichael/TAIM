import { Check, Minus, X } from 'lucide-react';
import { useStudentMe } from '@/hooks/useStudentPortal';

function statusIcon(status: string | null | undefined) {
  if (!status) return <Minus className="h-4 w-4 text-[var(--color-muted)]" strokeWidth={2} />;
  if (status === 'PRESENT') return <Check className="h-4 w-4 text-[var(--color-success)]" strokeWidth={2.5} />;
  if (status === 'ABSENT') return <X className="h-4 w-4 text-[var(--color-destructive)]" strokeWidth={2.5} />;
  if (status === 'LATE') return <Minus className="h-4 w-4 text-[var(--color-warning)]" strokeWidth={2.5} />;
  return <Minus className="h-4 w-4 text-[var(--color-muted)]" strokeWidth={2} />;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
    EXCUSED: 'Excused',
  };
  return map[status] ?? status;
}

function formatShortDate(iso: string) {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function StudentAttendancePage() {
  const { data: me, isLoading } = useStudentMe();
  const st = me?.student;
  const recent = st?.attendanceRecent ?? [];

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 sm:max-w-2xl sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">Attendance</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">See how you&apos;ve been marked each day.</p>
      </header>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-black/[0.06]" />
      ) : (
        <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Today</p>
          <div className="mt-3 flex items-center gap-3">
            {statusIcon(st?.attendanceToday ?? '')}
            <p className="text-lg font-semibold text-[var(--color-foreground)]">
              {st?.attendanceToday ? statusLabel(st.attendanceToday) : 'Not marked yet'}
            </p>
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Your teacher records attendance during class. If this looks wrong, speak to them after lessons.
          </p>
        </div>
      )}

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Recent days</h2>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-black/[0.06]" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
          No attendance records yet. Once your teacher marks the register, you&apos;ll see it here.
        </p>
      ) : (
        <ul className="space-y-2 pb-4">
          {recent.map((row) => (
            <li
              key={row.date}
              className="student-interactive-well flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5"
            >
              <span className="text-sm font-medium text-[var(--color-foreground)]">{formatShortDate(row.date)}</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)]">
                {statusIcon(row.status)}
                {statusLabel(row.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
