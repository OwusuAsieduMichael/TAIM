import { BookOpen, CalendarDays, Clock, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeacherWorkspaceClass, TeacherWorkspaceTerm } from '@/features/teacher/types';

export type TeacherSubjectTab = {
  id: string;
  name: string;
  code: string | null;
};

type Props = {
  classes: TeacherWorkspaceClass[];
  selectedClassId: string | null;
  onClassId: (id: string) => void;
  subjects?: TeacherSubjectTab[];
  selectedSubjectId?: string | null;
  onSubjectId?: (id: string) => void;
  /** When false, subject controls are hidden (e.g. attendance uses class + time + date + term only). */
  showSubject?: boolean;
  /** Session clock — UI only unless the API gains a time field. */
  showSessionTime?: boolean;
  sessionTime?: string;
  onSessionTime?: (t: string) => void;
  terms: TeacherWorkspaceTerm[];
  termId: string | null;
  onTermId: (id: string) => void;
  sessionDate: string;
  onSessionDate: (d: string) => void;
  compact?: boolean;
  showTerm?: boolean;
  showRegisterDate?: boolean;
  /** Label for the date field (e.g. "Date" on attendance, "Register date" elsewhere). */
  sessionDateLabel?: string;
};

export function TeacherContextBar({
  classes,
  selectedClassId,
  onClassId,
  subjects = [],
  selectedSubjectId = null,
  onSubjectId = () => {},
  showSubject = true,
  showSessionTime = false,
  sessionTime = '08:00',
  onSessionTime = () => {},
  terms,
  termId,
  onTermId,
  sessionDate,
  onSessionDate,
  compact,
  showTerm = true,
  showRegisterDate = true,
  sessionDateLabel = 'Register date',
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/80 p-4 shadow-sm backdrop-blur-sm',
        compact && 'p-3',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[12rem]">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} />
            Class
          </label>
          <select
            className={cn(
              'h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition-shadow',
              'focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25',
            )}
            value={selectedClassId ?? ''}
            onChange={(e) => onClassId(e.target.value)}
            disabled={classes.length === 0}
          >
            {classes.length === 0 ? <option value="">No classes</option> : null}
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.level ? ` (${c.level})` : ''}
              </option>
            ))}
          </select>
        </div>

        {showSubject ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[12rem]">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
              Subject
            </label>
            {subjects.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-muted)]">
                No subjects assigned to you for this class.
              </p>
            ) : (
              <select
                className={cn(
                  'h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition-shadow',
                  'focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25',
                )}
                value={selectedSubjectId ?? ''}
                onChange={(e) => onSubjectId(e.target.value)}
                aria-label="Subject"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.code ? ` (${s.code})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : showSessionTime ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[9rem] sm:max-w-[11rem]">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              <Clock className="h-3.5 w-3.5" strokeWidth={2} />
              Time
            </label>
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => onSessionTime(e.target.value)}
              className={cn(
                'h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition-shadow',
                'focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25',
              )}
              aria-label="Session time"
            />
          </div>
        ) : null}

        {showRegisterDate ? (
          <div className="flex min-w-0 flex-col gap-1.5 sm:w-44">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
              {sessionDateLabel}
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => onSessionDate(e.target.value)}
              className={cn(
                'h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition-shadow',
                'focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25',
              )}
            />
          </div>
        ) : null}

        {showTerm ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[10rem]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Term</span>
            <select
              className={cn(
                'h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition-shadow',
                'focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25',
              )}
              value={termId ?? ''}
              onChange={(e) => onTermId(e.target.value)}
              disabled={terms.length === 0}
            >
              {terms.length === 0 ? <option value="">No terms</option> : null}
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
