import { ChevronRight, GraduationCap, Shield, UserRound, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoQuickLoginPanel } from '@/components/auth/DemoQuickLoginPanel';
import type { DemoRole } from '@/features/auth/demoQuickLogin';
import { SHOW_DEMO_QUICK_LOGIN } from '@/lib/skipRoleAuth';
import { cn } from '@/lib/utils';
import { SchoolLogoFigure } from '@/components/SchoolLogoFigure';
import { SCHOOL_HERO_IMAGE } from '@/lib/schoolBrand';

const forest = 'oklch(0.38 0.11 155)';
const brandRedText = 'oklch(0.38 0.17 25)';

const portals: {
  to: string;
  title: string;
  desc: string;
  icon: typeof Shield;
  demoRoles: DemoRole[];
}[] = [
  {
    to: '/login/admin',
    title: 'Administrator',
    desc: 'School dashboard, users, and configuration.',
    icon: Shield,
    demoRoles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    to: '/login/teacher',
    title: 'Teacher',
    desc: 'Classes, attendance, and grades.',
    icon: Users,
    demoRoles: ['TEACHER'],
  },
  {
    to: '/login/parent',
    title: 'Parent',
    desc: 'View your child’s progress and school updates.',
    icon: UserRound,
    demoRoles: ['PARENT'],
  },
  {
    to: '/login/student',
    title: 'Student',
    desc: 'Your results, attendance, and profile.',
    icon: GraduationCap,
    demoRoles: ['STUDENT'],
  },
];

export function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${SCHOOL_HERO_IMAGE})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/88 via-white/82 to-white/76 dark:from-slate-950/88 dark:via-slate-950/82 dark:to-slate-950/76"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-12 px-6 py-12 sm:px-10 sm:py-14 lg:px-12 lg:py-16 dark:text-neutral-100">
        <div className="flex flex-1 flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <header className="flex w-full shrink-0 flex-col items-center text-center lg:max-w-md">
            <SchoolLogoFigure variant="corner" className="shrink-0" />
            <h1 className="mt-1 max-w-xl text-xl font-bold leading-snug sm:text-2xl" style={{ color: brandRedText }}>
              Tomhel Academic Information Manager
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
              {SHOW_DEMO_QUICK_LOGIN
                ? 'Tap a demo account below to enter instantly, or open a portal for manual sign-in.'
                : 'Select your role to open the correct sign-in page. Each portal uses the credentials your school issued for that role.'}
            </p>
            <p className="mx-auto mt-8 max-w-sm text-xs text-slate-600 dark:text-neutral-400">
              Need the mobile app?{' '}
              <span className="font-semibold underline decoration-2 underline-offset-2" style={{ color: forest }}>
                Download App
              </span>{' '}
              <span className="opacity-80">(coming soon)</span>
            </p>
          </header>

          <div className="w-full flex-1 lg:max-w-2xl">
            <h2 className="text-center text-xl font-bold tracking-tight lg:text-left" style={{ color: forest }}>
              Portals
            </h2>
            <p className="mt-2 text-center text-sm text-slate-700 lg:text-left dark:text-neutral-300">
              Choose how you use TAIM — you will be taken to the matching login screen.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10">
              {portals.map((p) => {
                const Icon = p.icon;
                return (
                  <li
                    key={p.to}
                    className={cn(
                      'flex h-full flex-col rounded-xl border p-5 shadow-sm backdrop-blur-md',
                      SHOW_DEMO_QUICK_LOGIN
                        ? 'border-emerald-700/35 bg-emerald-50/88 dark:border-emerald-600/30 dark:bg-emerald-950/50'
                        : 'border-white/50 bg-white/80 dark:border-white/10 dark:bg-neutral-950/55',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-7 w-7',
                        SHOW_DEMO_QUICK_LOGIN ? 'text-emerald-800 dark:text-emerald-100' : 'text-slate-800 dark:text-neutral-100',
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="mt-4 text-lg font-semibold" style={{ color: forest }}>
                      {p.title}
                    </span>
                    <span
                      className={cn(
                        'mt-2 flex-1 text-sm leading-relaxed',
                        SHOW_DEMO_QUICK_LOGIN ? 'text-emerald-950/80 dark:text-emerald-50/85' : 'text-slate-700 dark:text-neutral-300',
                      )}
                    >
                      {p.desc}
                    </span>
                    <DemoQuickLoginPanel roles={p.demoRoles} compact />
                    <Link
                      to={p.to}
                      className={cn(
                        'mt-3 inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline',
                        SHOW_DEMO_QUICK_LOGIN
                          ? 'text-emerald-800/80 dark:text-emerald-200/80'
                          : 'text-slate-600 dark:text-neutral-400',
                      )}
                    >
                      Manual sign-in
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="mt-10 pr-1 text-right text-sm text-slate-700 sm:pr-2 dark:text-neutral-300">
              Having trouble?{' '}
              <span className="font-semibold underline underline-offset-2" style={{ color: forest }}>
                Contact your school IT office
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
