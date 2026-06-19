import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortalQuickSignIn } from '@/components/auth/PortalQuickSignIn';
import type { DemoRole } from '@/features/auth/demoQuickLogin';
import { SHOW_DEMO_QUICK_LOGIN } from '@/lib/skipRoleAuth';
import { SCHOOL_FOREST } from '@/lib/schoolBrand';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

type Props = {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
  demoRoles: DemoRole[];
};

export function PortalCard({ to, title, description, icon: Icon, demoRoles }: Props) {
  return (
    <li
      className={cn(
        'flex h-full flex-col rounded-2xl border p-5 shadow-sm backdrop-blur-md transition-shadow',
        SHOW_DEMO_QUICK_LOGIN
          ? 'border-emerald-800/20 bg-white/90 dark:border-emerald-500/25 dark:bg-neutral-950/60'
          : 'border-white/50 bg-white/80 dark:border-white/10 dark:bg-neutral-950/55',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            SHOW_DEMO_QUICK_LOGIN
              ? 'bg-emerald-800/10 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100'
              : 'bg-slate-900/5 text-slate-800 dark:bg-white/10 dark:text-neutral-100',
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight" style={{ color: SCHOOL_FOREST }}>
            {title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">{description}</p>
        </div>
      </div>

      {SHOW_DEMO_QUICK_LOGIN ? (
        <>
          <PortalQuickSignIn roles={demoRoles} compact />
          <Link
            to={to}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 underline-offset-2 transition-colors hover:text-slate-800 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Sign in with credentials
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        </>
      ) : (
        <Link
          to={to}
          className={cn(buttonVariants({ variant: 'school', size: 'default' }), 'mt-5 w-full font-semibold shadow-sm')}
        >
          Open {title} portal
        </Link>
      )}
    </li>
  );
}
