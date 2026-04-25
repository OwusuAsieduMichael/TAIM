import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Mini month grid — links days to Attendance for quick drill-in. */
export function AdminDashboardCalendar({ anchorDate = new Date() }: { anchorDate?: Date }) {
  const { year, month, label, startWeekday, daysInMonth } = useMemo(() => {
    const y = anchorDate.getFullYear();
    const m = anchorDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const start = (first.getDay() + 6) % 7;
    return {
      year: y,
      month: m,
      label: first.toLocaleString(undefined, { month: 'long', year: 'numeric' }),
      startWeekday: start,
      daysInMonth: last.getDate(),
    };
  }, [anchorDate]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const cells: Array<{ key: string; day: number | null }> = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `pad-${i}`, day: null });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ key: `day-${d}`, day: d });
  }

  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Calendar</h2>
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {weekLabels.map((d, i) => (
          <div key={`w-${i}`} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell) =>
          cell.day == null ? (
            <div key={cell.key} className="aspect-square rounded-lg bg-transparent" />
          ) : (
            <Link
              key={cell.key}
              to="/app/dashboard/admin/attendance"
              className={cn(
                'flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold transition-colors',
                isToday(cell.day)
                  ? 'border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent-soft)] text-[var(--admin-rail-accent)] hover:bg-[color-mix(in_oklch,var(--admin-rail-accent-soft)_85%,var(--admin-rail-chip))]'
                  : 'border-transparent bg-[var(--color-muted)]/[0.06] text-[var(--color-foreground)] hover:border-[var(--admin-rail-border)] hover:bg-[var(--admin-rail-chip)]',
              )}
              aria-label={`Open attendance, day ${cell.day}`}
            >
              {cell.day}
            </Link>
          ),
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">Tip: today is highlighted — open attendance to drill into registers.</p>
    </section>
  );
}
