import { ChevronDown } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useLongPress } from '@/hooks/useLongPress';
import { cn } from '@/lib/utils';

export type StudentResultRow = {
  id: string;
  caScore: number;
  examScore: number;
  finalScore: number;
  grade: number;
  remark: string;
  subject: { name: string };
  term?: { name: string };
};

type Tier = 'excellent' | 'average' | 'needs';

function tierFromScore(score: number): Tier {
  if (score >= 80) return 'excellent';
  if (score >= 55) return 'average';
  return 'needs';
}

function tierLabel(t: Tier): string {
  if (t === 'excellent') return 'Excellent';
  if (t === 'average') return 'Average';
  return 'Needs improvement';
}

function recommendation(row: StudentResultRow): string {
  const n = row.subject.name;
  if (row.finalScore < 55) return `Schedule short revision blocks for ${n} — little steps beat last-minute rush.`;
  if (row.finalScore < 75) return `Review recent topics in ${n}; ask your teacher for one priority worksheet.`;
  return `Keep your rhythm in ${n} — steady effort keeps scores in the green.`;
}

type Props = { row: StudentResultRow };

export function StudentSubjectCard({ row }: Props) {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const ignoreToggleClick = useRef(false);
  const tier = tierFromScore(row.finalScore);

  const onLongPress = useCallback(() => {
    ignoreToggleClick.current = true;
    setPeek(true);
    window.setTimeout(() => {
      ignoreToggleClick.current = false;
    }, 450);
  }, []);

  const lp = useLongPress({ onLongPress });

  return (
    <>
      <div
        className={cn(
          'student-interactive-well overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_1px_2px_rgb(0_0_0/0.04)]',
          open && 'shadow-[0_6px_24px_rgb(0_0_0/0.1)]',
        )}
      >
        <button
          type="button"
          aria-expanded={open}
          {...lp}
          onClick={() => {
            if (ignoreToggleClick.current) return;
            setOpen((o) => !o);
          }}
          className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors active:bg-black/[0.04] sm:px-5 sm:py-5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold tracking-tight text-[var(--color-foreground)]">{row.subject.name}</p>
            {row.term?.name ? (
              <p className="mt-0.5 text-xs font-medium text-[var(--color-muted)]">{row.term.name}</p>
            ) : null}
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${Math.min(100, row.caScore)}%` }}
                />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-[var(--color-success)] transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${Math.min(100, row.examScore)}%` }}
                />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">Class · Exam preview</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="text-right">
              <p className="tabular-nums text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
                {row.finalScore}
                <span className="text-sm font-semibold text-[var(--color-muted)]">%</span>
              </p>
              <p className="text-xs font-medium text-[var(--color-muted)]">Grade {row.grade}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
                tier === 'excellent' && 'bg-[var(--color-success)]/14 text-[var(--color-success)]',
                tier === 'average' && 'bg-black/[0.07] text-[var(--color-muted)] dark:bg-white/[0.1]',
                tier === 'needs' && 'bg-[var(--color-warning)]/18 text-[var(--color-warning)]',
              )}
            >
              {tierLabel(tier)}
            </span>
            <ChevronDown
              className={cn('h-5 w-5 text-[var(--color-muted)] transition-transform duration-200', open && 'rotate-180')}
              strokeWidth={1.75}
            />
          </div>
        </button>
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-4 border-t border-[var(--color-border)] px-4 pb-5 pt-4 sm:px-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--color-background)] px-3 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Class score</p>
                  <p className="mt-1 tabular-nums text-lg font-semibold text-[var(--color-foreground)]">{row.caScore}%</p>
                </div>
                <div className="rounded-xl bg-[var(--color-background)] px-3 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Exam</p>
                  <p className="mt-1 tabular-nums text-lg font-semibold text-[var(--color-foreground)]">{row.examScore}%</p>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-primary)]/5 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">Tip</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-foreground)]">{recommendation(row)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Teacher remark</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-foreground)]">{row.remark}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {peek ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] motion-safe:animate-[fade-in_200ms_ease-out]" role="dialog" aria-label="Quick preview">
          <button type="button" className="absolute inset-0" aria-label="Close preview" onClick={() => setPeek(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-2xl motion-safe:animate-[slide-up_220ms_cubic-bezier(0.16,1,0.3,1)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Quick preview</p>
            <p className="mt-1 text-lg font-bold text-[var(--color-foreground)]">{row.subject.name}</p>
            <p className="mt-2 tabular-nums text-3xl font-bold text-[var(--color-primary)]">
              {row.finalScore}
              <span className="text-lg font-semibold text-[var(--color-muted)]">%</span>
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{tierLabel(tier)} · Grade {row.grade}</p>
            <p className="mt-3 text-sm text-[var(--color-foreground)]">{recommendation(row)}</p>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-foreground)] active:scale-[0.99] motion-reduce:transition-none"
              onClick={() => setPeek(false)}
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
