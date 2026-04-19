import { Award, BookOpen, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { StudentInsightBanner } from '@/components/student/StudentInsightBanner';
import { StudentServiceHub } from '@/components/student/StudentServiceHub';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useStudentMe, useStudentResults } from '@/hooks/useStudentPortal';
import { buildInsightBanner, writeInsightSnapshot } from '@/lib/studentInsights';
import { firstNameFromFull } from '@/lib/studentPortal';
import { performanceInsights } from '@/lib/studentPortal';

function attendanceLabel(status: string | null | undefined): { text: string; tone: 'success' | 'warning' | 'default' } {
  if (!status) return { text: 'Not marked yet', tone: 'default' };
  if (status === 'PRESENT') return { text: 'Present today', tone: 'success' };
  if (status === 'ABSENT') return { text: 'Absent today', tone: 'warning' };
  if (status === 'LATE') return { text: 'Late today', tone: 'warning' };
  if (status === 'EXCUSED') return { text: 'Excused today', tone: 'default' };
  return { text: status, tone: 'default' };
}

export function StudentHomePage() {
  const online = useOnlineStatus();
  const { data: me, isLoading: meLoading } = useStudentMe();
  const { data: resultsRes, isLoading: resLoading } = useStudentResults();
  const rows = resultsRes?.data ?? [];
  const insights = performanceInsights(rows);
  const st = me?.student;
  const att = attendanceLabel(st?.attendanceToday ?? null);

  const insightModel = buildInsightBanner({
    online,
    rows,
    average: insights.average,
    weakSubject: insights.weak?.subject,
    bestSubject: insights.best?.subject,
  });

  useEffect(() => {
    if (resLoading || insights.average === null) return;
    const id = window.setTimeout(() => writeInsightSnapshot(insights.average!, rows.length), 4000);
    return () => window.clearTimeout(id);
  }, [resLoading, insights.average, rows.length]);

  const classLine =
    st?.classLevel && st?.className
      ? `${st.classLevel} · ${st.className}${st?.schoolName ? ` · ${st.schoolName}` : ''}`
      : st?.className
        ? `${st.className}${st?.schoolName ? ` · ${st.schoolName}` : ''}`
        : st?.schoolName ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-8 sm:px-6 sm:pt-6">
      <StudentInsightBanner model={insightModel} />

      <header className="mb-6 border-b border-[var(--color-border)] pb-5">
        {meLoading ? (
          <div className="space-y-2">
            <div className="h-5 w-52 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-black/[0.05] dark:bg-white/[0.06]" />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
              Welcome, {firstNameFromFull(me?.fullName ?? '')}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              {classLine ?? 'Student portal'} · {att.text}
            </p>
          </>
        )}
      </header>

      <section className="mb-7">
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
            hint={insights.best ? `${insights.best.score}%` : 'No score yet'}
            tone="success"
            className="student-interactive-well"
          />
          <StatCard
            icon={BookOpen}
            label="Focus area"
            value={resLoading ? '…' : insights.weak?.subject ?? '—'}
            hint={insights.weak ? `${insights.weak.score}%` : 'Keep consistency'}
            tone={insights.weak ? 'warning' : 'default'}
            className="student-interactive-well"
          />
        </div>
      </section>

      <div className="mt-2">
        <StudentServiceHub average={insights.average} />
      </div>
    </div>
  );
}
