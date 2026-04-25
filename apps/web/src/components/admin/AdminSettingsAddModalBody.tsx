import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = { close: () => void };

const sections = ['School', 'Academics', 'Results', 'System'];

export function AdminSettingsAddModalBody({ close }: Props) {
  const [section, setSection] = useState(sections[0] ?? 'School');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    close();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="set-section">Section</Label>
        <select
          id="set-section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
        >
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="set-key">Setting key</Label>
        <Input id="set-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. attendance.lock_edits" className="h-11 rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="set-val">Value</Label>
        <Input id="set-val" value={value} onChange={(e) => setValue(e.target.value)} className="h-11 rounded-xl" placeholder="true / false / text" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95">
          Save setting
        </Button>
      </div>
    </form>
  );
}
