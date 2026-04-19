import { BookOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StudentResultsToolbar, type ResultsSortMode } from '@/components/student/StudentResultsToolbar';
import { StudentSubjectCard } from '@/components/student/StudentSubjectCard';
import { SubjectCarousel, SubjectCarouselItem } from '@/components/student/SubjectCarousel';
import type { StudentResultApi } from '@/hooks/useStudentPortal';
import { useStudentMe, useStudentResults } from '@/hooks/useStudentPortal';
import { buildStudentPerformanceSummary } from '@/lib/studentPerformanceSummary';

function sortRows(rows: StudentResultApi[], sort: ResultsSortMode): StudentResultApi[] {
  const copy = [...rows];
  if (sort === 'name') {
    copy.sort((a, b) => a.subject.name.localeCompare(b.subject.name));
    return copy;
  }
  if (sort === 'score_asc') {
    copy.sort((a, b) => a.finalScore - b.finalScore);
    return copy;
  }
  copy.sort((a, b) => b.finalScore - a.finalScore);
  return copy;
}

export function StudentResultsPage() {
  const { data, isLoading } = useStudentResults();
  const { data: me } = useStudentMe();
  const rows = data?.data ?? [];
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ResultsSortMode>('score_desc');
  const [copyDone, setCopyDone] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.subject.name.toLowerCase().includes(q));
  }, [rows, search]);

  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);

  async function onCopy() {
    const text = buildStudentPerformanceSummary(me?.fullName, sorted);
    try {
      await navigator.clipboard.writeText(text);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  }

  function onPrint() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 sm:max-w-2xl sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">Your results</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Tap a card to expand. Press and hold for a quick preview.</p>
      </header>

      <StudentResultsToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        rows={sorted}
        onCopy={onCopy}
        onPrint={onPrint}
        copyDone={copyDone}
      />

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-8 py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
            <BookOpen className="h-8 w-8 text-[var(--color-primary)]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--color-foreground)]">No results yet</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-muted)]">
              Your performance will appear here as soon as teachers publish grades. Check back after assessments.
            </p>
          </div>
        </div>
      )}

      {!isLoading && rows.length > 0 && sorted.length === 0 && (
        <p className="mb-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-4 py-6 text-center text-sm text-[var(--color-muted)]">
          No subjects match &quot;{search.trim()}&quot;. Try another search.
        </p>
      )}

      <div className="print:hidden">
        <SubjectCarousel>
          {sorted.map((row) => (
            <SubjectCarouselItem key={row.id}>
              <StudentSubjectCard row={row} />
            </SubjectCarouselItem>
          ))}
        </SubjectCarousel>
      </div>

      {/* Print-only clean sheet */}
      <div className="hidden print:block print:p-8">
        <h1 className="text-xl font-bold text-black">TAIM — Results</h1>
        <p className="mt-1 text-sm text-neutral-700">{me?.fullName ?? 'Student'}</p>
        <table className="mt-6 w-full border-collapse text-sm text-black">
          <thead>
            <tr className="border-b border-neutral-400">
              <th className="py-2 text-left font-semibold">Subject</th>
              <th className="py-2 text-right font-semibold">CA</th>
              <th className="py-2 text-right font-semibold">Exam</th>
              <th className="py-2 text-right font-semibold">Final</th>
            </tr>
          </thead>
          <tbody>
            {sortRows(rows, 'name').map((r) => (
              <tr key={r.id} className="border-b border-neutral-200">
                <td className="py-2 pr-2">{r.subject.name}</td>
                <td className="py-2 text-right tabular-nums">{r.caScore}</td>
                <td className="py-2 text-right tabular-nums">{r.examScore}</td>
                <td className="py-2 text-right font-semibold tabular-nums">{r.finalScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
