import { ArrowUpRight, BookOpen, School, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Stat = { label: string; value: string; hint: string; to: string; icon: typeof School };

const STATS: Stat[] = [
  { label: 'Class coverage', value: '94%', hint: 'Subjects staffed vs required', to: '/app/dashboard/admin/classes', icon: School },
  { label: 'Teacher load', value: 'Balanced', hint: 'No critical overload flags', to: '/app/dashboard/admin/teachers', icon: UsersRound },
  { label: 'Curriculum depth', value: 'On track', hint: 'Core subjects mapped to terms', to: '/app/dashboard/admin/subjects', icon: BookOpen },
];

export function AdminPerformanceSummary() {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Performance summary</h2>
          <p className="text-xs text-[var(--color-muted)]">High-signal posture across structure and staffing</p>
        </div>
        <Link
          to="/app/dashboard/admin/reports"
          className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-rail-accent)] underline decoration-[var(--admin-rail-accent)]/30 underline-offset-4 hover:decoration-[var(--admin-rail-accent)]',
          )}
        >
          Open reports
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {STATS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className={cn(
              'student-interactive-well rounded-xl border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] p-4 transition-colors hover:bg-[var(--admin-rail-chip-hover)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)]',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-rail-muted)]">{s.label}</p>
              <s.icon className="h-4 w-4 text-[var(--admin-rail-accent)]" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-[var(--admin-rail-fg)]">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--admin-rail-muted)]">{s.hint}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
