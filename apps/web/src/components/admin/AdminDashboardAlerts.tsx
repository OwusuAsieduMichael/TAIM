import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Bell, CheckCircle2, Clock } from 'lucide-react';
import type { AdminDashboardAlertItem } from '@/hooks/useAdminSchoolSnapshot';
import { cn } from '@/lib/utils';

type AlertTone = AdminDashboardAlertItem['tone'];

const DEFAULT_ALERTS: AdminDashboardAlertItem[] = [
  {
    id: 'a1',
    title: 'Attendance registers',
    detail: 'Review any incomplete class registers before end of day.',
    tone: 'warning',
  },
  {
    id: 'a2',
    title: 'Results publish queue',
    detail: 'Two cohorts are still in draft — validate scores before publishing.',
    tone: 'info',
  },
  {
    id: 'a3',
    title: 'Teacher assignments',
    detail: 'All JHS 2 classes have assigned subject teachers for Term 2.',
    tone: 'success',
  },
];

const toneIcon: Record<AlertTone, LucideIcon> = {
  info: Bell,
  warning: AlertTriangle,
  success: CheckCircle2,
};

const toneStyles: Record<AlertTone, string> = {
  info: 'border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] text-[var(--admin-rail-fg)]',
  warning: 'border-[color-mix(in_oklch,var(--color-warning)_35%,var(--color-border))] bg-[color-mix(in_oklch,var(--color-warning)_12%,transparent)] text-[var(--color-foreground)]',
  success: 'border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent-soft)] text-[var(--admin-rail-accent)]',
};

type Props = {
  items?: AdminDashboardAlertItem[];
};

export function AdminDashboardAlerts({ items = DEFAULT_ALERTS }: Props) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Alerts & reminders</h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          <Clock className="h-3 w-3" aria-hidden />
          Today
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((alert) => {
          const Icon = toneIcon[alert.tone];
          return (
            <li
              key={alert.id}
              className={cn('flex gap-3 rounded-xl border px-3 py-3 text-sm transition-colors', toneStyles[alert.tone])}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{alert.title}</p>
                <p className="mt-0.5 text-xs opacity-90">{alert.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
