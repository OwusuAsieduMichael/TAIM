import { useQuery } from '@tanstack/react-query';
import { LogOut, Palette, School, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { isDevMockToken, SEED_DEMO } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type School = { id: string; name: string; slug: string };

const settingsWell =
  'student-interactive-well border border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)] text-[var(--teacher-rail-fg)] hover:bg-[var(--teacher-rail-chip-hover)]';

export function TeacherSettingsPanel() {
  const clear = useAuthStore((s) => s.clear);
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const schoolSlug = useAuthStore((s) => s.schoolSlug);
  const navigate = useNavigate();
  const mock = isDevMockToken(token);

  const { data: school } = useQuery({
    queryKey: ['school', 'teacher-settings'],
    queryFn: () => apiFetch<School>('/api/v1/schools/me', { token }),
    enabled: !!token && role !== 'SUPER_ADMIN' && !mock,
    retry: false,
  });

  const contextLine = mock
    ? schoolSlug
      ? `${SEED_DEMO.schoolDisplayName} · ${schoolSlug}`
      : SEED_DEMO.schoolDisplayName
    : role === 'SUPER_ADMIN'
      ? 'All schools'
      : school
        ? school.name
        : role
          ? 'Loading school…'
          : '';

  const schoolContextDisplay =
    contextLine.trim().length > 0 ? contextLine : 'School name and slug will show here when your session is linked to a school.';

  function signOut() {
    clear();
    navigate('/');
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)] text-[var(--teacher-rail-accent)]">
            <Palette className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">Appearance</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Switch between light and dark. Your choice is saved on this device.</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--color-foreground)]">Theme</span>
              <ThemeToggle className={settingsWell} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)] text-[var(--teacher-rail-accent)]">
            <School className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">School context</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Where your teaching workspace pulls roster and term data from.</p>
            <p
              className={cn(
                'mt-3 rounded-xl border px-3 py-2.5 text-sm',
                contextLine.trim().length > 0
                  ? 'border-[var(--color-border)] bg-[var(--color-background)]/60 font-medium text-[var(--color-foreground)]'
                  : 'border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/5 italic text-[var(--color-muted)]',
              )}
            >
              {schoolContextDisplay}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/[0.06] p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--teacher-rail-border)] bg-[var(--teacher-rail-chip)]/80 text-[var(--teacher-rail-muted)]">
            <Sparkles className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Placeholder</p>
            <h2 className="mt-0.5 text-base font-semibold text-[var(--color-foreground)]">Teaching preferences</h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
              This block is reserved for upcoming options — for example default class, notification digests, and display
              density. Nothing here saves yet.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--color-muted)]">
              <li>Notification defaults (placeholder)</li>
              <li>Workspace layout (placeholder)</li>
              <li>Profile and contact (placeholder)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm backdrop-blur-sm">
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">Session</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">You can also sign out from the sidebar at any time.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('mt-4 inline-flex items-center gap-2', settingsWell)}
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </section>
    </div>
  );
}
