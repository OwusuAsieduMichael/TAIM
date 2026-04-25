import { Bell, ChevronDown, LogOut, Menu, Search, Settings, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { PortalBackButton } from '@/components/layout/PortalBackButton';
import { Button } from '@/components/ui/button';
import { PORTAL_DASHBOARD_HOME } from '@/lib/portalRoutes';
import { cn } from '@/lib/utils';

type Props = {
  contextLine: string;
  roleLabel: string;
  /** When set with `onToggleMobileNav`, the control toggles the rail and shows Menu vs close icon. */
  mobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
  showMobileMenu?: boolean;
  onSignOut: () => void;
};

export function AdminTopBar({
  contextLine,
  roleLabel,
  mobileNavOpen = false,
  onToggleMobileNav,
  showMobileMenu,
  onSignOut,
}: Props) {
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  return (
    <div className="flex min-h-14 shrink-0 flex-col bg-transparent lg:flex-row lg:items-center lg:gap-4 lg:px-6 lg:py-2">
      <div className="flex items-center gap-2 px-3 py-2 lg:hidden">
        {showMobileMenu && onToggleMobileNav ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'student-interactive-well h-10 w-10 shrink-0 border p-0 transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out',
              'motion-reduce:transition-none',
              'active:scale-[0.96] motion-reduce:active:scale-100',
              'focus-visible:ring-2 focus-visible:ring-[var(--admin-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-rail-surface)]',
              mobileNavOpen
                ? 'border-[color-mix(in_oklch,var(--admin-rail-accent)_38%,var(--admin-rail-border))] bg-[var(--admin-rail-accent-soft)] text-[var(--admin-rail-accent)] shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--admin-rail-accent)_22%,transparent)]'
                : 'border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)]',
            )}
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            onClick={onToggleMobileNav}
          >
            {mobileNavOpen ? (
              <X className="h-5 w-5" strokeWidth={2} aria-hidden />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
            )}
          </Button>
        ) : null}
        <PortalBackButton rail="admin" fallbackPath={PORTAL_DASHBOARD_HOME} className="shrink-0 lg:hidden" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-rail-muted)]">Context</p>
          <p className="truncate text-sm font-semibold text-[var(--admin-rail-fg)]">{contextLine || '—'}</p>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
        <PortalBackButton rail="admin" fallbackPath={PORTAL_DASHBOARD_HOME} className="shrink-0" />
        <label className="relative max-w-md flex-1">
          <span className="sr-only">Global search</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-rail-muted)]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search students, classes, staff…"
            className={cn(
              'h-10 w-full rounded-xl border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] py-2 pl-10 pr-3 text-sm font-medium text-[var(--admin-rail-fg)] shadow-sm outline-none',
              'placeholder:text-[var(--admin-rail-muted)] focus:border-[var(--admin-rail-accent)] focus:ring-2 focus:ring-[color-mix(in_oklch,var(--admin-rail-accent)_35%,transparent)]',
            )}
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--admin-rail-border)] px-3 py-2 lg:border-t-0 lg:px-0 lg:py-0">
        <div className="relative lg:hidden">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-rail-muted)]" strokeWidth={2} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="h-9 w-[min(100%,12rem)] rounded-lg border border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] py-1.5 pl-9 pr-2 text-xs font-medium text-[var(--admin-rail-fg)] outline-none focus:border-[var(--admin-rail-accent)]"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="student-interactive-well relative h-10 w-10 shrink-0 rounded-xl border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] p-0 text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)]"
            aria-label="Notifications"
          >
            <Bell className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.85} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-warning)] ring-2 ring-[var(--admin-rail-surface)]" />
          </Button>

          <div className="relative" ref={menuRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="student-interactive-well h-10 gap-1.5 rounded-xl border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] px-2.5 font-semibold text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)] sm:px-3"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--admin-rail-border)] bg-[var(--admin-rail-surface)] text-[10px] font-bold text-[var(--admin-rail-accent)]">
                {roleLabel.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[8rem] truncate text-xs sm:inline">{roleLabel}</span>
              <ChevronDown className="h-4 w-4 text-[var(--admin-rail-muted)]" strokeWidth={2} />
            </Button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-lg"
              >
                <NavLink
                  role="menuitem"
                  to="/app/dashboard/admin/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" strokeWidth={1.75} />
                  Settings
                </NavLink>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  Log out
                </button>
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="student-interactive-well hidden rounded-xl border-[var(--admin-rail-border)] bg-[var(--admin-rail-chip)] text-[var(--admin-rail-fg)] hover:bg-[var(--admin-rail-chip-hover)] sm:inline-flex"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
