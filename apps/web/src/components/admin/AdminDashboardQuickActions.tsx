import { CalendarCheck, GraduationCap, ScrollText, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const actions = [
  { to: '/app/dashboard/admin/students', label: 'Add / review students', icon: GraduationCap },
  { to: '/app/dashboard/admin/teachers', label: 'Manage teachers', icon: UsersRound },
  { to: '/app/dashboard/admin/attendance', label: 'Today’s attendance', icon: CalendarCheck },
  { to: '/app/dashboard/admin/results', label: 'Results & publish', icon: ScrollText },
] as const;

export function AdminDashboardQuickActions() {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Quick actions</h2>
        <p className="text-xs text-[var(--color-muted)]">Jump to frequent workflows</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'student-interactive-well flex items-center gap-3 rounded-xl border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] px-3 py-3 text-sm font-semibold text-[var(--admin-rail-fg)] transition-colors',
              'hover:bg-[var(--admin-rail-chip-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)]',
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-rail-border)] bg-[var(--color-background)]/80 text-[var(--admin-rail-accent)]">
              <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0 leading-snug">{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
