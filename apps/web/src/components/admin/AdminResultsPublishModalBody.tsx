import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = { close: () => void };

const terms = ['Term 1', 'Term 2', 'Term 3'];
const classes = ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A'];

export function AdminResultsPublishModalBody({ close }: Props) {
  const [term, setTerm] = useState(terms[1] ?? 'Term 2');
  const [className, setClassName] = useState(classes[0] ?? 'JHS 1A');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    close();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="res-term">Term</Label>
          <select
            id="res-term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {terms.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="res-class">Class</Label>
          <select
            id="res-class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)]">Publishing runs validation first; wire to `/results` when the API is ready.</p>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95">
          Review &amp; publish
        </Button>
      </div>
    </form>
  );
}
