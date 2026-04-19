import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchResultsForTerm, postResultUpsert } from '@/features/teacher/api';
import type { TeacherWorkspaceStudent } from '@/features/teacher/types';
import { computeResultDisplay } from '@/lib/gradesDisplay';
import { cn } from '@/lib/utils';
import { useTeacherToastStore } from '@/store/teacherToastStore';

type Props = {
  classId: string;
  subjectId: string;
  termId: string | null;
  students: TeacherWorkspaceStudent[];
  token: string | null;
  mock: boolean;
};

type Cell = { ca: string; exam: string; err?: string };

function parseScore(s: string, max: number): { ok: true; n: number } | { ok: false } {
  const t = s.trim();
  if (t === '') return { ok: true, n: 0 };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false };
  if (n < 0 || n > max) return { ok: false };
  return { ok: true, n };
}

export function TeacherResultsPanel({ classId, subjectId, termId, students, token, mock }: Props) {
  const pushToast = useTeacherToastStore((s) => s.push);
  const [scores, setScores] = useState<Record<string, Cell>>({});
  const [debouncers] = useState(() => ({
    current: {} as Record<string, ReturnType<typeof setTimeout>>,
  }));

  const { data: resultsRes } = useQuery({
    queryKey: ['teacher', 'results', termId, subjectId],
    queryFn: () => fetchResultsForTerm(token!, termId!),
    enabled: !!token && !mock && !!termId,
  });

  useEffect(() => {
    if (mock) {
      setScores((prev) => {
        const next: Record<string, Cell> = {};
        for (const s of students) next[s.id] = prev[s.id] ?? { ca: '', exam: '' };
        return next;
      });
      return;
    }
    const next: Record<string, Cell> = {};
    const rows = resultsRes?.data ?? [];
    const byStudent = new Map(rows.filter((r) => r.subjectId === subjectId).map((r) => [r.studentId, r]));
    for (const s of students) {
      const r = byStudent.get(s.id);
      next[s.id] = {
        ca: r ? String(r.caScore) : '',
        exam: r ? String(r.examScore) : '',
      };
    }
    setScores(next);
  }, [mock, students, resultsRes, subjectId]);

  const flushCell = useCallback(
    async (studentId: string, caStr: string, exStr: string) => {
      if (!termId) return;
      const ca = parseScore(caStr, 30);
      const ex = parseScore(exStr, 70);
      if (!ca.ok || !ex.ok) {
        setScores((prev) => ({
          ...prev,
          [studentId]: { ...prev[studentId], err: 'Use numbers within CA 0–30 and Exam 0–70.' },
        }));
        pushToast({ tone: 'error', title: 'Invalid score', detail: 'CA ≤ 30, Exam ≤ 70.' });
        return;
      }
      setScores((prev) => ({ ...prev, [studentId]: { ca: caStr, exam: exStr, err: undefined } }));
      if (mock || !token) {
        return;
      }
      try {
        await postResultUpsert(token, {
          studentId,
          subjectId,
          termId,
          classId,
          caScore: ca.n,
          examScore: ex.n,
        });
        pushToast({ tone: 'success', title: 'Results updated ✓', detail: 'Stored as draft until admin publishes.' });
      } catch (e) {
        pushToast({
          tone: 'error',
          title: 'Save failed',
          detail: e instanceof Error ? e.message : 'Try again.',
        });
      }
    },
    [classId, mock, pushToast, subjectId, termId, token],
  );

  function scheduleSave(studentId: string, cell: Cell) {
    if (debouncers.current[studentId]) clearTimeout(debouncers.current[studentId]);
    debouncers.current[studentId] = setTimeout(() => {
      void flushCell(studentId, cell.ca, cell.exam);
    }, 520);
  }

  function updateCell(studentId: string, field: 'ca' | 'exam', value: string) {
    setScores((prev) => {
      const cur = prev[studentId] ?? { ca: '', exam: '' };
      const next = { ...cur, [field]: value };
      const ca = parseScore(field === 'ca' ? value : next.ca, 30);
      const ex = parseScore(field === 'exam' ? value : next.exam, 70);
      let err: string | undefined;
      if (!ca.ok || !ex.ok) {
        if (next.ca.trim() !== '' || next.exam.trim() !== '') {
          err = 'Score cannot exceed max (CA 30, Exam 70).';
        }
      }
      const out = { ...next, err };
      scheduleSave(studentId, out);
      return { ...prev, [studentId]: out };
    });
  }

  const rows = useMemo(() => students.map((s, i) => ({ s, i })), [students]);

  function focusAt(index: number, field: 'ca' | 'exam') {
    const row = rows[index];
    if (!row) return;
    const el = document.getElementById(`score-${field}-${row.s.id}`) as HTMLInputElement | null;
    el?.focus();
    el?.select?.();
  }

  return (
    <section className="space-y-4" aria-labelledby="res-heading">
      <div>
        <h2 id="res-heading" className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">
          Results entry
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Inline scores · CA + Exam auto-total · Tab / Enter moves across cells · Auto-save on pause.
        </p>
      </div>

      {!termId ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-muted)]">
          Select a term to load and edit scores.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-black/[0.02] text-left text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] dark:bg-white/[0.03]">
                <th className="px-3 py-3 pl-4">Student</th>
                <th className="px-2 py-3">CA (30)</th>
                <th className="px-2 py-3">Exam (70)</th>
                <th className="px-3 py-3 pr-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ s, i }) => {
                const cell = scores[s.id] ?? { ca: '', exam: '' };
                const ca = parseScore(cell.ca, 30);
                const ex = parseScore(cell.exam, 70);
                const valid = ca.ok && ex.ok;
                const tot = valid ? computeResultDisplay(ca.n, ex.n) : null;
                const name = `${s.firstName} ${s.lastName}`.trim();
                return (
                  <tr
                    key={s.id}
                    className="border-b border-[var(--color-border)]/80 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-2 pl-4">
                      <p className="font-semibold text-[var(--color-foreground)]">{name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{s.admissionNumber}</p>
                      {cell.err ? <p className="mt-1 text-xs font-medium text-red-600">{cell.err}</p> : null}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        id={`score-ca-${s.id}`}
                        inputMode="decimal"
                        className={cn(
                          'h-11 w-full min-w-[4.5rem] rounded-xl border px-2 text-center font-semibold tabular-nums transition-shadow',
                          'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)]',
                          'focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30',
                          !ca.ok && cell.ca.trim() !== '' && 'border-red-500/60 ring-1 ring-red-500/20',
                        )}
                        value={cell.ca}
                        onChange={(e) => updateCell(s.id, 'ca', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            if (e.key === 'Enter') e.preventDefault();
                            focusAt(i, 'exam');
                          }
                        }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        id={`score-exam-${s.id}`}
                        inputMode="decimal"
                        className={cn(
                          'h-11 w-full min-w-[4.5rem] rounded-xl border px-2 text-center font-semibold tabular-nums transition-shadow',
                          'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)]',
                          'focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30',
                          !ex.ok && cell.exam.trim() !== '' && 'border-red-500/60 ring-1 ring-red-500/20',
                        )}
                        value={cell.exam}
                        onChange={(e) => updateCell(s.id, 'exam', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            focusAt(i + 1, 'ca');
                          }
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 pr-4 text-right">
                      <span className="text-base font-bold tabular-nums text-[var(--color-foreground)]">
                        {tot ? tot.finalScore : '—'}
                      </span>
                      {tot ? (
                        <span className="ml-2 text-xs font-medium text-[var(--color-muted)]">Gr {tot.grade}</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
