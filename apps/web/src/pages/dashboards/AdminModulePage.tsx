import type { ReactNode } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
};

/** Placeholder shell for admin modules — table / forms ship incrementally on each route. */
export function AdminModulePage({ title, description, actions, children }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} action={actions} />
      {children ?? <AdminModuleSkeleton />}
    </div>
  );
}

function AdminModuleSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]/[0.06] px-4 py-3 sm:px-5">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>
      <div className="space-y-0 divide-y divide-[var(--color-border)] p-4 sm:p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-[min(100%,14rem)] animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="h-3 w-24 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
            <div className="hidden h-8 w-20 shrink-0 animate-pulse rounded-lg sm:block dark:bg-white/[0.08]" />
          </div>
        ))}
      </div>
      <p className={cn('border-t border-[var(--color-border)] px-4 py-3 text-center text-xs text-[var(--color-muted)] sm:px-5')}>
        Module UI loads here — search, filters, modals, and inline actions follow the same patterns as the dashboard shell.
      </p>
    </div>
  );
}
