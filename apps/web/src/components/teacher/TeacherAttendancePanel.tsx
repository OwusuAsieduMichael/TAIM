import { useCallback, useEffect, useRef, useState } from 'react';
import { UserMinus, Users } from 'lucide-react';
import { postAttendanceBulk } from '@/features/teacher/api';
import type { TeacherWorkspaceStudent } from '@/features/teacher/types';
import { cn } from '@/lib/utils';
import { useTeacherToastStore } from '@/store/teacherToastStore';

type Status = 'PRESENT' | 'ABSENT';

type Props = {
  classId: string;
  sessionDate: string;
  students: TeacherWorkspaceStudent[];
  token: string | null;
  mock: boolean;
  /** When false (and not mock), attendance is not saved to the server — teacher has no assignment for this class. */
  canPersist?: boolean;
};

function storageKey(classId: string, date: string) {
  return `taim-teacher-attendance:${classId}:${date}`;
}

export function TeacherAttendancePanel({
  classId,
  sessionDate,
  students,
  token,
  mock,
  canPersist = true,
}: Props) {
  const pushToast = useTeacherToastStore((s) => s.push);
  const [map, setMap] = useState<Record<string, Status>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeX = useRef(0);

  useEffect(() => {
    const key = storageKey(classId, sessionDate);
    let initial: Record<string, Status> = {};
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Status>;
        if (parsed && typeof parsed === 'object') initial = parsed;
      }
    } catch {
      initial = {};
    }
    const next: Record<string, Status> = {};
    for (const s of students) {
      next[s.id] = initial[s.id] ?? 'PRESENT';
    }
    setMap(next);
    setSaveState('idle');
  }, [classId, sessionDate, students]);

  const persistLocal = useCallback(
    (m: Record<string, Status>) => {
      try {
        sessionStorage.setItem(storageKey(classId, sessionDate), JSON.stringify(m));
      } catch {
        /* ignore */
      }
    },
    [classId, sessionDate],
  );

  const flushSave = useCallback(async () => {
    const rows = students.map((s) => ({ studentId: s.id, status: map[s.id] ?? 'PRESENT' }));
    if (rows.length === 0) return;
    if (!mock && token && !canPersist) {
      setSaveState('idle');
      pushToast({
        tone: 'warning',
        title: 'Cannot save',
        detail: 'You are not assigned to this class. Ask your administrator to add a teaching assignment.',
      });
      return;
    }
    setSaveState('saving');
    try {
      if (mock || !token) {
        persistLocal(map);
        await new Promise((r) => setTimeout(r, 120));
        setSaveState('saved');
        pushToast({ tone: 'success', title: 'Saved ✓', detail: 'Preview mode — register stored on this device only.' });
        window.setTimeout(() => setSaveState('idle'), 1600);
        return;
      }
      await postAttendanceBulk(token, {
        date: sessionDate,
        classId,
        rows: rows.map((r) => ({ ...r, status: r.status === 'ABSENT' ? 'ABSENT' : 'PRESENT' })),
      });
      persistLocal(map);
      setSaveState('saved');
      pushToast({ tone: 'success', title: 'Attendance saved ✓', detail: `${rows.length} learners synced.` });
      window.setTimeout(() => setSaveState('idle'), 1600);
    } catch (e) {
      setSaveState('error');
      pushToast({
        tone: 'error',
        title: 'Could not save',
        detail: e instanceof Error ? e.message : 'Try again in a moment.',
      });
      window.setTimeout(() => setSaveState('idle'), 2400);
    }
  }, [canPersist, classId, map, mock, persistLocal, pushToast, sessionDate, students, token]);

  useEffect(() => {
    if (students.length === 0) return;
    if (!mock && !canPersist) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void flushSave();
    }, 480);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [map, flushSave, students.length, canPersist, mock]);

  function toggle(id: string) {
    setMap((m) => ({ ...m, [id]: m[id] === 'ABSENT' ? 'PRESENT' : 'ABSENT' }));
  }

  function markAllPresent() {
    const next: Record<string, Status> = { ...map };
    for (const s of students) next[s.id] = 'PRESENT';
    setMap(next);
    pushToast({ tone: 'info', title: 'All marked present', detail: 'Saving…' });
  }

  function markAllAbsent() {
    const next: Record<string, Status> = { ...map };
    for (const s of students) next[s.id] = 'ABSENT';
    setMap(next);
    pushToast({ tone: 'info', title: 'All marked absent', detail: 'Saving…' });
  }

  return (
    <section className="space-y-4" aria-labelledby="att-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="att-heading" className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">
            Attendance
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Tap a row to flip Present / Absent. Swipe horizontally on a row (mobile) to toggle. Everything saves
            automatically.
          </p>
          {!mock && !canPersist ? (
            <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-950 dark:text-amber-100">
              You are not assigned to this class — marks cannot be synced until your school links you to it.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={markAllPresent}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm font-semibold text-[var(--color-foreground)] shadow-sm transition active:scale-[0.98] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5"
          >
            <Users className="mr-2 h-4 w-4 text-[var(--color-primary)]" strokeWidth={2} />
            Mark all present
          </button>
          <button
            type="button"
            onClick={markAllAbsent}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-red-800/55 bg-red-600/12 px-4 text-sm font-extrabold tracking-tight text-red-950 shadow-sm transition active:scale-[0.98] hover:border-red-900/70 hover:bg-red-600/18 dark:border-red-500/50 dark:bg-red-950/35 dark:text-red-50 dark:hover:border-red-400/60 dark:hover:bg-red-950/50"
          >
            <UserMinus className="mr-2 h-4 w-4 text-red-800 dark:text-red-200" strokeWidth={2.5} />
            Mark all absent
          </button>
          <span
            className={cn(
              'inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold',
              saveState === 'saving' && 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
              saveState === 'saved' && 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
              saveState === 'error' && 'bg-red-500/15 text-red-800 dark:text-red-200',
              saveState === 'idle' && 'bg-black/[0.04] text-[var(--color-muted)] dark:bg-white/[0.06]',
            )}
            aria-live="polite"
          >
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : saveState === 'error' ? 'Error' : 'Auto-save on'}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        {students.map((s) => {
          const st = map[s.id] ?? 'PRESENT';
          const name = `${s.firstName} ${s.lastName}`.trim();
          return (
            <li key={s.id}>
              <button
                type="button"
                onPointerDown={(e) => {
                  swipeX.current = e.clientX;
                }}
                onPointerUp={(e) => {
                  const dx = e.clientX - swipeX.current;
                  if (Math.abs(dx) > 36) toggle(s.id);
                  else if (Math.abs(dx) <= 14) toggle(s.id);
                }}
                className={cn(
                  'flex w-full min-h-[52px] items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-black/[0.03] active:scale-[0.995] dark:hover:bg-white/[0.04]',
                  st === 'PRESENT' && 'bg-emerald-500/[0.07]',
                  st === 'ABSENT' && 'bg-red-500/[0.08]',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-foreground)]">{name}</p>
                  <p className="truncate text-xs text-[var(--color-muted)]">{s.admissionNumber}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide',
                    st === 'PRESENT' && 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
                    st === 'ABSENT' &&
                      'bg-red-800 text-white shadow-sm shadow-red-900/35 ring-1 ring-red-950/25 dark:bg-red-700 dark:ring-red-950/40',
                  )}
                >
                  {st === 'PRESENT' ? 'Present' : 'Absent'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
