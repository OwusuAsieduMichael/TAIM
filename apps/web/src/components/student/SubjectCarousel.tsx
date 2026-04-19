import type { ReactNode } from 'react';

/** Horizontal snap carousel — swipe-friendly on phones. */
export function SubjectCarousel({ children }: { children: ReactNode }) {
  return (
    <div className="relative -mx-4 sm:mx-0">
      <p className="mb-2 px-4 text-center text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)] sm:hidden">
        Swipe sideways for each subject
      </p>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-1 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

export function SubjectCarouselItem({ children }: { children: ReactNode }) {
  return (
    <div className="w-[min(100%,22rem)] shrink-0 snap-center sm:w-full">{children}</div>
  );
}
