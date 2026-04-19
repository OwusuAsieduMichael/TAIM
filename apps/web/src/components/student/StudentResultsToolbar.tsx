import { Copy, Printer, Search } from 'lucide-react';
import type { StudentResultApi } from '@/hooks/useStudentPortal';
import { cn } from '@/lib/utils';

export type ResultsSortMode = 'score_desc' | 'score_asc' | 'name';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  sort: ResultsSortMode;
  onSortChange: (v: ResultsSortMode) => void;
  rows: StudentResultApi[];
  onCopy: () => void;
  onPrint: () => void;
  copyDone: boolean;
};

export function StudentResultsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  rows,
  onCopy,
  onPrint,
  copyDone,
}: Props) {
  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subjects…"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            autoComplete="off"
          />
        </label>
        <div className="flex shrink-0 flex-wrap gap-2">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ResultsSortMode)}
            aria-label="Sort results"
            className="min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm font-medium text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <option value="score_desc">Score: high to low</option>
            <option value="score_asc">Score: low to high</option>
            <option value="name">Subject: A–Z</option>
          </select>
          <button
            type="button"
            onClick={onCopy}
            disabled={rows.length === 0}
            className="student-interactive-well inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm font-semibold text-[var(--color-foreground)] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50 dark:hover:bg-white/[0.06]"
          >
            <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
            {copyDone ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={onPrint}
            disabled={rows.length === 0}
            className="student-interactive-well inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm font-semibold text-[var(--color-foreground)] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50 dark:hover:bg-white/[0.06]"
          >
            <Printer className="h-4 w-4" strokeWidth={2} aria-hidden />
            Print
          </button>
        </div>
      </div>
      <p className={cn('text-xs text-[var(--color-muted)]', rows.length === 0 && 'hidden')}>
        Showing <span className="font-semibold text-[var(--color-foreground)]">{rows.length}</span> subject
        {rows.length === 1 ? '' : 's'}
      </p>
    </div>
  );
}
