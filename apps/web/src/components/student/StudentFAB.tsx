import { CalendarDays, Plus, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { triggerStudentHaptic } from '@/store/studentPrefsStore';

export function StudentFAB() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6"
    >
      <div
        className={cn(
          'flex flex-col gap-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-2 shadow-lg transition-all duration-200 motion-reduce:transition-none',
          open
            ? 'pointer-events-auto max-h-64 translate-y-0 opacity-100'
            : 'pointer-events-none max-h-0 -translate-y-2 opacity-0',
        )}
      >
        <Link
          to="/app/student/results"
          onClick={() => {
            triggerStudentHaptic('light');
            setOpen(false);
          }}
          className="student-interactive-well flex min-h-[48px] min-w-[200px] items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
        >
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" strokeWidth={1.75} />
          View results
        </Link>
        <Link
          to="/app/student/attendance"
          onClick={() => {
            triggerStudentHaptic('light');
            setOpen(false);
          }}
          className="student-interactive-well flex min-h-[48px] min-w-[200px] items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
        >
          <CalendarDays className="h-4 w-4 text-[var(--color-primary)]" strokeWidth={1.75} />
          Attendance
        </Link>
        <button
          type="button"
          disabled
          className="flex min-h-[48px] min-w-[200px] cursor-not-allowed items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-[var(--color-muted)] opacity-70"
        >
          <span className="rounded-md bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-bold uppercase">Soon</span>
          Practice
        </button>
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) triggerStudentHaptic('light');
        }}
        className={cn(
          'pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-lg transition-[transform,filter,box-shadow] duration-200 ease-out hover:shadow-xl hover:brightness-110 active:scale-95 motion-reduce:transition-none',
          open && 'rotate-45',
        )}
      >
        {open ? <X className="h-6 w-6" strokeWidth={2} /> : <Plus className="h-6 w-6" strokeWidth={2} />}
      </button>
    </div>
  );
}
