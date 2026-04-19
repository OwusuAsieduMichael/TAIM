import {
  BarChart3,
  Download,
  FileSpreadsheet,
  LineChart,
  PieChart,
  Printer,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TeacherWorkspaceAssignment } from '@/features/teacher/types';

type Props = {
  assignment: TeacherWorkspaceAssignment | null;
  termLabel: string | null;
};

export function TeacherReportsView({ assignment, termLabel }: Props) {
  const classLine = assignment ? `${assignment.className} · ${assignment.subjectName}` : '—';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <header className="shrink-0 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--color-foreground)]">Reports</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Term summaries, exports, and printable views for this class. Built for quick review before parent meetings.
        </p>
        <dl className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Context</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{classLine}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Term</dt>
            <dd className="font-medium text-[var(--color-foreground)]">{termLabel ?? '—'}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
            <Users className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={2} />
          </div>
          <h3 className="mt-3 font-semibold text-[var(--color-foreground)]">Class roster</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Printable register with admission numbers and guardian placeholders.
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4 w-full gap-2" disabled>
            <Printer className="h-4 w-4" />
            Print preview
          </Button>
        </article>

        <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
            <LineChart className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={2} />
          </div>
          <h3 className="mt-3 font-semibold text-[var(--color-foreground)]">Performance trend</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Cohort CA/Exam curves and at-risk flags once analytics sync to this view.
          </p>
          <div className="mt-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)]">
            Chart area
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
            <PieChart className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={2} />
          </div>
          <h3 className="mt-3 font-semibold text-[var(--color-foreground)]">Grade distribution</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Histogram of published grades for this subject and term.
          </p>
          <div className="mt-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)]">
            Distribution
          </div>
        </article>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <FileSpreadsheet className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-foreground)]">Exports</h3>
              <p className="text-sm text-[var(--color-muted)]">
                CSV / Excel friendly dumps for attendance windows and mark sheets.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Attendance CSV
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Results CSV
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex gap-3">
          <BarChart3 className="h-5 w-5 shrink-0 text-[var(--color-primary)]" strokeWidth={2} />
          <div>
            <h3 className="font-semibold text-[var(--color-foreground)]">API and integrations</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
              Structured exports and webhooks are documented in the OpenAPI reference. Use them until in-app charts
              fully replace spreadsheet workflows.
            </p>
            <a
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-2 hover:decoration-[var(--color-primary)]"
              href="http://localhost:4000/api-docs"
              target="_blank"
              rel="noreferrer"
            >
              Open API documentation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
