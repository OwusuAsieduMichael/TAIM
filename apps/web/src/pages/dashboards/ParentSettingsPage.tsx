import { useQuery } from '@tanstack/react-query';
import { LogOut, Palette, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { isDevMockToken, SEED_DEMO } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type SchoolMe = { id: string; name: string; slug: string };

const chip =
  'student-interactive-well border border-[var(--parent-rail-border)] bg-[var(--parent-rail-chip)] text-[var(--parent-rail-fg)] hover:bg-[var(--parent-rail-chip-hover)]';

export function ParentSettingsPage() {
  const clear = useAuthStore((s) => s.clear);
  const token = useAuthStore((s) => s.token);
  const schoolSlug = useAuthStore((s) => s.schoolSlug);
  const navigate = useNavigate();
  const mock = isDevMockToken(token);

  const { data: school } = useQuery({
    queryKey: ['school', 'parent-settings'],
    queryFn: () => apiFetch<SchoolMe>('/api/v1/schools/me', { token }),
    enabled: !!token && !mock,
    retry: false,
  });

  const contextLine = mock
    ? schoolSlug
      ? `${SEED_DEMO.schoolDisplayName} · ${schoolSlug}`
      : SEED_DEMO.schoolDisplayName
    : school
      ? school.name
      : 'Loading school…';

  function signOut() {
    clear();
    navigate('/');
  }

  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Settings"
        description="Appearance and session options for your family portal."
      />

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--parent-rail-border)] bg-[var(--parent-rail-chip)] text-[var(--parent-rail-accent)]">
            <Palette className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">Appearance</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Theme is saved on this device.</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--color-foreground)]">Theme</span>
              <ThemeToggle className={cn(chip, 'h-10 w-10 rounded-xl p-0')} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--parent-rail-border)] bg-[var(--parent-rail-chip)] text-[var(--parent-rail-accent)]">
            <School className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">School</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Organisation linked to your guardian account.</p>
            <p className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/60 px-3 py-2.5 text-sm font-medium text-[var(--color-foreground)]">
              {contextLine}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-5 shadow-sm backdrop-blur-sm">
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">Session</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">You can also log out from the sidebar.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('mt-4 inline-flex items-center gap-2', chip)}
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </section>
    </div>
  );
}
