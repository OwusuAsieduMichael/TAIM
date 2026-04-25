import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortalBack } from '@/hooks/usePortalBack';
import { cn } from '@/lib/utils';

export type PortalBackRail = 'admin' | 'teacher' | 'parent' | 'default' | 'student';

const railClass: Record<PortalBackRail, string> = {
  admin:
    'student-interactive-well gap-1 rounded-xl border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] px-2.5 font-semibold text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)] sm:px-3',
  teacher:
    'student-interactive-well gap-1 rounded-xl border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)] px-2.5 font-semibold text-[var(--teacher-rail-fg)] hover:bg-[var(--teacher-rail-chip-hover)] sm:px-3',
  parent:
    'student-interactive-well gap-1 rounded-xl border-[var(--parent-rail-border)] bg-[var(--parent-rail-chip)] px-2.5 font-semibold text-[var(--parent-rail-fg)] hover:bg-[var(--parent-rail-chip-hover)] sm:px-3',
  default:
    'gap-1 rounded-xl border-[var(--color-border)] bg-[var(--color-background)] px-2.5 font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/10 sm:px-3',
  student:
    'student-interactive-well gap-0.5 rounded-xl border border-[var(--student-rail-border)] bg-[var(--student-rail-chip)] px-2.5 text-sm font-semibold text-[var(--student-rail-fg)] hover:bg-[var(--student-rail-chip-hover)] sm:px-3',
};

type Props = {
  rail: PortalBackRail;
  fallbackPath: string;
  className?: string;
  /** Runs immediately before navigation (e.g. student haptics). */
  beforeNavigate?: () => void;
};

export function PortalBackButton({ rail, fallbackPath, className, beforeNavigate }: Props) {
  const { showBack, goBack } = usePortalBack(fallbackPath);
  if (!showBack) return null;

  function handleClick() {
    beforeNavigate?.();
    goBack();
  }

  const accent =
    rail === 'admin'
      ? 'text-[var(--admin-rail-accent)]'
      : rail === 'teacher'
        ? 'text-[var(--teacher-rail-accent)]'
        : rail === 'parent'
          ? 'text-[var(--parent-rail-accent)]'
          : rail === 'student'
            ? 'text-[var(--student-rail-accent)]'
            : 'text-[var(--color-primary)]';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={cn(railClass[rail], 'h-10', className)}
      aria-label="Go back to the previous screen"
    >
      <ChevronLeft className={cn('h-5 w-5 shrink-0', accent)} strokeWidth={2.25} aria-hidden />
      <span className="hidden sm:inline">Back</span>
    </Button>
  );
}
