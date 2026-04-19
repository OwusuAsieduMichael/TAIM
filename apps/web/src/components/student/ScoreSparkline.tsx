type Props = { scores: number[]; className?: string };

/** Lightweight SVG trend — order matches input scores. */
export function ScoreSparkline({ scores, className }: Props) {
  if (scores.length < 2) {
    return (
      <div className={`flex h-14 items-center justify-center rounded-xl bg-[var(--color-background)] text-xs text-[var(--color-muted)] ${className ?? ''}`}>
        Add more subjects to see a trend line
      </div>
    );
  }
  const w = 280;
  const h = 56;
  const pad = 4;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min || 1;
  const pts = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (s - min) / span) * (h - pad * 2);
    return `${x},${y}`;
  });
  const d = `M ${pts.join(' L ')}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-14 w-full max-w-full ${className ?? ''}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.55 0.14 264)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.42 0.14 264)" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${w - pad} ${h} L ${pad} ${h} Z`}
        fill="url(#sparkGrad)"
        className="opacity-40 dark:opacity-30"
      />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]" />
    </svg>
  );
}
