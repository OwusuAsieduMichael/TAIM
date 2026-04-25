import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  close: () => void;
};

const classes = ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A'];

export function AdminStudentAdmissionModalBody({ close }: Props) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [className, setClassName] = useState(classes[0] ?? 'JHS 1A');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim()) return;
    close();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="adm-name">Full name</Label>
        <Input id="adm-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adm-id">Student ID</Label>
        <Input id="adm-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="h-11 rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adm-class">Class</Label>
        <select
          id="adm-class"
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="adm-guardian">Guardian name</Label>
          <Input id="adm-guardian" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adm-phone">Guardian phone</Label>
          <Input id="adm-phone" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className="h-11 rounded-xl" inputMode="tel" />
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)]">Bulk import and API persistence can plug into this flow next.</p>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95">
          Save draft
        </Button>
      </div>
    </form>
  );
}
