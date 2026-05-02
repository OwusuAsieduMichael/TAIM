import { ArrowRight, Award, BookOpen, CalendarDays, ChevronRight, IdCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScoreRing } from '@/components/student/ScoreRing';
import { ScoreSparkline } from '@/components/student/ScoreSparkline';
import type { StudentResultApi } from '@/hooks/useStudentPortal';
import { firstNameFromFull, motivationalLine, performanceInsights, timeGreeting } from '@/lib/studentPortal';
import { cn } from '@/lib/utils';

type AttTone = 'success' | 'warning' | 'default';

type Props = {
  meLoading: boolean;
  fullName: string | undefined;
  classLine: string | null;
  rows: StudentResultApi[];
  resLoading: boolean;
  meLoadingAtt: boolean;
  attendanceTodayText: string;
  attendanceTone: AttTone;
  attendanceRecent?: { date: string; status: string }[];
  passportPhotoUrl?: string | null;
};

function shortDay(iso: string) {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' });
  } catch {
    return iso;
  }
}

function statusLetter(status: string) {
  if (status === 'PRESENT') return 'P';
  if (status === 'ABSENT') return 'A';
  if (status === 'LATE') return 'L';
  if (status === 'EXCUSED') return 'E';
  return '—';
}

export function StudentDashboardBento({
  meLoading,
  fullName,
  classLine,
  rows,
  resLoading,
  meLoadingAtt,
  attendanceTodayText,
  attendanceTone,
  attendanceRecent,
  passportPhotoUrl,
}: Props) {
  const insights = performanceInsights(rows);
  const motivate = motivationalLine(insights);
  const sparkScores = rows.map((r) => r.finalScore);
  const recentFive = (attendanceRecent ?? []).slice(0, 5);

  return (
    <div className="space-y-10">
      <header className="border-b border-[var(--color-border)] pb-8">
        {meLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="h-8 w-64 max-w-full animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded bg-black/[0.05] dark:bg-white/[0.06]" />
          </div>
        ) : (
          <>
            <p className="text-xs font-medium text-[var(--color-muted)]">
              {timeGreeting()} · Student overview
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-2xl">
              {firstNameFromFull(fullName ?? '')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">{motivate}</p>
            {(classLine || rows.length > 0) && (
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-muted)]">
                {classLine ? (
                  <div>
                    <dt className="font-medium uppercase tracking-wide text-[var(--color-muted)]">Class</dt>
                    <dd className="mt-0.5 text-[var(--color-foreground)]">{classLine}</dd>
                  </div>
                ) : null}
                {rows.length > 0 ? (
                  <div>
                    <dt className="font-medium uppercase tracking-wide text-[var(--color-muted)]">Subjects</dt>
                    <dd className="mt-0.5 tabular-nums text-[var(--color-foreground)]">{rows.length} published</dd>
                  </div>
                ) : null}
              </dl>
            )}
            <div className="mt-5">
              <Link
                to="/app/student/results"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View all results
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </>
        )}
      </header>

      <section aria-labelledby="dash-metrics-heading">
        <h2 id="dash-metrics-heading" className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">
          Key metrics
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Award}
            label="Overall average"
            value={resLoading ? '…' : insights.average === null ? '—' : `${insights.average}%`}
            hint={rows.length ? `${rows.length} subject${rows.length === 1 ? '' : 's'}` : 'No published scores'}
            className="student-interactive-well"
          />
          <StatCard
            icon={TrendingUp}
            label="Strongest subject"
            value={resLoading ? '…' : insights.best?.subject ?? '—'}
            hint={insights.best ? `${insights.best.score}%` : '—'}
            tone="success"
            className="student-interactive-well"
          />
          <StatCard
            icon={BookOpen}
            label="Focus area"
            value={resLoading ? '…' : insights.weak?.subject ?? '—'}
            hint={insights.weak ? `${insights.weak.score}%` : 'No subjects below threshold'}
            tone={insights.weak ? 'warning' : 'default'}
            className="student-interactive-well sm:col-span-2 lg:col-span-1"
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <section
          className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] lg:col-span-8"
          aria-labelledby="dash-performance-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3.5 sm:px-6">
            <h2 id="dash-performance-heading" className="text-sm font-semibold text-[var(--color-foreground)]">
              Academic performance
            </h2>
            <Link
              to="/app/student/results"
              className="text-xs font-medium text-[var(--color-primary)] hover:underline sm:text-sm"
            >
              Details
            </Link>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
              <div className="flex flex-col items-center justify-center border-b border-[var(--color-border)] pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8">
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Overall score</p>
                {resLoading ? (
                  <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
                ) : (
                  <ScoreRing value={insights.average} size={120} stroke={8} />
                )}
                <p className="mt-4 max-w-[14rem] text-center text-xs leading-relaxed text-[var(--color-muted)]">
                  Based on published results only.
                </p>
              </div>
              <div className="flex min-h-[140px] flex-col">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                  Subject score trend
                </p>
                {resLoading ? (
                  <div className="flex-1 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
                ) : (
                  <ScoreSparkline scores={sparkScores} className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3" />
                )}
                <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted)]">
                  Points follow your subjects in the order returned by the system.
                </p>
              </div>
            </div>

            {!resLoading && rows.length === 0 ? (
              <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                <p className="text-sm font-medium text-[var(--color-foreground)]">No published scores</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  When teachers release grades, your average and trend will appear here.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <section
            className={cn(
              'overflow-hidden rounded-xl border bg-[var(--color-card)]',
              attendanceTone === 'success' && 'border-[var(--color-border)] lg:border-l-[3px] lg:border-l-[var(--color-success)]',
              attendanceTone === 'warning' && 'border-[var(--color-border)] lg:border-l-[3px] lg:border-l-[var(--color-warning)]',
              attendanceTone === 'default' && 'border-[var(--color-border)]',
            )}
            aria-labelledby="dash-att-heading"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
              <h2 id="dash-att-heading" className="text-sm font-semibold text-[var(--color-foreground)]">
                Attendance
              </h2>
              <CalendarDays className="h-4 w-4 text-[var(--color-muted)]" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="px-5 py-5">
              {meLoadingAtt ? (
                <div className="h-14 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
              ) : (
                <>
                  <p className="text-lg font-semibold text-[var(--color-foreground)] sm:text-xl">{attendanceTodayText}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
                    Marked by your teacher. Contact the school office if you believe this is incorrect.
                  </p>
                  {recentFive.length > 0 ? (
                    <div className="mt-5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                        Last {recentFive.length} days
                      </p>
                      <ul className="mt-2 divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-lg text-xs">
                        {recentFive.map((r) => (
                          <li key={r.date} className="flex items-center justify-between gap-2 px-3 py-2">
                            <span className="text-[var(--color-muted)]">{shortDay(r.date)}</span>
                            <span className="font-mono tabular-nums text-[var(--color-foreground)]">{statusLetter(r.status)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[10px] text-[var(--color-muted)]">P Present · A Absent · L Late · E Excused</p>
                    </div>
                  ) : null}
                  <Link
                    to="/app/student/attendance"
                    className="student-interactive-well mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                  >
                    Full attendance log
                    <ChevronRight className="h-4 w-4 opacity-60" strokeWidth={2} />
                  </Link>
                </>
              )}
            </div>
          </section>

          <section
            className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]"
            aria-labelledby="dash-records-heading"
          >
            <div className="border-b border-[var(--color-border)] px-5 py-3.5">
              <h2 id="dash-records-heading" className="text-sm font-semibold text-[var(--color-foreground)]">
                Records
              </h2>
            </div>
            <Link
              to="/app/student/profile"
              className="student-interactive-well flex items-center gap-3 rounded-xl px-5 py-4 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]">
                {passportPhotoUrl ? (
                  <img src={passportPhotoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <IdCard className="h-5 w-5 text-[var(--color-muted)]" strokeWidth={1.5} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-foreground)]">Profile &amp; identification</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">Account details and passport images</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted)]" strokeWidth={2} />
            </Link>
          </section>
        </aside>
      </div>

      <nav
        className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6"
        aria-label="Quick navigation"
      >
        <Link
          to="/app/student/results"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline"
        >
          Results
          <ChevronRight className="h-4 w-4 opacity-50" strokeWidth={2} />
        </Link>
        <Link
          to="/app/student/attendance"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline"
        >
          Attendance
          <ChevronRight className="h-4 w-4 opacity-50" strokeWidth={2} />
        </Link>
        <Link
          to="/app/student/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline"
        >
          Profile
          <ChevronRight className="h-4 w-4 opacity-50" strokeWidth={2} />
        </Link>
        <span className="text-sm text-[var(--color-muted)] sm:ml-auto">Practice module — coming soon</span>
      </nav>
    </div>
  );
}
