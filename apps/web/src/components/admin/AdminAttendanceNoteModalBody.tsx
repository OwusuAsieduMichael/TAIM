import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = { close: () => void };

const classes = ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A'];

export function AdminAttendanceNoteModalBody({ close }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [className, setClassName] = useState(classes[0] ?? 'JHS 1A');
  const [note, setNote] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    close();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="att-date">Date</Label>
          <Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="att-class">Class</Label>
          <select
            id="att-class"
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
      <div className="space-y-1.5">
        <Label htmlFor="att-note">Note for register (optional)</Label>
        <Input id="att-note" value={note} onChange={(e) => setNote(e.target.value)} className="h-11 rounded-xl" placeholder="Late arrivals, event day, etc." />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95">
          Open register
        </Button>
      </div>
    </form>
  );
}
