import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  Home,
  LogOut,
  Menu,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StudentDisplayComfortSheet } from '@/components/student/StudentDisplayComfortSheet';
import { StudentErrorBoundary } from '@/components/student/StudentErrorBoundary';
import { StudentFAB } from '@/components/student/StudentFAB';
import { StudentLiveRegion } from '@/components/student/StudentLiveRegion';
import { StudentNotificationsSheet } from '@/components/student/StudentNotificationsSheet';
import { StudentShortcutsModal } from '@/components/student/StudentShortcutsModal';
import { StudentSkipLink } from '@/components/student/StudentSkipLink';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useStudentMe } from '@/hooks/useStudentPortal';
import { studentRouteMeta } from '@/lib/studentRouteMeta';
import { bumpVisitStreak } from '@/lib/studentVisitStreak';
import { railSettingsHeadingClass, studentRailSettingsPillClass } from '@/components/layout/railSettingsPills';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { triggerStudentHaptic, useStudentPrefsStore } from '@/store/studentPrefsStore';

const railLink =
  'student-interactive-well group flex w-full flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 text-[10px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--student-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--student-rail-surface)] sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5 sm:text-left sm:text-sm';

const STUDENT_HOME_PATH = '/app/student/home';

export function StudentAppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const { data: me } = useStudentMe();
  const qc = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clear);
  const density = useStudentPrefsStore((s) => s.density);
  const [announce, setAnnounce] = useState('');
  const [comfortOpen, setComfortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useLayoutEffect(() => {
    bumpVisitStreak();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      if (mq.matches) setSidebarOpen(true);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    setComfortOpen(false);
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const refreshPortal = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['auth', 'me'] }),
      qc.invalidateQueries({ queryKey: ['results', 'student', 'portal'] }),
    ]);
    triggerStudentHaptic('light');
    const t = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    setAnnounce(`Dashboard data refreshed at ${t}.`);
  }, [qc]);

  const signOut = useCallback(() => {
    triggerStudentHaptic('light');
    clearAuth();
    navigate('/');
  }, [clearAuth, navigate]);

  const route = studentRouteMeta(pathname);
  const fullName = me?.fullName ?? 'Student';
  const avatarUrl = me?.student?.passportPhotoUrl;
  const showBack = pathname !== STUDENT_HOME_PATH;

  const studentHeaderIconBtn = cn(
    'student-interactive-well text-[var(--student-rail-fg)] hover:bg-[var(--student-rail-hover)] hover:text-[var(--student-rail-fg)]',
    'dark:hover:bg-[var(--student-rail-hover)] focus-visible:ring-[var(--student-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--student-rail-surface)]',
  );

  return (
    <div
      className={cn(
        'student-portal-root relative isolate flex min-h-dvh bg-[var(--color-background)]',
      )}
      data-density={density}
    >
      <div className="print:hidden">
        <StudentLiveRegion message={announce} />
      </div>

      <div className="student-portal-bg print:hidden" aria-hidden />

      <aside
        className={cn(
          'student-nav-rail fixed bottom-0 left-0 top-0 z-50 flex h-dvh min-h-0 w-[4.5rem] flex-col border-r border-[var(--student-rail-border)] bg-[var(--student-rail-surface-glass)] backdrop-blur-md print:hidden sm:w-52',
          'max-lg:transition-transform max-lg:duration-200 max-lg:ease-out',
          !sidebarOpen && 'max-lg:pointer-events-none max-lg:-translate-x-full',
          'lg:translate-x-0',
        )}
        style={{
          paddingLeft: 'max(0px, env(safe-area-inset-left))',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
        aria-label="Student navigation"
        id="student-sidebar-nav"
        aria-hidden={!sidebarOpen ? true : undefined}
      >
        <div className="border-b border-[var(--student-rail-border)] px-2 py-3.5 sm:px-4 sm:py-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
            <img
              src="/Tomhel_Logo-removebg-preview.png"
              alt=""
              width={44}
              height={44}
              className="aspect-square w-full max-w-[min(100%,2.5rem)] object-contain sm:h-11 sm:w-11 sm:max-w-none sm:shrink-0"
              decoding="async"
            />
            <div className="w-full min-w-0 text-center sm:flex-1 sm:text-left">
              <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--student-rail-muted)] sm:tracking-[0.18em]">
                TAIM
              </p>
              <p className="mt-0.5 hidden truncate text-sm font-semibold text-[var(--student-rail-fg)] sm:block">Student portal</p>
            </div>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2" aria-label="Primary">
          <NavLink
            to="/app/student/home"
            end
            className={({ isActive }) =>
              cn(
                railLink,
                isActive
                  ? 'bg-[var(--student-rail-accent-soft)] text-[var(--student-rail-accent)]'
                  : 'text-[var(--student-rail-muted)] hover:bg-[var(--student-rail-hover)] hover:text-[var(--student-rail-fg)]',
              )
            }
          >
            <Home className="h-5 w-5 shrink-0 sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={1.75} />
            <span className="sm:hidden">Home</span>
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink
            to="/app/student/results"
            className={({ isActive }) =>
              cn(
                railLink,
                isActive
                  ? 'bg-[var(--student-rail-accent-soft)] text-[var(--student-rail-accent)]'
                  : 'text-[var(--student-rail-muted)] hover:bg-[var(--student-rail-hover)] hover:text-[var(--student-rail-fg)]',
              )
            }
          >
            <Sparkles className="h-5 w-5 shrink-0 sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={1.75} />
            <span>Results</span>
          </NavLink>
          <NavLink
            to="/app/student/attendance"
            className={({ isActive }) =>
              cn(
                railLink,
                isActive
                  ? 'bg-[var(--student-rail-accent-soft)] text-[var(--student-rail-accent)]'
                  : 'text-[var(--student-rail-muted)] hover:bg-[var(--student-rail-hover)] hover:text-[var(--student-rail-fg)]',
              )
            }
          >
            <CalendarDays className="h-5 w-5 shrink-0 sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={1.75} />
            <span>Attendance</span>
          </NavLink>
          <NavLink
            to="/app/student/profile"
            className={({ isActive }) =>
              cn(
                railLink,
                isActive
                  ? 'bg-[var(--student-rail-accent-soft)] text-[var(--student-rail-accent)]'
                  : 'text-[var(--student-rail-muted)] hover:bg-[var(--student-rail-hover)] hover:text-[var(--student-rail-fg)]',
              )
            }
          >
            <UserRound className="h-5 w-5 shrink-0 sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={1.75} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div
          className="shrink-0 border-t border-[var(--student-rail-border)] px-2 pb-[max(1.125rem,calc(0.5rem+env(safe-area-inset-bottom)))] pt-3"
          aria-label="Settings"
        >
          <p
            className={cn(
              railSettingsHeadingClass('student'),
              'mb-2 px-2 text-center sm:text-left',
            )}
          >
            Settings
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                triggerStudentHaptic('light');
                setComfortOpen(true);
              }}
              className={cn(
                studentRailSettingsPillClass({ pressed: comfortOpen }),
                'hover:text-[var(--student-rail-fg)]',
              )}
              aria-expanded={comfortOpen}
              aria-controls="student-comfort-sheet"
              aria-label="Display and comfort"
            >
              <SlidersHorizontal className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.75} />
              <span className="max-w-[3.25rem] leading-tight sm:hidden">Comfort</span>
              <span className="hidden min-w-0 flex-1 truncate sm:inline">Display &amp; comfort</span>
            </button>
            <button
              type="button"
              onClick={signOut}
              className={cn(studentRailSettingsPillClass(), 'hover:text-[var(--student-rail-fg)]')}
              aria-label="Log out of student portal"
            >
              <LogOut className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.75} />
              <span className="min-w-0 truncate">Log out</span>
            </button>
          </div>
        </div>
      </aside>

      <StudentDisplayComfortSheet open={comfortOpen} onClose={() => setComfortOpen(false)} />

      <div
        className={cn(
          'relative z-10 flex min-h-dvh min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out print:pl-0',
          sidebarOpen ? 'pl-[4.5rem] sm:pl-52' : 'max-lg:pl-0',
          'lg:pl-52',
        )}
      >
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[19] bg-black/40 backdrop-blur-[1px] transition-opacity lg:hidden print:hidden"
            onClick={() => {
              triggerStudentHaptic('light');
              setSidebarOpen(false);
            }}
          />
        ) : null}

        <StudentSkipLink className="relative z-30" />

        {!online ? (
          <div className="relative z-30 flex items-center gap-2 border-b border-[var(--color-warning)]/40 bg-[var(--color-warning)]/12 px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] print:hidden">
            <WifiOff className="h-4 w-4 shrink-0 text-[var(--color-warning)]" strokeWidth={2} />
            <span>You&apos;re offline — showing saved data. Reconnect to refresh.</span>
          </div>
        ) : null}

        <header className="student-header-blur student-top-header relative z-30 sticky top-0 flex flex-col gap-0 border-b border-[var(--student-rail-border)] bg-[var(--student-rail-surface-glass)] text-[var(--student-rail-fg)] backdrop-blur-md print:hidden sm:px-5">
          <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerStudentHaptic('light');
                  setSidebarOpen((o) => !o);
                }}
                className="student-interactive-well flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--student-rail-border)] bg-[var(--student-rail-chip)] text-[var(--student-rail-fg)] hover:bg-[var(--student-rail-chip-hover)] lg:hidden"
                aria-expanded={sidebarOpen}
                aria-controls="student-sidebar-nav"
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
                )}
              </button>
              {showBack ? (
                <button
                  type="button"
                  onClick={() => {
                    triggerStudentHaptic('light');
                    navigate(-1);
                  }}
                  className="student-interactive-well flex h-11 shrink-0 items-center gap-0.5 rounded-xl border border-[var(--student-rail-border)] bg-[var(--student-rail-chip)] px-2.5 text-sm font-semibold text-[var(--student-rail-fg)] hover:bg-[var(--student-rail-chip-hover)] sm:px-3"
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--student-rail-accent)]" strokeWidth={2.25} aria-hidden />
                  <span className="hidden sm:inline">Back</span>
                </button>
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--student-rail-muted)]">{route.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-[var(--student-rail-border)] bg-[var(--student-rail-chip)] px-2.5 py-1 sm:flex">
                <div className="h-7 w-7 overflow-hidden rounded-full border border-[var(--student-rail-border)] bg-[var(--student-rail-surface)]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[var(--student-rail-muted)]">
                      {fullName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="max-w-[11rem] truncate text-sm font-medium text-[var(--student-rail-fg)]">{fullName}</p>
              </div>
          
            <StudentShortcutsModal onRefresh={refreshPortal} triggerClassName={studentHeaderIconBtn} />
            <StudentNotificationsSheet triggerClassName={studentHeaderIconBtn} />
            <ThemeToggle className={studentHeaderIconBtn} />
            </div>
          </div>
          <div className="border-t border-[var(--student-rail-border)] px-4 py-2 sm:px-5">
            <p className="mt-0.5 truncate text-xs text-[var(--student-rail-muted)]">{route.hint}</p>
          </div>
        </header>

        <div
          id="student-main"
          tabIndex={-1}
          className={cn(
            'relative z-20 min-h-0 flex-1 bg-[var(--color-background)]/28 backdrop-blur-sm outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]/30 dark:bg-[var(--color-background)]/38',
            sidebarOpen && 'max-lg:pointer-events-none',
          )}
        >
          <StudentErrorBoundary>
            <div
              key={pathname}
              className="portal-page min-h-0 flex-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            >
              <Outlet />
            </div>
          </StudentErrorBoundary>
        </div>

        <div className="print:hidden">
          <StudentFAB />
        </div>
      </div>
    </div>
  );
}
