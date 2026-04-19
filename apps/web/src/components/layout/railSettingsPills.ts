import { cn } from '@/lib/utils';

/** Portal rail: uppercase SETTINGS section title (dark green / rail foreground). */
export function railSettingsHeadingClass(rail: 'student' | 'teacher' | 'admin' | 'parent' | 'legacy') {
  const fg =
    rail === 'student'
      ? 'text-[var(--student-rail-fg)]'
      : rail === 'teacher'
        ? 'text-[var(--teacher-rail-fg)]'
        : rail === 'admin'
          ? 'text-[var(--admin-rail-fg)]'
          : rail === 'parent'
            ? 'text-[var(--parent-rail-fg)]'
            : 'text-[var(--color-sidebar-foreground)]';
  return cn(
    'mb-2.5 px-1 text-[10px] font-bold uppercase tracking-[0.14em]',
    fg,
  );
}

const ringOffset = (rail: 'student' | 'teacher' | 'admin' | 'parent' | 'legacy') =>
  rail === 'student'
    ? 'focus-visible:ring-offset-[var(--student-rail-surface)]'
    : rail === 'teacher'
      ? 'focus-visible:ring-offset-[var(--teacher-rail-surface)]'
      : rail === 'admin'
        ? 'focus-visible:ring-offset-[var(--admin-rail-surface)]'
        : rail === 'parent'
          ? 'focus-visible:ring-offset-[var(--parent-rail-surface)]'
          : 'focus-visible:ring-offset-[var(--color-background)]';

const ring = (rail: 'student' | 'teacher' | 'admin' | 'parent' | 'legacy') =>
  rail === 'student'
    ? 'focus-visible:ring-[var(--student-rail-accent)]'
    : rail === 'teacher'
      ? 'focus-visible:ring-[var(--teacher-rail-accent)]'
      : rail === 'admin'
        ? 'focus-visible:ring-[var(--admin-rail-accent)]'
        : rail === 'parent'
          ? 'focus-visible:ring-[var(--parent-rail-accent)]'
          : 'focus-visible:ring-[var(--color-primary)]';

/** Frosted pill control: Display & comfort nav or Log out button (dashboard rails). */
export function railSettingsPillClass(
  rail: 'teacher' | 'admin' | 'parent' | 'legacy',
  opts?: { active?: boolean; adminCollapsed?: boolean },
) {
  const { active, adminCollapsed } = opts ?? {};
  const surface =
    rail === 'teacher'
      ? {
          border: 'border-[var(--teacher-rail-border)]',
          bg: 'bg-[color-mix(in_oklch,var(--teacher-rail-chip)_88%,transparent)]',
          hover: 'hover:bg-[var(--teacher-rail-chip-hover)]',
          fg: 'text-[var(--teacher-rail-fg)]',
          activeBorder:
            'border-[color-mix(in_oklch,var(--teacher-rail-accent)_38%,var(--teacher-rail-border))]',
          activeBg: 'bg-[var(--teacher-rail-accent-soft)]',
          activeFg: 'text-[var(--teacher-rail-accent)]',
        }
      : rail === 'admin'
        ? {
            border: 'border-[var(--admin-rail-border)]',
            bg: 'bg-[color-mix(in_oklch,var(--admin-rail-chip)_88%,transparent)]',
            hover: 'hover:bg-[var(--admin-rail-chip-hover)]',
            fg: 'text-[var(--admin-rail-fg)]',
            activeBorder:
              'border-[color-mix(in_oklch,var(--admin-rail-accent)_38%,var(--admin-rail-border))]',
            activeBg: 'bg-[var(--admin-rail-accent-soft)]',
            activeFg: 'text-[var(--admin-rail-accent)]',
          }
        : rail === 'parent'
          ? {
              border: 'border-[var(--parent-rail-border)]',
              bg: 'bg-[color-mix(in_oklch,var(--parent-rail-chip)_88%,transparent)]',
              hover: 'hover:bg-[var(--parent-rail-chip-hover)]',
              fg: 'text-[var(--parent-rail-fg)]',
              activeBorder:
                'border-[color-mix(in_oklch,var(--parent-rail-accent)_38%,var(--parent-rail-border))]',
              activeBg: 'bg-[var(--parent-rail-accent-soft)]',
              activeFg: 'text-[var(--parent-rail-accent)]',
            }
          : {
              border: 'border-[var(--color-sidebar-border)]',
              bg: 'bg-white/[0.08]',
              hover: 'hover:bg-white/[0.12]',
              fg: 'text-[var(--color-sidebar-foreground)]',
              activeBorder: 'border-[var(--color-border)]',
              activeBg: 'bg-white/[0.14]',
              activeFg: 'text-[var(--color-sidebar-foreground)]',
            };

  return cn(
    'student-interactive-well flex w-full items-center gap-3 rounded-full border px-4 py-3 text-left text-sm font-semibold shadow-sm outline-none backdrop-blur-md transition-colors',
    'focus-visible:ring-2 focus-visible:ring-offset-2',
    ring(rail),
    ringOffset(rail),
    adminCollapsed && 'lg:justify-center lg:gap-0 lg:px-2.5 lg:py-2.5',
    active
      ? cn(surface.activeBorder, surface.activeBg, surface.activeFg)
      : cn(surface.border, surface.bg, surface.fg, surface.hover),
  );
}

/** Student rail: same frosted pill row as dashboard (narrow + wide breakpoints). */
export function studentRailSettingsPillClass(opts?: { pressed?: boolean }) {
  const { pressed } = opts ?? {};
  return cn(
    'student-interactive-well flex w-full items-center justify-center gap-0.5 rounded-full border px-3 py-3 text-[10px] font-semibold shadow-sm outline-none backdrop-blur-md transition-colors sm:justify-start sm:gap-3 sm:px-4 sm:py-3 sm:text-sm',
    'border-[var(--student-rail-border)] text-[var(--student-rail-fg)] focus-visible:ring-2 focus-visible:ring-[var(--student-rail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--student-rail-surface)]',
    pressed
      ? 'border-[color-mix(in_oklch,var(--student-rail-accent)_42%,var(--student-rail-border))] bg-[var(--student-rail-accent-soft)] text-[var(--student-rail-accent)] shadow-sm hover:bg-[color-mix(in_oklch,var(--student-rail-accent-soft)_88%,var(--student-rail-chip))]'
      : 'bg-[color-mix(in_oklch,var(--student-rail-chip)_88%,transparent)] hover:bg-[var(--student-rail-chip-hover)]',
  );
}
