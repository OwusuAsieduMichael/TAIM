import { ArrowUpRight, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import type { AttendanceAnalysis, ClassPerformancePoint, PerformanceAnalysis } from '@/lib/adminInsightAnalytics';
import { cn } from '@/lib/utils';

type PanelKind = 'attendance' | 'performance';

type Props = {
  kind: PanelKind;
  source: 'preview' | 'live' | 'unavailable';
  attendance: AttendanceAnalysis;
  performance: PerformanceAnalysis;
  selectedDate?: string | null;
  selectedClassId?: string | null;
  onClose: () => void;
};

function SourceBadge({ source }: { source: Props['source'] }) {
  const label =
    source === 'live' ? 'Live school data' : source === 'preview' ? 'Preview dataset' : 'Limited scope';
  return (
    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
    </span>
  );
}

function MetricTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[var(--color-foreground)]">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</p> : null}
    </div>
  );
}

export function AdminInsightAnalysisPanel({
  kind,
  source,
  attendance,
  performance,
  selectedDate,
  selectedClassId,
  onClose,
}: Props) {
  const selectedDay = attendance.points.find((p) => p.date === selectedDate) ?? null;
  const selectedClass =
    performance.classes.find((c) => c.classId === selectedClassId) ?? performance.topClass;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 px-0 backdrop-blur-[2px] sm:items-center sm:px-4">
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:max-w-3xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insight-panel-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="insight-panel-title" className="text-lg font-semibold text-[var(--color-foreground)]">
                {kind === 'attendance' ? 'Attendance analysis' : 'Performance analysis'}
              </h2>
              <SourceBadge source={source} />
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              {kind === 'attendance'
                ? 'Daily presence rates, class breakdown, and week-over-week movement.'
                : 'Published results averaged by class — identify leaders and intervention targets.'}
            </p>
          </div>
          <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-xl" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close analysis</span>
          </Button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {kind === 'attendance' ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricTile label="14-day average" value={`${attendance.averageRate}%`} hint="School-wide presence" />
                <MetricTile
                  label="Best day"
                  value={attendance.peak ? `${attendance.peak.ratePct}%` : '—'}
                  hint={attendance.peak ? attendance.peak.label : undefined}
                />
                <MetricTile
                  label="Week change"
                  value={
                    attendance.weekDeltaPct == null
                      ? '—'
                      : `${attendance.weekDeltaPct >= 0 ? '+' : ''}${attendance.weekDeltaPct}%`
                  }
                  hint="Last 7 vs prior 7 days"
                />
              </div>

              {selectedDay ? (
                <div className="rounded-xl border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)]/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-rail-muted)]">
                    Selected day · {selectedDay.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[var(--admin-rail-fg)]">{selectedDay.ratePct}% present</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {selectedDay.present} of {selectedDay.total} marks recorded
                  </p>
                </div>
              ) : null}

              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Daily register</h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border)]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Date</th>
                        <th className="px-4 py-2.5 font-semibold">Present</th>
                        <th className="px-4 py-2.5 font-semibold">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {[...attendance.points].reverse().map((p) => (
                        <tr
                          key={p.date}
                          className={cn(
                            p.date === selectedDate && 'bg-[var(--admin-rail-chip)]/50',
                          )}
                        >
                          <td className="px-4 py-2.5 font-medium">{p.label}</td>
                          <td className="px-4 py-2.5 text-[var(--color-muted)]">
                            {p.present}/{p.total}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={cn(
                                'font-semibold',
                                p.ratePct >= 90
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : p.ratePct >= 85
                                    ? 'text-[var(--color-foreground)]'
                                    : 'text-amber-700 dark:text-amber-400',
                              )}
                            >
                              {p.ratePct}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {attendance.classSlices.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">By class (14 days)</h3>
                  <ul className="mt-3 space-y-2">
                    {attendance.classSlices.map((c) => (
                      <li
                        key={c.className}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3"
                      >
                        <span className="font-medium">{c.className}</span>
                        <span className="text-sm font-semibold text-[var(--color-primary)]">{c.ratePct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {attendance.weekDeltaPct != null ? (
                <div className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] p-4 text-sm">
                  {attendance.weekDeltaPct >= 0 ? (
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  )}
                  <p className="text-[var(--color-muted)]">
                    Attendance {attendance.weekDeltaPct >= 0 ? 'improved' : 'softened'} by{' '}
                    <strong className="text-[var(--color-foreground)]">{Math.abs(attendance.weekDeltaPct)}%</strong> compared
                    with the previous week. Review classes below 85% for follow-up.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricTile label="School average" value={`${performance.schoolAverage}%`} hint="Published results" />
                <MetricTile
                  label="Top class"
                  value={performance.topClass?.className ?? '—'}
                  hint={
                    performance.topClass ? `${performance.topClass.averageScore}% mean score` : undefined
                  }
                />
                <MetricTile
                  label="Below target"
                  value={String(performance.needsAttention.length)}
                  hint="Classes under 65%"
                />
              </div>

              {selectedClass ? (
                <div className="rounded-xl border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)]/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-rail-muted)]">
                    Selected · {selectedClass.className}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[var(--admin-rail-fg)]">{selectedClass.averageScore}%</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Based on {selectedClass.subjectsAssessed} published result entries
                  </p>
                </div>
              ) : null}

              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Class ranking</h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border)]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Class</th>
                        <th className="px-4 py-2.5 font-semibold">Mean score</th>
                        <th className="px-4 py-2.5 font-semibold">Entries</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {performance.classes.map((c: ClassPerformancePoint, i) => (
                        <tr
                          key={c.classId}
                          className={cn(c.classId === selectedClassId && 'bg-[var(--admin-rail-chip)]/50')}
                        >
                          <td className="px-4 py-2.5 font-medium">
                            <span className="mr-2 text-[var(--color-muted)]">#{i + 1}</span>
                            {c.className}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-[var(--color-primary)]">{c.averageScore}%</td>
                          <td className="px-4 py-2.5 text-[var(--color-muted)]">{c.subjectsAssessed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {performance.needsAttention.length > 0 ? (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Intervention watchlist</p>
                  <p className="mt-1 text-amber-800/90 dark:text-amber-100/80">
                    {performance.needsAttention.map((c) => c.className).join(', ')} — schedule subject reviews and
                    parent briefings before the next publish window.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] p-4 text-sm">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-[var(--color-muted)]">
                    All tracked classes are above the 65% intervention threshold. Share highlights in your next staff
                    briefing.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:px-6">
          <p className="text-xs text-[var(--color-muted)]">Analysis updates when registers and published results change.</p>
          <div className="flex flex-wrap gap-2">
            {kind === 'attendance' ? (
              <Link
                to="/app/dashboard/admin/attendance"
                onClick={onClose}
                className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'rounded-xl')}
              >
                Open attendance
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                to="/app/dashboard/admin/reports"
                onClick={onClose}
                className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'rounded-xl')}
              >
                Open reports
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <Button type="button" className="rounded-xl border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
