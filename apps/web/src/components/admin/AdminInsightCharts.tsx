import { cn } from '@/lib/utils';

/** Lightweight chart placeholders — readable at a glance; swap for Recharts later. */
export function AdminInsightCharts({ className }: { className?: string }) {
  const linePts = [72, 58, 64, 52, 48, 55, 44, 50, 46, 40, 38, 42, 36, 32];
  const w = 320;
  const h = 120;
  const pad = 8;
  const minY = Math.min(...linePts);
  const maxY = Math.max(...linePts);
  const span = maxY - minY || 1;
  const step = (w - pad * 2) / (linePts.length - 1);
  const d = linePts
    .map((y, i) => {
      const x = pad + i * step;
      const py = pad + ((maxY - y) / span) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');

  const bars = [38, 52, 44, 60, 48, 72, 56];

  return (
    <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <figure className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
        <figcaption className="text-sm font-semibold text-[var(--color-foreground)]">Attendance trend</figcaption>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">Last 14 days · sample curve</p>
        <svg className="mt-4 w-full" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Sample attendance trend line">
          <defs>
            <linearGradient id="adminLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.14 264)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="oklch(0.55 0.14 264)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L${w - pad},${h - pad} L${pad},${h - pad} Z`} fill="url(#adminLineGrad)" />
          <path d={d} fill="none" stroke="oklch(0.48 0.14 264)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </figure>

      <figure className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
        <figcaption className="text-sm font-semibold text-[var(--color-foreground)]">Performance overview</figcaption>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">By class cohort · sample bars</p>
        <div className="mt-5 flex h-32 items-end justify-between gap-2 px-1">
          {bars.map((hPct, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full max-w-[2.5rem] rounded-t-md bg-[color-mix(in_oklch,var(--color-primary)_78%,oklch(0.92_0.02_264))] dark:bg-[color-mix(in_oklch,var(--color-primary)_55%,transparent)]"
                style={{ height: `${hPct}%` }}
              />
              <span className="text-[10px] font-medium text-[var(--color-muted)]">C{i + 1}</span>
            </div>
          ))}
        </div>
      </figure>
    </div>
  );
}
