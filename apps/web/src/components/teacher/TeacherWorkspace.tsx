import { useQuery } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { fetchTeacherWorkspace } from '@/features/teacher/api';
import { TEACHER_PREVIEW_WORKSPACE } from '@/features/teacher/previewWorkspace';
import type { TeacherSection, TeacherWorkspaceAssignment, TeacherWorkspaceClass } from '@/features/teacher/types';
import { localDateKey } from '@/lib/teacherLocalDate';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';
import { TeacherEveningSignOutBanner } from './TeacherEveningSignOutBanner';
import { TeacherAttendancePanel } from './TeacherAttendancePanel';
import { TeacherContextBar } from './TeacherContextBar';
import { TeacherReportsView } from './TeacherReportsView';
import { TeacherResultsPanel } from './TeacherResultsPanel';
import { TeacherSettingsPanel } from './TeacherSettingsPanel';
import { TeacherToastViewport } from './TeacherToastViewport';

const CTX_KEY = 'taim-teacher-context-v1';

function buildClassesFallback(assignments: TeacherWorkspaceAssignment[]): TeacherWorkspaceClass[] {
  const map = new Map<string, TeacherWorkspaceClass>();
  for (const a of assignments) {
    if (!map.has(a.classId)) {
      map.set(a.classId, {
        id: a.classId,
        name: a.className,
        level: a.classLevel,
        students: a.students,
      });
    }
  }
  return [...map.values()];
}

function loadTeacherSelection(
  assignments: TeacherWorkspaceAssignment[],
  classes: TeacherWorkspaceClass[],
): { classId: string | null; subjectId: string | null; termId: string | null; sessionTime: string } {
  const firstClassId = classes[0]?.id ?? assignments[0]?.classId ?? null;
  let classId = firstClassId;
  let subjectId: string | null =
    (classId ? assignments.find((a) => a.classId === classId)?.subjectId : null) ?? assignments[0]?.subjectId ?? null;
  let termId: string | null = assignments[0]?.terms[0]?.id ?? null;
  let sessionTime = '08:00';

  try {
    const raw = localStorage.getItem(CTX_KEY);
    if (!raw) return { classId, subjectId, termId, sessionTime };
    const parsed = JSON.parse(raw) as {
      classId?: string;
      subjectId?: string;
      termId?: string;
      assignmentId?: string;
      sessionTime?: string;
    };

    if (parsed.classId && classes.some((c) => c.id === parsed.classId)) {
      classId = parsed.classId;
    } else if (parsed.assignmentId) {
      const hit = assignments.find((a) => a.assignmentId === parsed.assignmentId);
      if (hit) {
        classId = hit.classId;
        subjectId = hit.subjectId;
      }
    }
    if (
      parsed.subjectId &&
      assignments.some((a) => a.classId === classId && a.subjectId === parsed.subjectId)
    ) {
      subjectId = parsed.subjectId;
    }
    const anyForClass = assignments.find((a) => a.classId === classId);
    if (parsed.termId && anyForClass?.terms.some((t) => t.id === parsed.termId)) {
      termId = parsed.termId;
    }
    if (typeof parsed.sessionTime === 'string') {
      const t = parsed.sessionTime.trim();
      const m = /^(\d{1,2}):(\d{2})$/.exec(t);
      if (m) {
        const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
        const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
        sessionTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      }
    }
  } catch {
    /* ignore */
  }

  return { classId, subjectId, termId, sessionTime };
}

type Props = {
  section: TeacherSection;
};

export function TeacherWorkspace({ section }: Props) {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const mock = isDevMockToken(token);

  const { data, isLoading, isPending, isError, error, isSuccess, refetch } = useQuery({
    queryKey: ['teacher', 'workspace'],
    queryFn: () => fetchTeacherWorkspace(token!),
    enabled: role === 'TEACHER' && !!token && !mock,
  });

  const assignments = mock ? TEACHER_PREVIEW_WORKSPACE.data : (data?.data ?? []);
  const classesFromApi = mock ? TEACHER_PREVIEW_WORKSPACE.classes : (data?.classes ?? []);

  const classes = useMemo(() => {
    if (classesFromApi.length > 0) return classesFromApi;
    return buildClassesFallback(assignments);
  }, [classesFromApi, assignments]);

  const assignmentKey = useMemo(() => assignments.map((a) => a.assignmentId).join(','), [assignments]);
  const classKey = useMemo(() => classes.map((c) => c.id).join(','), [classes]);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [termId, setTermId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState(() => localDateKey());
  const [sessionTime, setSessionTime] = useState('08:00');

  useLayoutEffect(() => {
    if (classes.length === 0 && assignments.length === 0) return;
    const sel = loadTeacherSelection(assignments, classes);
    setSelectedClassId(sel.classId);
    setSelectedSubjectId(sel.subjectId);
    setTermId(sel.termId);
    setSessionTime(sel.sessionTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- assignmentKey/classKey encode assignments+classes shape
  }, [assignmentKey, classKey]);

  const classIdResolved = selectedClassId ?? classes[0]?.id ?? assignments[0]?.classId ?? null;

  const subjectsInClass = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string | null }>();
    if (!classIdResolved) return [];
    for (const a of assignments) {
      if (a.classId !== classIdResolved) continue;
      if (!map.has(a.subjectId)) {
        map.set(a.subjectId, { id: a.subjectId, name: a.subjectName, code: a.subjectCode });
      }
    }
    return [...map.values()].sort((x, y) => x.name.localeCompare(y.name));
  }, [assignments, classIdResolved]);

  /** Stable signature so we do not re-run subject sync on every render (subjectsInClass is a new array each time). */
  const subjectOptionsSignature = useMemo(() => {
    if (!classIdResolved) return '';
    const ids = assignments
      .filter((a) => a.classId === classIdResolved)
      .map((a) => a.subjectId)
      .sort()
      .join('|');
    return `${classIdResolved}::${ids}`;
  }, [assignments, classIdResolved]);

  useEffect(() => {
    if (!classIdResolved) return;
    const rows = assignments.filter((a) => a.classId === classIdResolved);
    const idSet = new Set(rows.map((a) => a.subjectId));
    if (idSet.size === 0) {
      setSelectedSubjectId(null);
      return;
    }
    if (!selectedSubjectId || !idSet.has(selectedSubjectId)) {
      const sortedUnique = [...rows]
        .filter((a, i, arr) => arr.findIndex((x) => x.subjectId === a.subjectId) === i)
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
      setSelectedSubjectId(sortedUnique[0]?.subjectId ?? null);
    }
  }, [classIdResolved, subjectOptionsSignature, selectedSubjectId, assignments]);

  const subjectIdResolved = useMemo(() => {
    if (!classIdResolved) return null;
    if (
      selectedSubjectId &&
      assignments.some((a) => a.classId === classIdResolved && a.subjectId === selectedSubjectId)
    ) {
      return selectedSubjectId;
    }
    return assignments.find((a) => a.classId === classIdResolved)?.subjectId ?? null;
  }, [assignments, classIdResolved, selectedSubjectId]);

  const termsContext = useMemo(() => {
    if (!classIdResolved) return assignments[0] ?? null;
    const exact = assignments.find(
      (a) => a.classId === classIdResolved && a.subjectId === subjectIdResolved,
    );
    if (exact) return exact;
    return assignments.find((a) => a.classId === classIdResolved) ?? assignments[0] ?? null;
  }, [assignments, classIdResolved, subjectIdResolved]);

  useEffect(() => {
    if (!termsContext) return;
    if (!termId || !termsContext.terms.some((t) => t.id === termId)) {
      setTermId(termsContext.terms[0]?.id ?? null);
    }
  }, [termsContext, termId]);

  useEffect(() => {
    if (!classIdResolved) return;
    try {
      localStorage.setItem(
        CTX_KEY,
        JSON.stringify({
          classId: classIdResolved,
          subjectId: subjectIdResolved,
          termId,
          sessionTime,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [classIdResolved, subjectIdResolved, termId, sessionTime]);

  const termLabel = termsContext?.terms.find((t) => t.id === termId)?.name ?? null;

  const currentStudents = useMemo(
    () => classes.find((c) => c.id === classIdResolved)?.students ?? [],
    [classes, classIdResolved],
  );

  const reportsAssignment = useMemo(() => {
    if (!classIdResolved || !subjectIdResolved) return null;
    return (
      assignments.find((a) => a.classId === classIdResolved && a.subjectId === subjectIdResolved) ?? null
    );
  }, [assignments, classIdResolved, subjectIdResolved]);

  const canPersistAttendance = useMemo(
    () => !!classIdResolved && assignments.some((a) => a.classId === classIdResolved),
    [assignments, classIdResolved],
  );

  const titles: Record<TeacherSection, { title: string; description: string }> = {
    attendance: {
      title: 'Attendance',
      description: 'Tap rows to mark present or absent — auto-saves as you work.',
    },
    reports: {
      title: 'Reports',
      description: 'Exports, printables, and cohort views for this class.',
    },
    results: {
      title: 'Results',
      description: 'Enter CA and exam scores — keyboard-friendly grid with instant validation.',
    },
    settings: {
      title: 'Settings',
      description: 'Appearance, school context, and session options for your teacher workspace.',
    },
  };

  const meta = titles[section];

  if (section === 'settings') {
    return (
      <div className="relative">
        <TeacherToastViewport />
        <PageHeader title={meta.title} description={meta.description} />
        {mock ? (
          <p className="mb-6 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-950 dark:text-sky-100">
            <span className="font-semibold">Preview mode.</span> Data matches the seeded demo school. Use a real teacher
            sign-in to sync with your database.
          </p>
        ) : null}
        <TeacherSettingsPanel />
      </div>
    );
  }

  /** Show class/subject UI whenever preview is on, or API succeeded with at least one class or assignment. */
  const showWorkspace =
    mock || (isSuccess && (assignments.length > 0 || classes.length > 0));
  const contextReady = !!classIdResolved;

  return (
    <div className="relative">
      <TeacherToastViewport />

      <PageHeader title={meta.title} description={meta.description} />

      {!mock ? <TeacherEveningSignOutBanner /> : null}

      {mock ? (
        <p className="mb-6 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-950 dark:text-sky-100">
          <span className="font-semibold">Preview mode.</span> Data matches the seeded demo school. Use a real teacher
          sign-in to sync with your database.
        </p>
      ) : null}

      {!mock && (isLoading || isPending) ? (
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-64 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
      ) : null}

      {!mock && isError ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 px-6 py-5 text-sm text-[var(--color-foreground)]">
          <p className="font-semibold">Could not load teacher workspace</p>
          <p className="mt-2 text-[var(--color-muted)]">
            {error instanceof Error ? error.message : 'Check that the API is running and you are signed in as a teacher.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!mock && isSuccess && assignments.length === 0 && classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <p className="text-base font-semibold text-[var(--color-foreground)]">No classes or teaching assignments yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
            Your school has no classes in the system, and you are not linked to any class yet. An administrator can add
            classes and assign you to subjects — then run <span className="font-mono text-xs">npx prisma db seed</span>{' '}
            in <span className="font-mono text-xs">apps/api</span> for a full demo.
          </p>
        </div>
      ) : null}

      {!mock && isSuccess && classes.length > 0 && assignments.length === 0 ? (
        <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-[var(--color-foreground)]">
          You have no teaching assignments yet, but your school does list classes below. Ask an administrator to link
          you to the classes you teach — until then, subject tabs stay empty and attendance cannot be saved.
        </p>
      ) : null}

      {showWorkspace && contextReady ? (
        <div className="space-y-4">
          <TeacherContextBar
            classes={classes}
            selectedClassId={classIdResolved}
            onClassId={setSelectedClassId}
            subjects={subjectsInClass}
            selectedSubjectId={subjectIdResolved}
            onSubjectId={setSelectedSubjectId}
            showSubject={section !== 'attendance'}
            showSessionTime={section === 'attendance'}
            sessionTime={sessionTime}
            onSessionTime={setSessionTime}
            terms={termsContext?.terms ?? []}
            termId={termId}
            onTermId={setTermId}
            sessionDate={sessionDate}
            onSessionDate={setSessionDate}
            showTerm
            showRegisterDate={section === 'attendance'}
            sessionDateLabel={section === 'attendance' ? 'Date' : 'Register date'}
          />

          <div className="min-h-[min(70dvh,calc(100dvh-14rem))] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="min-h-0 min-w-0 bg-[var(--color-background)]">
              {section === 'attendance' ? (
                <div className="h-full max-h-[min(70dvh,calc(100dvh-14rem))] overflow-y-auto p-4 sm:p-6">
                  <TeacherAttendancePanel
                    classId={classIdResolved}
                    sessionDate={sessionDate}
                    students={currentStudents}
                    token={token}
                    mock={mock}
                    canPersist={canPersistAttendance}
                  />
                </div>
              ) : null}
              {section === 'reports' ? (
                <TeacherReportsView assignment={reportsAssignment} termLabel={termLabel} />
              ) : null}
              {section === 'results' ? (
                <div className="h-full max-h-[min(70dvh,calc(100dvh-14rem))] overflow-y-auto p-4 sm:p-6">
                  {subjectIdResolved ? (
                    <TeacherResultsPanel
                      classId={classIdResolved}
                      subjectId={subjectIdResolved}
                      termId={termId}
                      students={currentStudents}
                      token={token}
                      mock={mock}
                    />
                  ) : (
                    <p className="p-4 text-sm text-[var(--color-muted)]">
                      Pick a class that has at least one subject assigned to you to enter results.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
