import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = { close: () => void };

const levels = ['JHS 1', 'JHS 2', 'JHS 3'];

export function AdminClassCreateModalBody({ close }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState(levels[0] ?? 'JHS 1');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    close();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="cls-name">Class name</Label>
        <Input id="cls-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. JHS 1A" className="h-11 rounded-xl" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cls-code">Code</Label>
          <Input id="cls-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="CLS-101" className="h-11 rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cls-level">Level</Label>
          <select
            id="cls-level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95">
          Create class
        </Button>
      </div>
    </form>
  );
}
