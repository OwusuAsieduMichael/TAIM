import { Flame, Lightbulb, Sparkles, Target, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { StudentResultApi } from '@/hooks/useStudentPortal';
import { computeStudentAchievements } from '@/lib/studentAchievements';
import { performanceInsights, type ResultScoreRow } from '@/lib/studentPortal';
import { getVisitStreak } from '@/lib/studentVisitStreak';
import { STUDY_TIPS } from '@/lib/studentStudyTips';
import { useStudentPrefsStore } from '@/store/studentPrefsStore';

const WELCOME_KEY = 'taim-student-welcome-dismissed';

type Props = {
  rows: StudentResultApi[];
  resLoading: boolean;
  attendanceRecent?: { status: string }[];
};

function attendanceMomentum(recent: { status: string }[]) {
  if (!recent.length) return null;
  const slice = recent.slice(0, 7);
  const ok = slice.filter((r) => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
  return { ok, total: slice.length };
}

export function StudentHomeEnhancements({ rows, resLoading, attendanceRecent }: Props) {
  const [streak, setStreak] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const weeklyGoalPct = useStudentPrefsStore((s) => s.weeklyGoalPct);
  const setWeeklyGoalPct = useStudentPrefsStore((s) => s.setWeeklyGoalPct);

  useEffect(() => {
    setStreak(getVisitStreak().count);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(WELCOME_KEY)) return;
      setWelcomeOpen(true);
    } catch {
      setWelcomeOpen(true);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % STUDY_TIPS.length);
    }, 42_000);
    return () => window.clearInterval(id);
  }, []);

  const insights = useMemo(() => performanceInsights(rows as ResultScoreRow[]), [rows]);
  const achievements = useMemo(
    () => computeStudentAchievements(rows, attendanceRecent),
    [rows, attendanceRecent],
  );
  const momentum = attendanceRecent?.length ? attendanceMomentum(attendanceRecent) : null;

  const goal = weeklyGoalPct ?? 75;
  const goalProgress =
    insights.average === null ? null : Math.min(100, Math.round((insights.average / goal) * 100));

  function dismissWelcome() {
    try {
      localStorage.setItem(WELCOME_KEY, '1');
    } catch {
      /* ignore */
    }
    setWelcomeOpen(false);
  }

  return (
    <div className="mb-8 space-y-4">
      {welcomeOpen ? (
        <div
          className="flex gap-3 rounded-2xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/8 p-4 motion-reduce:animate-none"
          style={{ animation: 'slide-up 260ms ease-out both' }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <Sparkles className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--color-foreground)]">Welcome to your upgraded portal</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
              Press <kbd className="rounded bg-black/[0.06] px-1 font-mono text-xs dark:bg-white/[0.1]">?</kbd> for shortcuts (including refresh),
              and track goals and streaks below.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissWelcome}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] dark:hover:bg-white/[0.08]"
            aria-label="Dismiss welcome tip"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            <Flame className="h-4 w-4 text-[var(--color-warning)]" strokeWidth={1.75} />
            Visit streak
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-foreground)]">{streak}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Consecutive days you opened the student portal.</p>
        </div>

        {momentum ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Attendance pulse</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-foreground)]">
              {momentum.ok}/{momentum.total}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">Present or excused in your latest recorded days.</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
            <Lightbulb className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Study tip</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)] transition-opacity duration-200 motion-reduce:transition-none">
              {STUDY_TIPS[tipIndex]}
            </p>
            <button
              type="button"
              onClick={() => setTipIndex((i) => (i + 1) % STUDY_TIPS.length)}
              className="mt-3 text-xs font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Next tip
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          <Target className="h-4 w-4 text-[var(--color-primary)]" strokeWidth={1.75} />
          Weekly average goal
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex min-w-[180px] flex-1 flex-col gap-2 text-xs text-[var(--color-muted)]">
            Target (%)
            <input
              type="range"
              min={55}
              max={95}
              step={1}
              value={goal}
              onChange={(e) => setWeeklyGoalPct(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
          </label>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-[var(--color-foreground)]">{goal}%</p>
            {!resLoading && goalProgress !== null ? (
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {goalProgress >= 100 ? (
                  <>
                    <span className="font-semibold text-[var(--color-success)]">Ahead of target</span> — keep the
                    momentum.
                  </>
                ) : (
                  <>
                    About <span className="font-semibold text-[var(--color-foreground)]">{goalProgress}%</span> of the
                    way to your target average.
                  </>
                )}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-muted)]">Scores will measure progress against your target.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          <Trophy className="h-4 w-4 text-[var(--color-warning)]" strokeWidth={1.75} />
          Achievements
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {achievements.map((a) => (
            <li
              key={a.id}
              className={
                a.unlocked
                  ? 'flex items-start gap-2 rounded-xl border border-[var(--color-success)]/35 bg-[var(--color-success)]/8 px-3 py-2.5 text-sm'
                  : 'flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm opacity-70'
              }
            >
              <span className="text-base" aria-hidden>
                {a.unlocked ? '✓' : '○'}
              </span>
              <div>
                <p className="font-semibold text-[var(--color-foreground)]">{a.title}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">{a.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
