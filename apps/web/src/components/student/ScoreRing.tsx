type Props = {
  /** 0–100 */
  value: number | null;
  size?: number;
  stroke?: number;
  className?: string;
};

export function ScoreRing({ value, size = 120, stroke = 8, className }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value === null ? 0 : Math.min(100, Math.max(0, value));
  const offset = c * (1 - pct / 100);

  return (
    <div className={`relative shrink-0 ${className ?? ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        {value === null ? (
          <span className="text-sm font-medium text-[var(--color-muted)]">—</span>
        ) : (
          <>
            <span className="tabular-nums text-2xl font-bold tracking-tight text-[var(--color-foreground)]">{Math.round(value)}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">avg %</span>
          </>
        )}
      </div>
    </div>
  );
}
