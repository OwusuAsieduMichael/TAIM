import { ChevronRight, GraduationCap, Shield, UserRound, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SKIP_ROLE_AUTH } from '@/lib/skipRoleAuth';
import { cn } from '@/lib/utils';
import { SchoolLogoFigure } from '@/components/SchoolLogoFigure';
import { SCHOOL_HERO_IMAGE } from '@/lib/schoolBrand';

const forest = 'oklch(0.38 0.11 155)';
const brandRedText = 'oklch(0.38 0.17 25)';

const portals = [
  {
    to: '/login/admin',
    title: 'Administrator',
    desc: 'School dashboard, users, and configuration. Sign in with email and password.',
    icon: Shield,
  },
  {
    to: '/login/teacher',
    title: 'Teacher',
    desc: 'Classes, attendance, and grades. Sign in with your phone number (OTP).',
    icon: Users,
  },
  {
    to: '/login/parent',
    title: 'Parent',
    desc: 'View your child’s progress and school updates. Sign in with phone (OTP).',
    icon: UserRound,
  },
  {
    to: '/login/student',
    title: 'Student',
    desc: 'Your results, attendance, and profile. Sign in with school code, student ID, and PIN.',
    icon: GraduationCap,
  },
] as const;

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
              Select your role to open the correct sign-in page. Each portal uses the credentials your school issued for that role.
            </p>
            {SKIP_ROLE_AUTH ? (
              <p className="mx-auto mt-4 max-w-sm rounded-lg border border-amber-700/25 bg-amber-50/90 px-3 py-2 text-left text-xs leading-relaxed text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
                Development: each login screen is prefilled with seeded demo accounts from the API seed. Sign in there
                skips the server so you can work on layouts. Set{' '}
                <span className="font-mono">VITE_USE_REAL_ROLE_AUTH=true</span> to exercise real authentication.
              </p>
            ) : null}
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
                  <li key={p.to}>
                    <Link
                      to={p.to}
                      className={cn(
                        'group flex h-full flex-col rounded-xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-colors',
                        'hover:border-emerald-700/30 hover:bg-white/95',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700',
                        'dark:border-white/10 dark:bg-neutral-950/55 dark:hover:border-emerald-500/35 dark:hover:bg-neutral-950/75',
                      )}
                    >
                      <Icon className="h-7 w-7 text-slate-800 dark:text-neutral-100" strokeWidth={1.75} />
                      <span className="mt-4 text-lg font-semibold" style={{ color: forest }}>
                        {p.title}
                      </span>
                      <span className="mt-2 flex-1 text-sm leading-relaxed text-slate-700 dark:text-neutral-300">{p.desc}</span>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-neutral-100">
                        Continue
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                      </span>
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
