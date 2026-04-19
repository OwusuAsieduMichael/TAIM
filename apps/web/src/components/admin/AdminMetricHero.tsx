import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: 'indigo' | 'success' | 'warning' | 'neutral';
};

const toneRing: Record<NonNullable<Props['tone']>, string> = {
  indigo: 'bg-[color-mix(in_oklch,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]',
  success: 'bg-[color-mix(in_oklch,var(--color-success)_14%,transparent)] text-[var(--color-success)]',
  warning: 'bg-[color-mix(in_oklch,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]',
  neutral: 'bg-[var(--color-muted)]/15 text-[var(--color-muted)]',
};

/** Large KPI tile for admin overview — minimal labels, strong number. */
export function AdminMetricHero({ label, value, hint, icon: Icon, tone = 'indigo' }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-6px_rgb(0_0_0/0.08)]',
        'transition-shadow duration-200 hover:shadow-[0_2px_8px_rgb(0_0_0/0.06),0_12px_32px_-8px_rgb(0_0_0/0.1)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">{label}</p>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-[var(--color-foreground)] sm:text-[2rem]">{value}</p>
          {hint ? <p className="text-xs font-medium text-[var(--color-muted)]">{hint}</p> : null}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', toneRing[tone])}>
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
