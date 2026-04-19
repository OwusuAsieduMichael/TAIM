import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  className?: string;
  tone?: 'default' | 'success' | 'warning';
};

const toneIcon: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-[var(--color-primary)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
};

export function StatCard({ label, value, hint, icon: Icon, className, tone = 'default' }: StatCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-[var(--color-border)] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_rgb(0_0_0/0.04)]',
        className,
      )}
    >
      <CardContent className="flex gap-4 p-5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/[0.08]',
            tone === 'success' && 'bg-[var(--color-success)]/10',
            tone === 'warning' && 'bg-[var(--color-warning)]/12',
          )}
        >
          <Icon className={cn('h-5 w-5', toneIcon[tone])} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--color-foreground)]">{value}</p>
          {hint ? <p className="text-xs text-[var(--color-muted)]">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
