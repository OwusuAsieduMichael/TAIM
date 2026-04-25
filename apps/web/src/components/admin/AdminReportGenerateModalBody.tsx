import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = { close: () => void };

const types = ['Performance', 'Attendance', 'Behaviour'];
const formats = ['PDF', 'CSV', 'XLSX'];

export function AdminReportGenerateModalBody({ close }: Props) {
  const [reportType, setReportType] = useState(types[0] ?? 'Performance');
  const [format, setFormat] = useState(formats[0] ?? 'PDF');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    close();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rep-type">Report type</Label>
          <select
            id="rep-type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rep-format">Format</Label>
          <select
            id="rep-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)]">Charts on this page update from the same filters once a report run is persisted.</p>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95">
          Queue report
        </Button>
      </div>
    </form>
  );
}
