import { useEffect } from 'react';
import { ChevronLeft, LayoutGrid, Moon, Smartphone } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';
import { triggerStudentHaptic, useStudentPrefsStore } from '@/store/studentPrefsStore';

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Compact settings surface — opens from the student rail without navigating away.
 * Mobile: bottom sheet. sm+: right slide-over panel.
 */
export function StudentDisplayComfortSheet({ open, onClose }: Props) {
  const density = useStudentPrefsStore((s) => s.density);
  const setDensity = useStudentPrefsStore((s) => s.setDensity);
  const hapticFeedback = useStudentPrefsStore((s) => s.hapticFeedback);
  const setHapticFeedback = useStudentPrefsStore((s) => s.setHapticFeedback);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] print:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity dark:bg-black/55"
        aria-label="Close settings"
        onClick={() => {
          triggerStudentHaptic('light');
          onClose();
        }}
      />

      <div
        className={cn(
          'absolute flex max-h-[min(88dvh,640px)] w-full flex-col border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl',
          'bottom-0 left-0 right-0 rounded-t-3xl border-x border-t',
          'sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[min(22rem,calc(100vw-1rem))] sm:rounded-none sm:border-b-0 sm:border-l sm:border-r-0 sm:border-t-0',
        )}
        id="student-comfort-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comfort-sheet-title"
      >
        <div className="shrink-0 border-b border-[var(--color-border)] px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <button
            type="button"
            onClick={() => {
              triggerStudentHaptic('light');
              onClose();
            }}
            className="student-interactive-well inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-semibold text-[var(--color-foreground)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
            aria-label="Back to previous screen"
          >
            <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--color-primary)]" strokeWidth={2.25} aria-hidden />
            <span>Back</span>
          </button>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
              <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h2 id="comfort-sheet-title" className="text-base font-bold tracking-tight text-[var(--color-foreground)]">
                Display &amp; comfort
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">
                Quick adjustments — your page stays open behind this panel.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-background)]/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Moon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-muted)]" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Theme</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">Light or dark</p>
              </div>
            </div>
            <ThemeToggle className="student-interactive-well" />
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-background)]/80 p-4">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">Layout density</p>
            <div className="mt-3 flex gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={cn(
                  'student-interactive-well min-h-11 min-w-[44px] flex-1 rounded-lg px-3 text-sm font-semibold',
                  density === 'comfortable'
                    ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
                    : 'text-[var(--color-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                )}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={cn(
                  'student-interactive-well min-h-11 min-w-[44px] flex-1 rounded-lg px-3 text-sm font-semibold',
                  density === 'compact'
                    ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
                    : 'text-[var(--color-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                )}
              >
                Compact
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-background)]/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-muted)]" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Haptics</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">Short vibration on supported phones</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hapticFeedback}
              onClick={() => {
                triggerStudentHaptic('light');
                setHapticFeedback(!hapticFeedback);
              }}
              className={cn(
                'student-interactive-well min-h-11 shrink-0 rounded-xl px-5 text-sm font-semibold',
                hapticFeedback
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                  : 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
              )}
            >
              {hapticFeedback ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
