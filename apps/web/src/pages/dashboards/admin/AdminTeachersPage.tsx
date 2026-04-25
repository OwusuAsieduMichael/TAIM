import { AdminModuleSummaryBar } from '@/components/admin/AdminModuleSummaryBar';
import { Download, MoreHorizontal, Plus, Search, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type TeacherStatus = 'Active' | 'Inactive';
type TeacherRecord = {
  id: string;
  employeeId: string;
  name: string;
  initials: string;
  department: string;
  subject: string;
  classAssigned: string;
  status: TeacherStatus;
};

const TEACHERS_SEED: TeacherRecord[] = [
  { id: 't-1', employeeId: 'TAIM-T-1001', name: 'Abena Ofori', initials: 'AO', department: 'Languages', subject: 'English', classAssigned: 'JHS 1A', status: 'Active' },
  { id: 't-2', employeeId: 'TAIM-T-1002', name: 'Kwame Mensah', initials: 'KM', department: 'Sciences', subject: 'Integrated Science', classAssigned: 'JHS 2B', status: 'Active' },
  { id: 't-3', employeeId: 'TAIM-T-1003', name: 'Efua Boakye', initials: 'EB', department: 'Mathematics', subject: 'Mathematics', classAssigned: 'JHS 3A', status: 'Active' },
  { id: 't-4', employeeId: 'TAIM-T-1004', name: 'Kojo Asare', initials: 'KA', department: 'Arts', subject: 'Creative Arts', classAssigned: 'JHS 1B', status: 'Inactive' },
  { id: 't-5', employeeId: 'TAIM-T-1005', name: 'Nana Addo', initials: 'NA', department: 'Social Studies', subject: 'Social Studies', classAssigned: 'JHS 2A', status: 'Active' },
  { id: 't-6', employeeId: 'TAIM-T-1006', name: 'Yaa Serwaa', initials: 'YS', department: 'ICT', subject: 'Computing', classAssigned: 'JHS 3B', status: 'Active' },
];

const departments = ['All departments', ...Array.from(new Set(TEACHERS_SEED.map((t) => t.department)))];
const subjects = ['All subjects', ...Array.from(new Set(TEACHERS_SEED.map((t) => t.subject)))];
const statuses: Array<'All' | TeacherStatus> = ['All', 'Active', 'Inactive'];

export function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>(TEACHERS_SEED);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [subject, setSubject] = useState('All subjects');
  const [status, setStatus] = useState<'All' | TeacherStatus>('All');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    employeeId: '',
    department: departments[1] ?? 'Languages',
    subject: subjects[1] ?? 'English',
    classAssigned: '',
  });

  const pageSize = 5;

  const filtered = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesQuery =
        query.trim().length === 0 ||
        teacher.name.toLowerCase().includes(query.toLowerCase()) ||
        teacher.employeeId.toLowerCase().includes(query.toLowerCase());
      const matchesDepartment = department === 'All departments' || teacher.department === department;
      const matchesSubject = subject === 'All subjects' || teacher.subject === subject;
      const matchesStatus = status === 'All' || teacher.status === status;
      return matchesQuery && matchesDepartment && matchesSubject && matchesStatus;
    });
  }, [teachers, query, department, subject, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function resetFilters() {
    setQuery('');
    setDepartment('All departments');
    setSubject('All subjects');
    setStatus('All');
    setPage(1);
  }

  function onAddTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTeacher.name.trim() || !newTeacher.employeeId.trim()) return;
    const name = newTeacher.name.trim();
    const initials =
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'TR';
    const record: TeacherRecord = {
      id: `t-${Date.now()}`,
      employeeId: newTeacher.employeeId.trim(),
      name,
      initials,
      department: newTeacher.department,
      subject: newTeacher.subject,
      classAssigned: newTeacher.classAssigned.trim() || 'Unassigned',
      status: 'Active',
    };
    setTeachers((prev) => [record, ...prev]);
    setShowAddModal(false);
    setNewTeacher({
      name: '',
      employeeId: '',
      department: departments[1] ?? 'Languages',
      subject: subjects[1] ?? 'English',
      classAssigned: '',
    });
    setPage(1);
  }

  return (
    <div className="portal-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">Teachers</h1>
          <p className="text-sm text-[var(--color-muted)]">Manage teacher records, assignments, and status without leaving this workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="student-interactive-well gap-2 border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)]">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            type="button"
            className="student-interactive-well gap-2 border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>
      </div>

      <AdminModuleSummaryBar moduleId="teachers" />

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by teacher name or employee ID"
              className="h-11 rounded-xl border-[var(--color-border)] pl-9"
            />
          </label>

          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {departments.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {subjects.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'All' | TeacherStatus);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
          >
            {statuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <Button type="button" variant="outline" onClick={resetFilters} className="h-11 rounded-xl border-[var(--color-border)] bg-[var(--color-background)] px-4">
            Clear
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--admin-rail-chip)]/55 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Profile</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Employee ID</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Subject(s)</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Class assigned</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
                    No teachers match the selected filters.
                  </td>
                </tr>
              ) : (
                paginated.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-[var(--color-border)]/70 transition-colors hover:bg-[color-mix(in_oklch,var(--admin-rail-hover)_62%,transparent)] last:border-b-0"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] text-xs font-semibold text-[var(--admin-rail-fg)]">
                          {teacher.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">{teacher.name}</p>
                          <p className="truncate text-xs text-[var(--color-muted)]">{teacher.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--color-foreground)]">{teacher.employeeId}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--color-foreground)]">{teacher.subject}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--color-foreground)]">{teacher.classAssigned}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium',
                          teacher.status === 'Active'
                            ? 'border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent-soft)] text-[var(--admin-rail-accent)]'
                            : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted)]',
                        )}
                      >
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            teacher.status === 'Active' ? 'bg-[var(--admin-rail-accent)]' : 'bg-[var(--color-muted)]',
                          )}
                        />
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <details className="group relative inline-block">
                        <summary className="list-none">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-xl border-[var(--color-border)]">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions for {teacher.name}</span>
                          </Button>
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-sm">
                          {['View Profile', 'Edit', 'Assign Class', 'Deactivate'].map((item) => (
                            <button
                              key={item}
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--color-foreground)] hover:bg-[var(--admin-rail-hover)]"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
          <p className="text-xs text-[var(--color-muted)]">
            Showing {(safePage - 1) * pageSize + (paginated.length ? 1 : 0)}-
            {(safePage - 1) * pageSize + paginated.length} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
              Previous
            </Button>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              Page {safePage} of {totalPages}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      </section>

      {showAddModal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Add Teacher</h2>
                <p className="text-sm text-[var(--color-muted)]">Create a teacher record without leaving the Teachers page.</p>
              </div>
              <UserRound className="h-5 w-5 text-[var(--admin-rail-accent)]" />
            </div>
            <form className="space-y-3" onSubmit={onAddTeacher}>
              <Input
                placeholder="Full name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher((prev) => ({ ...prev, name: e.target.value }))}
                className="h-11 rounded-xl"
              />
              <Input
                placeholder="Employee ID"
                value={newTeacher.employeeId}
                onChange={(e) => setNewTeacher((prev) => ({ ...prev, employeeId: e.target.value }))}
                className="h-11 rounded-xl"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, department: e.target.value }))}
                  className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)] outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
                >
                  {departments.slice(1).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  value={newTeacher.subject}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, subject: e.target.value }))}
                  className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)] outline-none focus:ring-2 focus:ring-[var(--admin-rail-accent)]/40"
                >
                  {subjects.slice(1).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Class assigned (optional)"
                value={newTeacher.classAssigned}
                onChange={(e) => setNewTeacher((prev) => ({ ...prev, classAssigned: e.target.value }))}
                className="h-11 rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="border border-[var(--admin-rail-border)] bg-[var(--admin-rail-accent)] text-white hover:brightness-95">
                  Save teacher
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
