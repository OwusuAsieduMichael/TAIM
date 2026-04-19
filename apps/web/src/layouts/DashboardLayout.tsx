import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { railSettingsHeadingClass, railSettingsPillClass } from '@/components/layout/railSettingsPills';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SchoolLogoFigure } from '@/components/SchoolLogoFigure';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { isDevMockToken, SEED_DEMO } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type School = { id: string; name: string; slug: string };

const ADMIN_NAV_COLLAPSE_KEY = 'taim-admin-nav-collapsed';

function roleTitle(role: string | null): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super administrator';
    case 'ADMIN':
      return 'School administrator';
    case 'TEACHER':
      return 'Teacher';
    case 'PARENT':
      return 'Parent / Guardian';
    case 'STUDENT':
      return 'Student';
    default:
      return 'Member';
  }
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-white/10 text-[var(--color-sidebar-foreground)]'
      : 'text-[var(--color-sidebar-muted)] hover:bg-white/[0.06] hover:text-[var(--color-sidebar-foreground)]',
  );

const teacherRailLink =
  'student-interactive-well flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--teacher-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--teacher-rail-surface)]';

const teacherNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    teacherRailLink,
    isActive
      ? 'bg-[var(--teacher-rail-accent-soft)] text-[var(--teacher-rail-accent)]'
      : 'text-[var(--teacher-rail-muted)] hover:bg-[var(--teacher-rail-hover)] hover:text-[var(--teacher-rail-fg)]',
  );

const teacherMobileTabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'student-interactive-well shrink-0 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--teacher-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--teacher-rail-surface)]',
    isActive
      ? 'bg-[var(--teacher-rail-accent-soft)] text-[var(--teacher-rail-accent)]'
      : 'text-[var(--teacher-rail-muted)] hover:bg-[var(--teacher-rail-hover)] hover:text-[var(--teacher-rail-fg)]',
  );

const parentRailLink =
  'student-interactive-well flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--parent-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--parent-rail-surface)]';

const parentNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    parentRailLink,
    isActive
      ? 'bg-[var(--parent-rail-accent-soft)] text-[var(--parent-rail-accent)]'
      : 'text-[var(--parent-rail-muted)] hover:bg-[var(--parent-rail-hover)] hover:text-[var(--parent-rail-fg)]',
  );

const parentMobileTabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'student-interactive-well shrink-0 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--parent-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--parent-rail-surface)]',
    isActive
      ? 'bg-[var(--parent-rail-accent-soft)] text-[var(--parent-rail-accent)]'
      : 'text-[var(--parent-rail-muted)] hover:bg-[var(--parent-rail-hover)] hover:text-[var(--parent-rail-fg)]',
  );

export function DashboardLayout() {
  const clear = useAuthStore((s) => s.clear);
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const schoolSlug = useAuthStore((s) => s.schoolSlug);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mock = isDevMockToken(token);
  const isTeacher = role === 'TEACHER';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isParent = role === 'PARENT';

  const parentHeaderIconBtn = cn(
    'student-interactive-well flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--parent-rail-border)] bg-[var(--parent-rail-chip)] text-[var(--parent-rail-fg)] hover:bg-[var(--parent-rail-chip-hover)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--parent-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--parent-rail-surface)]',
  );

  const parentPageLabel = pathname.includes('/parent/settings') ? 'Settings' : 'Family overview';

  const [adminNavCollapsed, setAdminNavCollapsed] = useState(false);
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(ADMIN_NAV_COLLAPSE_KEY) === '1') setAdminNavCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleAdminNavCollapsed() {
    setAdminNavCollapsed((c) => {
      const next = !c;
      try {
        sessionStorage.setItem(ADMIN_NAV_COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const { data: school } = useQuery({
    queryKey: ['school', 'layout-me'],
    queryFn: () => apiFetch<School>('/api/v1/schools/me', { token }),
    enabled: !!token && role !== 'SUPER_ADMIN' && !mock,
    retry: false,
  });

  function signOut() {
    clear();
    navigate('/');
  }

  const contextLine = mock
    ? role === 'SUPER_ADMIN'
      ? 'All schools (layout preview)'
      : schoolSlug
        ? `${SEED_DEMO.schoolDisplayName} · ${schoolSlug}`
        : SEED_DEMO.schoolDisplayName
    : role === 'SUPER_ADMIN'
      ? 'All schools'
      : school
        ? school.name
        : role
          ? 'Loading school…'
          : '';

  const legacySidebar = !isTeacher && !isAdmin && !isParent;

  return (
    <div
      className={cn(
        'flex min-h-dvh bg-[var(--color-background)] lg:h-dvh lg:max-h-dvh lg:overflow-hidden',
        isTeacher && 'teacher-portal-root relative isolate',
        isAdmin && 'admin-portal-root relative isolate',
        isParent && 'parent-portal-root relative isolate',
      )}
    >
      {isTeacher ? <div className="teacher-portal-bg print:hidden" aria-hidden /> : null}
      {isAdmin ? <div className="admin-portal-bg print:hidden" aria-hidden /> : null}
      {isParent ? <div className="parent-portal-bg print:hidden" aria-hidden /> : null}

      {isAdmin && adminMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[2px] transition-opacity lg:hidden print:hidden"
          aria-label="Close menu"
          onClick={() => setAdminMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'relative z-20 shrink-0 flex-col lg:h-full lg:min-h-0 lg:overflow-hidden',
          isTeacher &&
            'teacher-nav-rail relative z-20 hidden w-[240px] border-r border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-surface-glass)] backdrop-blur-md lg:flex',
          isAdmin &&
            cn(
              'admin-nav-rail flex border-r border-[var(--admin-rail-border)] bg-[var(--admin-rail-surface-glass)] text-[var(--admin-rail-fg)] backdrop-blur-md',
              'fixed inset-y-0 left-0 z-[60] w-[min(17.5rem,88vw)] max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-200',
              adminNavCollapsed ? 'lg:w-[4.75rem] lg:min-w-[4.75rem]' : 'lg:w-60 lg:min-w-60',
              !adminMobileOpen && 'max-lg:pointer-events-none max-lg:-translate-x-full',
              adminMobileOpen && 'max-lg:translate-x-0',
              'lg:static lg:z-20 lg:flex lg:translate-x-0 lg:pointer-events-auto lg:shadow-none',
            ),
          isParent &&
            'parent-nav-rail relative z-20 hidden w-[240px] border-r border-[var(--parent-rail-border)] bg-[var(--parent-rail-surface-glass)] backdrop-blur-md lg:flex',
          legacySidebar &&
            'relative z-20 hidden w-[240px] border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar)] lg:flex',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center gap-2 border-b px-3 py-3 sm:px-4',
            isTeacher ? 'border-[var(--teacher-rail-border)]' : '',
            isAdmin ? 'border-[var(--admin-rail-border)]' : '',
            isParent ? 'border-[var(--parent-rail-border)]' : '',
            legacySidebar ? 'border-[var(--color-sidebar-border)] px-5' : '',
          )}
        >
          {isTeacher ? (
            <>
              <img
                src="/Tomhel_Logo-removebg-preview.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
                decoding="async"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--teacher-rail-muted)]">TAIM</p>
                <p className="truncate text-sm font-semibold tracking-tight text-[var(--teacher-rail-fg)]">Teacher workspace</p>
              </div>
            </>
          ) : isAdmin ? (
            <>
              <img
                src="/Tomhel_Logo-removebg-preview.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 object-contain"
                decoding="async"
              />
              {!adminNavCollapsed ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-rail-muted)]">TAIM</p>
                  <p className="truncate text-sm font-semibold tracking-tight text-[var(--admin-rail-fg)]">Control center</p>
                </div>
              ) : (
                <span className="sr-only">TAIM administrator</span>
              )}
              <button
                type="button"
                onClick={toggleAdminNavCollapsed}
                className="admin-nav-well ml-auto hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)] lg:flex"
                aria-label={adminNavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {adminNavCollapsed ? (
                  <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                ) : (
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                )}
              </button>
            </>
          ) : isParent ? (
            <>
              <img
                src="/Tomhel_Logo-removebg-preview.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
                decoding="async"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--parent-rail-muted)]">TAIM</p>
                <p className="truncate text-sm font-semibold tracking-tight text-[var(--parent-rail-fg)]">Family portal</p>
              </div>
            </>
          ) : (
            <>
              <SchoolLogoFigure variant="nav" className="shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-[var(--color-sidebar-foreground)]">TAIM</p>
                <p className="truncate text-xs text-[var(--color-sidebar-muted)]">Academic suite</p>
              </div>
            </>
          )}
        </div>

        {isTeacher ? (
          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3" aria-label="Main">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--teacher-rail-muted)]">Teaching</p>
            <NavLink to="/app/dashboard/attendance" className={teacherNavLinkClass}>
              <ClipboardCheck className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
              Attendance
            </NavLink>
            <NavLink to="/app/dashboard/reports" className={teacherNavLinkClass}>
              <BarChart3 className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
              Reports
            </NavLink>
            <NavLink to="/app/dashboard/results" className={teacherNavLinkClass}>
              <BookOpenCheck className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
              Results
            </NavLink>
          </nav>
        ) : isAdmin ? (
          <AdminSidebarNav collapsed={adminNavCollapsed} onNavigate={() => setAdminMobileOpen(false)} />
        ) : isParent ? (
          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3" aria-label="Main">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--parent-rail-muted)]">Family</p>
            <NavLink to="/app/dashboard/overview" className={parentNavLinkClass} end>
              <LayoutDashboard className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
              Overview
            </NavLink>
          </nav>
        ) : (
          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3" aria-label="Main">
            <NavLink to="/app/dashboard/overview" className={navClass}>
              <LayoutDashboard className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
              Overview
            </NavLink>
          </nav>
        )}

        <div
          className={cn(
            'mt-auto shrink-0 border-t p-4',
            isTeacher ? 'border-[var(--teacher-rail-border)]' : '',
            isAdmin ? 'border-[var(--admin-rail-border)]' : '',
            isParent ? 'border-[var(--parent-rail-border)]' : 'border-[var(--color-sidebar-border)]',
          )}
        >
          {isTeacher ? (
            <div className="space-y-2" aria-label="Settings">
              <p className={railSettingsHeadingClass('teacher')}>Settings</p>
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/app/dashboard/settings"
                  className={({ isActive }) =>
                    railSettingsPillClass('teacher', { active: isActive, adminCollapsed: false })
                  }
                >
                  <SlidersHorizontal className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 truncate">Display &amp; comfort</span>
                </NavLink>
                <button
                  type="button"
                  className={railSettingsPillClass('teacher')}
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} aria-hidden />
                  Log out
                </button>
              </div>
            </div>
          ) : null}

          {isAdmin ? (
            <div className="space-y-2" aria-label="Settings">
              <p className={cn(railSettingsHeadingClass('admin'), adminNavCollapsed && 'lg:sr-only')}>Settings</p>
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/app/dashboard/admin/settings"
                  onClick={() => setAdminMobileOpen(false)}
                  className={({ isActive }) =>
                    railSettingsPillClass('admin', { active: isActive, adminCollapsed: adminNavCollapsed })
                  }
                >
                  <SlidersHorizontal className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} aria-hidden />
                  <span className={cn('min-w-0 truncate', adminNavCollapsed && 'lg:sr-only')}>
                    Display &amp; comfort
                  </span>
                </NavLink>
                <button
                  type="button"
                  className={railSettingsPillClass('admin', { adminCollapsed: adminNavCollapsed })}
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} aria-hidden />
                  <span className={cn(adminNavCollapsed && 'lg:sr-only')}>Log out</span>
                </button>
              </div>
            </div>
          ) : null}

          {isParent ? (
            <div className="space-y-2" aria-label="Settings">
              <p className={railSettingsHeadingClass('parent')}>Settings</p>
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/app/dashboard/parent/settings"
                  className={({ isActive }) => railSettingsPillClass('parent', { active: isActive })}
                >
                  <SlidersHorizontal className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 truncate">Display &amp; comfort</span>
                </NavLink>
                <button type="button" className={railSettingsPillClass('parent')} onClick={signOut}>
                  <LogOut className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} aria-hidden />
                  Log out
                </button>
              </div>
            </div>
          ) : null}

          {legacySidebar ? (
            <div className="space-y-2" aria-label="Settings">
              <p className={railSettingsHeadingClass('legacy')}>Settings</p>
              <div className="flex flex-col gap-2">
                <button type="button" className={railSettingsPillClass('legacy')} onClick={signOut}>
                  <LogOut className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} aria-hidden />
                  Log out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <div className={cn('relative z-10 flex min-w-0 flex-1 flex-col lg:min-h-0 lg:overflow-hidden')}>
        {isAdmin ? (
          <header className="admin-header-blur sticky top-0 z-30 shrink-0 border-b border-[var(--admin-rail-border)] bg-[var(--admin-rail-surface-glass)] text-[var(--admin-rail-fg)] backdrop-blur-md print:hidden">
            <AdminTopBar
              contextLine={contextLine}
              roleLabel={roleTitle(role)}
              showMobileMenu
              onOpenMobileNav={() => setAdminMobileOpen(true)}
              onSignOut={signOut}
            />
          </header>
        ) : isTeacher ? (
          <header
            className={cn(
              'teacher-header-blur teacher-top-header sticky top-0 z-30 shrink-0 border-b border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-surface-glass)] text-[var(--teacher-rail-fg)] backdrop-blur-md print:hidden',
            )}
          >
            <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <img
                  src="/Tomhel_Logo-removebg-preview.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 object-contain"
                  decoding="async"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--teacher-rail-fg)]">TAIM</p>
                  <p className="truncate text-xs text-[var(--teacher-rail-muted)]">{roleTitle(role)}</p>
                </div>
              </div>
              <div className="hidden min-w-0 flex-1 lg:block">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--teacher-rail-muted)]">Current context</p>
                <p className="truncate text-sm font-semibold text-[var(--teacher-rail-fg)]">{contextLine}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full border border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)] px-2.5 py-1 text-xs font-medium text-[var(--teacher-rail-muted)] sm:inline">
                  {roleTitle(role)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="student-interactive-well border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)] text-[var(--teacher-rail-fg)] hover:bg-[var(--teacher-rail-chip-hover)] lg:hidden"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </div>
            </div>
            <div className="border-t border-[var(--teacher-rail-border)] px-4 py-2 lg:hidden">
              <p className="truncate text-xs text-[var(--teacher-rail-muted)]">
                <span className="font-medium text-[var(--teacher-rail-fg)]">Context: </span>
                {contextLine || '—'}
              </p>
            </div>
            <nav
              className="flex gap-1 overflow-x-auto border-b border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-surface-glass)] px-2 py-2 backdrop-blur-md lg:hidden"
              aria-label="Teaching sections"
            >
              <NavLink to="/app/dashboard/attendance" className={teacherMobileTabClass}>
                Attendance
              </NavLink>
              <NavLink to="/app/dashboard/reports" className={teacherMobileTabClass}>
                Reports
              </NavLink>
              <NavLink to="/app/dashboard/results" className={teacherMobileTabClass}>
                Results
              </NavLink>
              <NavLink to="/app/dashboard/settings" className={teacherMobileTabClass}>
                Comfort
              </NavLink>
            </nav>
          </header>
        ) : isParent ? (
          <header className="parent-header-blur sticky top-0 z-30 flex flex-col gap-0 border-b border-[var(--parent-rail-border)] bg-[var(--parent-rail-surface-glass)] text-[var(--parent-rail-fg)] backdrop-blur-md print:hidden sm:px-5">
            <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={cn(
                    parentHeaderIconBtn,
                    'h-11 w-auto gap-0.5 px-2.5 text-sm font-semibold sm:px-3',
                  )}
                  aria-label="Back to portals"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--parent-rail-accent)]" strokeWidth={2.25} aria-hidden />
                  <span className="hidden sm:inline">Portals</span>
                </button>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--parent-rail-muted)]">TAIM</p>
                  <p className="truncate text-sm font-semibold text-[var(--parent-rail-fg)]">{parentPageLabel}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full border border-[var(--parent-rail-border)] bg-[var(--parent-rail-chip)] px-2.5 py-1 text-xs font-medium text-[var(--parent-rail-muted)] sm:inline">
                  {roleTitle(role)}
                </span>
                <ThemeToggle className={parentHeaderIconBtn} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(parentHeaderIconBtn, 'w-auto gap-1 px-2.5 font-semibold lg:hidden')}
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 sm:mr-1" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </div>
            </div>
            <div className="hidden min-w-0 border-t border-[var(--parent-rail-border)] px-4 py-2 sm:px-5 lg:block">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--parent-rail-muted)]">Current context</p>
              <p className="truncate text-sm font-semibold text-[var(--parent-rail-fg)]">{contextLine || '—'}</p>
            </div>
            <div className="border-t border-[var(--parent-rail-border)] px-4 py-2 lg:hidden">
              <p className="truncate text-xs text-[var(--parent-rail-muted)]">
                <span className="font-medium text-[var(--parent-rail-fg)]">Context: </span>
                {contextLine || '—'}
              </p>
            </div>
            <nav
              className="flex gap-1 overflow-x-auto border-b border-[var(--parent-rail-border)] bg-[var(--parent-rail-surface-glass)] px-2 py-2 backdrop-blur-md lg:hidden"
              aria-label="Family sections"
            >
              <NavLink to="/app/dashboard/overview" className={parentMobileTabClass} end>
                Overview
              </NavLink>
              <NavLink to="/app/dashboard/parent/settings" className={parentMobileTabClass}>
                Comfort
              </NavLink>
            </nav>
          </header>
        ) : (
          <header className="z-10 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-md print:hidden">
            <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <SchoolLogoFigure variant="nav" className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">TAIM</p>
                  <p className="truncate text-xs text-[var(--color-muted)]">{roleTitle(role)}</p>
                </div>
              </div>
              <div className="hidden min-w-0 flex-1 lg:block">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Current context</p>
                <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">{contextLine}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)] sm:inline">
                  {roleTitle(role)}
                </span>
                <Button type="button" variant="outline" size="sm" className="lg:hidden" onClick={signOut}>
                  <LogOut className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            </div>
            <div className="border-t border-[var(--color-border)] px-4 py-2 lg:hidden">
              <p className="truncate text-xs text-[var(--color-muted)]">
                <span className="font-medium text-[var(--color-foreground)]">Context: </span>
                {contextLine || '—'}
              </p>
            </div>
          </header>
        )}

        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:min-h-0 lg:px-8 lg:py-8',
            isTeacher &&
              'relative z-10 bg-[var(--color-background)]/28 backdrop-blur-sm dark:bg-[var(--color-background)]/38',
            isAdmin &&
              'relative z-10 bg-[var(--color-background)]/28 backdrop-blur-sm dark:bg-[var(--color-background)]/38',
            isParent &&
              'relative z-10 bg-[var(--color-background)]/28 backdrop-blur-sm dark:bg-[var(--color-background)]/38',
          )}
        >
          <div className={cn('mx-auto', isAdmin ? 'max-w-7xl' : 'max-w-6xl')}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
