import { Download, MoreHorizontal, Plus, Search } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminModuleSummaryBar, type AdminModuleSummaryId } from '@/components/admin/AdminModuleSummaryBar';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { cn } from '@/lib/utils';

type FilterConfig = {
  key: string;
  label: string;
  options: string[];
};

type RowData = Record<string, string>;

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  filters?: FilterConfig[];
  columns?: string[];
  rows?: RowData[];
  rowActions?: string[];
  /** Optional rich modal (includes its own actions). */
  renderModalBody?: (ctx: { close: () => void }) => ReactNode;
  /** Optional content below the main table (e.g. charts on Reports). */
  belowContent?: ReactNode;
  /** Live snapshot metrics aligned with the Dashboard intelligence layer. */
  summaryModule?: AdminModuleSummaryId;
};

const FALLBACK_COLUMNS = ['Name', 'Code', 'Owner', 'Status'];
const FALLBACK_ROWS: RowData[] = [
  { Name: 'JHS 1A', Code: 'CLS-101', Owner: 'Admin Desk', Status: 'Active' },
  { Name: 'JHS 1B', Code: 'CLS-102', Owner: 'Admin Desk', Status: 'Active' },
  { Name: 'JHS 2A', Code: 'CLS-201', Owner: 'Academic Board', Status: 'Inactive' },
  { Name: 'JHS 2B', Code: 'CLS-202', Owner: 'Academic Board', Status: 'Active' },
];

export function AdminModulePage({
  title,
  description,
  actions,
  primaryActionLabel = 'Add record',
  secondaryActionLabel = 'Export',
  filters = [],
  columns = FALLBACK_COLUMNS,
  rows = FALLBACK_ROWS,
  rowActions = ['Open', 'Edit', 'Archive'],
  renderModalBody,
  belowContent,
  summaryModule,
}: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [filterState, setFilterState] = useState<Record<string, string>>(
    Object.fromEntries(filters.map((f) => [f.key, f.options[0] ?? 'All'])),
  );
  const pageSize = 6;

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rowValues = Object.values(row).join(' ').toLowerCase();
      const matchQuery = query.trim().length === 0 || rowValues.includes(query.toLowerCase());
      const matchFilters = filters.every((filter) => {
        const selected = filterState[filter.key];
        if (!selected || selected.toLowerCase().startsWith('all')) return true;
        return Object.values(row).some((value) => value === selected);
      });
      return matchQuery && matchFilters;
    });
  }, [rows, query, filters, filterState]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  function resetFilters() {
    setQuery('');
    setFilterState(Object.fromEntries(filters.map((f) => [f.key, f.options[0] ?? 'All'])));
    setPage(1);
  }

  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={
          actions ?? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="student-interactive-well gap-2 border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)]"
              >
                <Download className="h-4 w-4" />
                {secondaryActionLabel}
              </Button>
              <Button
                type="button"
                className="student-interactive-well gap-2 border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95"
                onClick={() => setShowModal(true)}
              >
                <Plus className="h-4 w-4" />
                {primaryActionLabel}
              </Button>
            </div>
          )
        }
      />

      {summaryModule ? <AdminModuleSummaryBar moduleId={summaryModule} /> : null}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className={cn('grid gap-3', filters.length ? 'lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto]' : 'lg:grid-cols-[minmax(0,1fr)_auto]')}>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-11 rounded-xl border-[var(--color-border)] pl-9"
            />
          </label>
          {filters.slice(0, 3).map((filter) => (
            <select
              key={filter.key}
              value={filterState[filter.key] ?? filter.options[0]}
              onChange={(e) => {
                setFilterState((prev) => ({ ...prev, [filter.key]: e.target.value }));
                setPage(1);
              }}
              className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
            >
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ))}
          <Button type="button" variant="outline" onClick={resetFilters} className="h-11 rounded-xl border-[var(--color-border)] bg-[var(--color-background)] px-4">
            Clear
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--admin-rail-chip)]/55 text-left">
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    {column}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
                    No matching records for current filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => (
                  <tr key={`${Object.values(row).join('-')}-${idx}`} className="border-b border-[var(--color-border)]/70 transition-colors hover:bg-[color-mix(in_oklch,var(--admin-rail-hover)_62%,transparent)] last:border-b-0">
                    {columns.map((column) => {
                      const value = row[column] ?? '—';
                      const isStatus = column.toLowerCase().includes('status');
                      const positiveStatus = ['Active', 'Ready', 'Published', 'Complete'];
                      const isPositive = positiveStatus.includes(value);
                      return (
                        <td key={column} className="px-4 py-3.5 text-sm text-[var(--color-foreground)]">
                          {isStatus ? (
                            <span
                              className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium',
                                isPositive
                                  ? 'border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent-soft)] text-[var(--admin-rail-accent)]'
                                  : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted)]',
                              )}
                            >
                              <span className={cn('h-2 w-2 rounded-full', isPositive ? 'bg-[var(--admin-rail-accent)]' : 'bg-[var(--color-muted)]')} />
                              {value}
                            </span>
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3.5 text-right">
                      <details className="group relative inline-block">
                        <summary className="list-none">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-xl border-[var(--color-border)]">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open row actions</span>
                          </Button>
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-sm">
                          {rowActions.map((item) => (
                            <button key={item} type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--color-foreground)] hover:bg-[var(--admin-rail-hover)]">
                              {item}
                            </button>
                          ))}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
          <p className="text-xs text-[var(--color-muted)]">
            Showing {(safePage - 1) * pageSize + (paginatedRows.length ? 1 : 0)}-{(safePage - 1) * pageSize + paginatedRows.length} of {filteredRows.length}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
              Previous
            </Button>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              Page {safePage} of {totalPages}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      </section>

      {belowContent ? <div className="space-y-4">{belowContent}</div> : null}

      {showModal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm animate-in fade-in zoom-in-95 duration-200 sm:max-w-lg">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{primaryActionLabel}</h2>
            {renderModalBody ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">Complete the fields below — wire to your API when ready.</p>
            ) : (
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                This modal is ready for live form fields and API wiring for the {title} section.
              </p>
            )}
            <div className="mt-4">
              {renderModalBody ? renderModalBody({ close: () => setShowModal(false) }) : null}
            </div>
            {!renderModalBody ? (
              <div className="mt-5 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="button" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95" onClick={() => setShowModal(false)}>
                  Continue
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
