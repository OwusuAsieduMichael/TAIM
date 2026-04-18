import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Notification = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export function ParentDashboard() {
  const token = useAuthStore((s) => s.token);
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<{ data: Notification[] }>('/api/v1/notifications', { token }),
    enabled: !!token,
  });
  const { data: results } = useQuery({
    queryKey: ['results', 'parent'],
    queryFn: () => apiFetch<{ data: { subject: { name: string }; grade: number; remark: string }[] }>(
      '/api/v1/results?published=true',
      { token },
    ),
    enabled: !!token,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Parent home</h1>
        <p className="text-sm text-[var(--color-muted)]">Linked students, alerts, and published results.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Latest in-app messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.data?.length ?? 0) === 0 && <p className="text-sm text-[var(--color-muted)]">No notifications yet.</p>}
          {data?.data?.map((n) => (
            <div key={n.id} className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
              <p className="font-medium">{n.title}</p>
              <p className="text-[var(--color-muted)]">{n.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Published results</CardTitle>
          <CardDescription>Grades visible to guardians</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(results?.data?.length ?? 0) === 0 && <p className="text-[var(--color-muted)]">No published results yet.</p>}
          {results?.data?.map((r, i) => (
            <p key={i}>
              <span className="font-medium">{r.subject.name}</span>: grade {r.grade} ({r.remark})
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
