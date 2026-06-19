import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  href?: string;
  comingSoon?: boolean;
  featured?: boolean;
};

export function ServiceHubCard({ title, description, icon: Icon, href, comingSoon, featured }: Props) {
  const cls = cn(
    'student-interactive-well group rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 text-left shadow-sm',
    'hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/[0.04]',
    featured && 'border-[var(--color-primary)]/30',
  );

  if (href && !comingSoon) {
    return (
      <Link to={href} className={cls}>
        <Icon className="h-7 w-7 text-[var(--color-foreground)]" strokeWidth={1.75} aria-hidden />
        <p className="mt-5 text-[1.07rem] font-semibold text-[var(--color-primary)]">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
      </Link>
    );
  }

  return (
    <div className={cn(cls, 'cursor-default opacity-95')}>
      <Icon className="h-7 w-7 text-[var(--color-foreground)]" strokeWidth={1.75} aria-hidden />
      <div className="mt-5 flex items-center justify-between gap-2">
        <p className="text-[1.07rem] font-semibold text-[var(--color-primary)]">{title}</p>
        {comingSoon ? (
          <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Soon
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
    </div>
  );
}
