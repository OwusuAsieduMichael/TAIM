import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type School = { id: string; name: string; slug: string };

export function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const { data: school } = useQuery({
    queryKey: ['school', 'me'],
    queryFn: () => apiFetch<School>('/api/v1/schools/me', { token }),
    enabled: !!token && role !== 'SUPER_ADMIN',
  });
  const { data: schools } = useQuery({
    queryKey: ['schools', 'all'],
    queryFn: () => apiFetch<{ data: School[] }>('/api/v1/schools', { token }),
    enabled: !!token && role === 'SUPER_ADMIN',
  });
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => apiFetch<{ data: unknown[] }>('/api/v1/students', { token }),
    enabled: !!token && role === 'ADMIN',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Administration</h1>
        <p className="text-sm text-[var(--color-muted)]">Manage your school from this workspace.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School</CardTitle>
            <CardDescription>Active tenant</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {role === 'SUPER_ADMIN' ? (
              <div className="space-y-1">
                <p className="text-[var(--color-muted)]">Platform view · {schools?.data?.length ?? 0} schools</p>
                <ul className="list-inside list-disc text-[var(--color-muted)]">
                  {schools?.data?.map((s) => (
                    <li key={s.id}>
                      <span className="font-medium text-[var(--color-foreground)]">{s.name}</span> ({s.slug})
                    </li>
                  ))}
                </ul>
              </div>
            ) : school ? (
              <p>
                <span className="font-medium">{school.name}</span>
                <span className="text-[var(--color-muted)]"> · slug </span>
                <code className="rounded bg-black/5 px-1">{school.slug}</code>
              </p>
            ) : (
              <p className="text-[var(--color-muted)]">Loading…</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students</CardTitle>
            <CardDescription>Recently loaded list</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              <span className="font-semibold">{students?.data?.length ?? '—'}</span>
              <span className="text-[var(--color-muted)]"> records</span>
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API</CardTitle>
          <CardDescription>Use the REST API for full CRUD workflows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--color-muted)]">
          <p>
            OpenAPI UI:{' '}
            <a className="font-medium text-[var(--color-primary)] underline" href="http://localhost:4000/api-docs">
              http://localhost:4000/api-docs
            </a>
          </p>
          <p>
            Authenticated routes include <code className="rounded bg-black/5 px-1">/students</code>,{' '}
            <code className="rounded bg-black/5 px-1">/classes</code>,{' '}
            <code className="rounded bg-black/5 px-1">/attendance/bulk</code>, and{' '}
            <code className="rounded bg-black/5 px-1">/results</code>.
          </p>
          <p>
            <Link className="font-medium text-[var(--color-primary)] underline" to="/">
              Sign out and switch portal
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
