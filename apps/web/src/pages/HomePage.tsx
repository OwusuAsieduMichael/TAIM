import { GraduationCap, Shield, UserRound, Users } from 'lucide-react';
import { PortalCard } from '@/components/auth/PortalCard';
import type { DemoRole } from '@/features/auth/demoQuickLogin';
import { SHOW_DEMO_QUICK_LOGIN } from '@/lib/skipRoleAuth';
import { SCHOOL_BRAND_RED, SCHOOL_FOREST, SCHOOL_HERO_IMAGE } from '@/lib/schoolBrand';
import { SchoolLogoFigure } from '@/components/SchoolLogoFigure';

const portals: {
  to: string;
  title: string;
  description: string;
  icon: typeof Shield;
  demoRoles: DemoRole[];
}[] = [
  {
    to: '/login/admin',
    title: 'Administrator',
    description: 'School dashboard, users, and configuration.',
    icon: Shield,
    demoRoles: ['ADMIN'],
  },
  {
    to: '/login/teacher',
    title: 'Teacher',
    description: 'Classes, attendance, and grades.',
    icon: Users,
    demoRoles: ['TEACHER'],
  },
  {
    to: '/login/parent',
    title: 'Parent',
    description: "View your child's progress and school updates.",
    icon: UserRound,
    demoRoles: ['PARENT'],
  },
  {
    to: '/login/student',
    title: 'Student',
    description: 'Your results, attendance, and profile.',
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/90 via-white/84 to-white/78 dark:from-slate-950/90 dark:via-slate-950/84 dark:to-slate-950/78"
        aria-hidden
      />

      <div className="portal-page relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-12 px-6 py-12 sm:px-10 sm:py-14 lg:px-12 lg:py-16 dark:text-neutral-100">
        <div className="flex flex-1 flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <header className="flex w-full shrink-0 flex-col items-center text-center lg:max-w-md lg:items-start lg:text-left">
            <SchoolLogoFigure variant="corner" className="shrink-0" />
            <h1
              className="mt-3 max-w-xl text-xl font-bold leading-snug tracking-tight sm:text-2xl"
              style={{ color: SCHOOL_BRAND_RED }}
            >
              Tomhel Academic Information Manager
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-neutral-300 lg:mx-0">
              {SHOW_DEMO_QUICK_LOGIN
                ? 'Select your portal for secure access to the Tomhel workspace. Each role opens the correct environment for your work.'
                : 'Select your role to open the correct sign-in page. Use the credentials issued by your school.'}
            </p>
            <p className="mx-auto mt-8 max-w-sm text-xs text-slate-500 dark:text-neutral-400 lg:mx-0">
              Mobile app{' '}
              <span className="font-medium text-slate-600 dark:text-neutral-300">coming soon</span>
            </p>
          </header>

          <section className="w-full flex-1 lg:max-w-2xl" aria-labelledby="portals-heading">
            <h2 id="portals-heading" className="text-center text-xl font-bold tracking-tight lg:text-left" style={{ color: SCHOOL_FOREST }}>
              Portals
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 lg:text-left dark:text-neutral-300">
              Choose the workspace that matches your role at Tomhel Preparatory/JHS.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10">
              {portals.map((portal) => (
                <PortalCard key={portal.to} {...portal} />
              ))}
            </ul>

            <p className="mt-10 text-center text-sm text-slate-600 lg:text-right dark:text-neutral-300">
              Need help?{' '}
              <span className="font-semibold underline underline-offset-2" style={{ color: SCHOOL_FOREST }}>
                Contact your school IT office
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
