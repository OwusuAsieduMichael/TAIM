import { cn } from '@/lib/utils';

type StudentSkipLinkProps = {
  className?: string;
};

export function StudentSkipLink({ className }: StudentSkipLinkProps) {
  return (
    <a
      href="#student-main"
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-xl focus:bg-[var(--color-primary)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[var(--color-primary-foreground)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
        className,
      )}
    >
      Skip to main content
    </a>
  );
}
