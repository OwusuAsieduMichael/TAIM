import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AdminInsightAnalysisPanel } from '@/components/admin/AdminInsightAnalysisPanel';
import { useAdminInsightAnalytics } from '@/hooks/useAdminInsightAnalytics';
import { linePath } from '@/lib/adminInsightAnalytics';
import { cn } from '@/lib/utils';

type PanelKind = 'attendance' | 'performance';

export function AdminInsightCharts({ className }: { className?: string }) {
  const { loading, source, attendance, performance } = useAdminInsightAnalytics();
  const [panel, setPanel] = useState<PanelKind | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const w = 320;
  const h = 120;
  const pad = 10;
  const rates = attendance.points.map((p) => p.ratePct);
  const d = linePath(rates, w, h, pad);
  const areaD =
    rates.length > 0
      ? `${d} L${w - pad},${h - pad} L${pad},${h - pad} Z`
      : '';

  const maxBar = Math.max(...performance.classes.map((c) => c.averageScore), 1);

  function openAttendance(date?: string) {
    setSelectedDate(date ?? attendance.peak?.date ?? null);
    setPanel('attendance');
  }

  function openPerformance(classId?: string) {
    setSelectedClassId(classId ?? performance.topClass?.classId ?? null);
    setPanel('performance');
  }

  return (
    <>
      <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
        <InsightCard
          title="Attendance trend"
          subtitle={
            loading
              ? 'Loading register data…'
              : `${attendance.averageRate}% avg · last ${attendance.points.length} days`
          }
          delta={attendance.weekDeltaPct}
          onOpen={() => openAttendance()}
        >
          {loading ? (
            <div className="mt-4 h-[120px] animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/[0.08]" />
          ) : (
            <>
              <svg className="mt-4 w-full cursor-pointer" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Attendance trend">
                <defs>
                  <linearGradient id="adminLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.14 264)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="oklch(0.55 0.14 264)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {areaD ? <path d={areaD} fill="url(#adminLineGrad)" /> : null}
                <path
                  d={d}
                  fill="none"
                  stroke="oklch(0.48 0.14 264)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {attendance.points.map((p, i) => {
                  const minY = Math.min(...rates);
                  const maxY = Math.max(...rates);
                  const span = maxY - minY || 1;
                  const step = rates.length > 1 ? (w - pad * 2) / (rates.length - 1) : 0;
                  const x = pad + i * step;
                  const py = pad + ((maxY - p.ratePct) / span) * (h - pad * 2);
                  return (
                    <circle
                      key={p.date}
                      cx={x}
                      cy={py}
                      r={selectedDate === p.date ? 5 : 3.5}
                      className={cn(
                        'fill-[var(--color-card)] stroke-[oklch(0.48_0.14_264)] transition-all hover:r-[5]',
                        selectedDate === p.date && 'stroke-[2.5px]',
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(p.date);
                        openAttendance(p.date);
                      }}
                    />
                  );
                })}
              </svg>
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                Tap a point for day-level analysis · peak {attendance.peak?.ratePct ?? '—'}% on{' '}
                {attendance.peak?.label ?? '—'}
              </p>
            </>
          )}
        </InsightCard>

        <InsightCard
          title="Performance overview"
          subtitle={
            loading
              ? 'Loading published results…'
              : `${performance.schoolAverage}% school mean · ${performance.classes.length} classes`
          }
          onOpen={() => openPerformance()}
        >
          {loading ? (
            <div className="mt-4 h-32 animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/[0.08]" />
          ) : (
            <>
              <div className="mt-5 flex h-32 items-end justify-between gap-2 px-1">
                {performance.classes.map((c) => (
                  <button
                    key={c.classId}
                    type="button"
                    className="group flex min-w-0 flex-1 flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-rail-accent)] focus-visible:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPerformance(c.classId);
                    }}
                  >
                    <div
                      className={cn(
                        'w-full max-w-[2.75rem] rounded-t-md transition-all group-hover:brightness-110',
                        selectedClassId === c.classId
                          ? 'bg-[var(--admin-rail-accent)]'
                          : 'bg-[color-mix(in_oklch,var(--color-primary)_78%,oklch(0.92_0.02_264))] dark:bg-[color-mix(in_oklch,var(--color-primary)_55%,transparent)]',
                      )}
                      style={{ height: `${Math.max(12, (c.averageScore / maxBar) * 100)}%` }}
                      title={`${c.className}: ${c.averageScore}%`}
                    />
                    <span className="max-w-full truncate text-[10px] font-medium text-[var(--color-muted)]">
                      {c.className.replace(/^JHS\s/, '')}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                Tap a bar for class ranking · leader {performance.topClass?.className ?? '—'} (
                {performance.topClass?.averageScore ?? '—'}%)
              </p>
            </>
          )}
        </InsightCard>
      </div>

      {panel ? (
        <AdminInsightAnalysisPanel
          kind={panel}
          source={source}
          attendance={attendance}
          performance={performance}
          selectedDate={selectedDate}
          selectedClassId={selectedClassId}
          onClose={() => setPanel(null)}
        />
      ) : null}
    </>
  );
}

function InsightCard({
  title,
  subtitle,
  delta,
  onOpen,
  children,
}: {
  title: string;
  subtitle: string;
  delta?: number | null;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition-all',
        'hover:border-[var(--admin-rail-accent)]/35 hover:shadow-[0_8px_24px_-10px_rgb(0_0_0/0.15)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">{title}</p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--admin-rail-accent)] hover:bg-[var(--admin-rail-chip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-rail-accent)]"
        >
          View analysis
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {delta != null ? (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-semibold">
          {delta >= 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-amber-600" />
          )}
          <span className="text-[var(--color-muted)]">
            {delta >= 0 ? '+' : ''}
            {delta}% vs prior week
          </span>
        </div>
      ) : null}

      <div className="mt-1">{children}</div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-4 w-full rounded-xl border border-dashed border-[var(--color-border)] py-2 text-xs font-semibold text-[var(--color-muted)] transition-colors hover:border-[var(--admin-rail-accent)]/40 hover:bg-[var(--admin-rail-chip)]/30 hover:text-[var(--admin-rail-accent)]"
      >
        Open full analysis
      </button>
    </article>
  );
}
