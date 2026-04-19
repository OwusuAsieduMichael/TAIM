import { useQuery } from '@tanstack/react-query';
import { Bell, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type Notification = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function ParentDashboard() {
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  const { data, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<{ data: Notification[] }>('/api/v1/notifications', { token }),
    enabled: !!token && !mock,
  });
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['results', 'parent'],
    queryFn: () => apiFetch<{ data: { subject: { name: string }; grade: number; remark: string }[] }>(
      '/api/v1/results?published=true',
      { token },
    ),
    enabled: !!token && !mock,
  });

  const list = data?.data ?? [];
  const unread = list.filter((n) => !n.readAt).length;
  const resultRows = results?.data ?? [];

  return (
    <div className="portal-page space-y-8">
      <PageHeader
        title="Family overview"
        description="Stay up to date with messages from the school and published results for your linked children."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={Bell}
          label="Notifications"
          value={notifLoading ? '…' : list.length}
          hint={unread > 0 ? `${unread} unread` : 'All caught up'}
          tone={unread > 0 ? 'warning' : 'default'}
        />
        <StatCard
          icon={GraduationCap}
          label="Published results"
          value={resultsLoading ? '…' : resultRows.length}
          hint="Visible grade entries"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-[var(--color-border)] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_20px_-4px_rgb(0_0_0/0.06)]">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>From teachers and administration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifLoading && (
              <div className="space-y-2">
                <div className="h-16 animate-pulse rounded-lg bg-black/[0.06]" />
                <div className="h-16 animate-pulse rounded-lg bg-black/[0.06]" />
              </div>
            )}
            {!notifLoading && list.length === 0 && (
              <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                No messages yet. Alerts about attendance and results will appear here.
              </p>
            )}
            {list.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-shadow',
                  !n.readAt && 'border-l-[3px] border-l-[var(--color-primary)] shadow-sm',
                )}
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-foreground)]">{n.title}</p>
                  {!n.readAt ? (
                    <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">{n.body}</p>
                <p className="mt-2 text-xs text-[var(--color-muted)]">{formatDate(n.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--color-border)] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_20px_-4px_rgb(0_0_0/0.06)]">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Official published grades only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {resultsLoading && <div className="h-24 animate-pulse rounded-lg bg-black/[0.06]" />}
            {!resultsLoading && resultRows.length === 0 && (
              <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                No published results yet. Your child&apos;s school will release grades when ready.
              </p>
            )}
            {resultRows.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
              >
                <span className="font-medium text-[var(--color-foreground)]">{r.subject.name}</span>
                <span className="tabular-nums text-sm text-[var(--color-muted)]">
                  Grade <span className="font-semibold text-[var(--color-foreground)]">{r.grade}</span>
                  <span className="text-[var(--color-muted)]"> · </span>
                  {r.remark}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
