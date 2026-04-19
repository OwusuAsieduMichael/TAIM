import { Keyboard, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  onRefresh: () => Promise<void>;
  triggerClassName?: string;
};

export function StudentShortcutsModal({ onRefresh, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (!open && (e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        void onRefresh();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onRefresh]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLButtonElement>('button[data-close]')?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 dark:hover:bg-white/[0.06]',
          triggerClassName,
        )}
        aria-label="Keyboard shortcuts"
        title="Shortcuts (?)"
      >
        <Keyboard className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
            aria-label="Close shortcuts"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-shortcuts-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-xl"
            style={{ animation: 'fade-in 200ms ease-out both' }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="student-shortcuts-title" className="text-lg font-semibold text-[var(--color-foreground)]">
                  Shortcuts
                </h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Work faster from the keyboard.</p>
              </div>
              <button
                type="button"
                data-close
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] dark:hover:bg-white/[0.06]"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-background)] px-3 py-2.5">
                <span className="text-[var(--color-muted)]">Open this panel</span>
                <kbd className={cn('rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 font-mono text-xs font-semibold')}>
                  ?
                </kbd>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-background)] px-3 py-2.5">
                <span className="text-[var(--color-muted)]">Refresh data</span>
                <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 font-mono text-xs font-semibold">
                  R
                </kbd>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-background)] px-3 py-2.5">
                <span className="text-[var(--color-muted)]">Close</span>
                <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 font-mono text-xs font-semibold">
                  Esc
                </kbd>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                void onRefresh().then(() => setOpen(false));
              }}
              className="mt-5 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Refresh now
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
