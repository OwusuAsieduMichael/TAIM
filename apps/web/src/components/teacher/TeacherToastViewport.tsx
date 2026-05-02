import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeacherToastStore } from '@/store/teacherToastStore';
import type { TeacherToastTone } from '@/store/teacherToastStore';

function toneIcon(tone: TeacherToastTone) {
  if (tone === 'success') return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />;
  if (tone === 'error') return <XCircle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2} />;
  if (tone === 'warning') return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} />;
  return <Info className="h-4 w-4 shrink-0 text-sky-600" strokeWidth={2} />;
}

export function TeacherToastViewport() {
  const toasts = useTeacherToastStore((s) => s.toasts);
  const dismiss = useTeacherToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-3 top-[4.5rem] z-[60] flex max-w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 sm:right-5 sm:top-20"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex gap-2 rounded-xl border px-3 py-2.5 shadow-lg transition-all duration-200',
            'border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-md',
            t.tone === 'success' && 'ring-1 ring-emerald-600/15',
            t.tone === 'error' && 'ring-1 ring-red-600/15',
            t.tone === 'warning' && 'ring-1 ring-amber-600/15',
            t.tone === 'info' && 'ring-1 ring-sky-600/15',
          )}
        >
          {toneIcon(t.tone)}
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">{t.title}</p>
            {t.detail ? <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t.detail}</p> : null}
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-1 text-[var(--color-muted)] transition-colors hover:bg-black/[0.06] hover:text-[var(--color-foreground)]"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
