import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from '@/components/admin/adminNav';
import { cn } from '@/lib/utils';

type Props = {
  collapsed: boolean;
  onNavigate?: () => void;
};

export function AdminSidebarNav({ collapsed, onNavigate }: Props) {
  return (
    <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-2" aria-label="Administration">
      {ADMIN_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => onNavigate?.()}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(
              'admin-nav-well flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--admin-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-rail-surface)]',
              collapsed ? 'justify-center px-2 lg:justify-center' : '',
              isActive
                ? 'border-[color-mix(in_oklch,var(--admin-rail-accent)_35%,transparent)] bg-[var(--admin-rail-accent-soft)] text-[var(--admin-rail-accent)]'
                : 'text-[var(--admin-rail-muted)] hover:border-[var(--admin-rail-border)] hover:bg-[var(--admin-rail-hover)] hover:text-[var(--admin-rail-fg)]',
            )
          }
        >
          <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0 opacity-95" strokeWidth={1.85} aria-hidden />
          <span className={cn('min-w-0 truncate', collapsed && 'lg:sr-only')}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
