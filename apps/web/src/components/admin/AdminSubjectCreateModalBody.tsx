import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = { close: () => void };

const departments = ['Languages', 'Sciences', 'Mathematics', 'Arts', 'Social Studies', 'ICT'];

export function AdminSubjectCreateModalBody({ close }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState(departments[0] ?? 'Languages');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    close();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="sub-name">Subject name</Label>
        <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sub-code">Code</Label>
          <Input id="sub-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUB-ENG" className="h-11 rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub-dept">Department</Label>
          <select
            id="sub-dept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
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
          Save subject
        </Button>
      </div>
    </form>
  );
}
