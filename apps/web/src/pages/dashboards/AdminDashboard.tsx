import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Building2, CalendarCheck, GraduationCap, School, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminInsightCharts } from '@/components/admin/AdminInsightCharts';
import { AdminMetricHero } from '@/components/admin/AdminMetricHero';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { localDateKey } from '@/lib/teacherLocalDate';
import { isDevMockToken, SEED_DEMO } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

type School = { id: string; name: string; slug: string };

type AttRow = { status?: string };

export function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const mock = isDevMockToken(token);
  const isSuper = role === 'SUPER_ADMIN';
  const today = useMemo(() => localDateKey(), []);

  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school', 'me'],
    queryFn: () => apiFetch<School>('/api/v1/schools/me', { token }),
    enabled: !!token && role !== 'SUPER_ADMIN' && !mock,
  });
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools', 'all'],
    queryFn: () => apiFetch<{ data: School[] }>('/api/v1/schools', { token }),
    enabled: !!token && role === 'SUPER_ADMIN' && !mock,
  });
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => apiFetch<{ data: unknown[] }>('/api/v1/students', { token }),
    enabled: !!token && role === 'ADMIN' && !mock,
  });
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', 'admin-dash'],
    queryFn: () => apiFetch<{ data: unknown[] }>('/api/v1/classes', { token }),
    enabled: !!token && role === 'ADMIN' && !mock,
  });
  const { data: teacherSubjects, isLoading: tsLoading } = useQuery({
    queryKey: ['teacher-subjects', 'admin-dash'],
    queryFn: () => apiFetch<{ data: { teacherId: string }[] }>('/api/v1/teacher-subjects', { token }),
    enabled: !!token && role === 'ADMIN' && !mock,
  });
  const { data: attendanceToday, isLoading: attLoading } = useQuery({
    queryKey: ['attendance', 'admin-dash', today],
    queryFn: () => apiFetch<{ data: AttRow[] }>(`/api/v1/attendance?date=${encodeURIComponent(today)}`, { token }),
    enabled: !!token && role === 'ADMIN' && !mock,
  });

  const studentCount = students?.data?.length ?? null;
  const schoolCount = schools?.data?.length ?? null;
  const classCount = classes?.data?.length ?? null;
  const teacherCount = useMemo(() => {
    const rows = teacherSubjects?.data;
    if (!rows?.length) return null;
    return new Set(rows.map((r) => r.teacherId)).size;
  }, [teacherSubjects]);

  const presentToday = useMemo(() => {
    const rows = attendanceToday?.data;
    if (!rows?.length) return null;
    return rows.filter((r) => (r.status ?? 'PRESENT') === 'PRESENT').length;
  }, [attendanceToday]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={
          isSuper
            ? 'Platform-wide health — schools, tenants, and operational posture at a glance.'
            : 'Operational snapshot for your school — enrolment, staffing, and today’s attendance pulse.'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isSuper ? (
          <AdminMetricHero
            icon={Building2}
            label="Schools on platform"
            value={schoolsLoading ? '…' : (schoolCount ?? 0)}
            hint="Active tenants"
            tone="indigo"
          />
        ) : (
          <AdminMetricHero
            icon={GraduationCap}
            label="Total students"
            value={studentsLoading ? '…' : (studentCount ?? '—')}
            hint="Enrolled learners"
            tone="indigo"
          />
        )}
        {isSuper ? (
          <AdminMetricHero
            icon={UsersRound}
            label="Administrators"
            value="—"
            hint="Per-school admins (API next)"
            tone="neutral"
          />
        ) : (
          <AdminMetricHero
            icon={UsersRound}
            label="Total teachers"
            value={tsLoading ? '…' : (teacherCount ?? '—')}
            hint="Unique staff with assignments"
            tone="indigo"
          />
        )}
        {isSuper ? (
          <AdminMetricHero
            icon={CalendarCheck}
            label="Attendance today"
            value="—"
            hint="Cross-tenant rollups ship next"
            tone="warning"
          />
        ) : (
          <AdminMetricHero
            icon={CalendarCheck}
            label="Attendance today"
            value={attLoading ? '…' : (presentToday ?? '0')}
            hint={`Present marks · ${today}`}
            tone="success"
          />
        )}
        {isSuper ? (
          <AdminMetricHero
            icon={School}
            label="Active classes"
            value="—"
            hint="Aggregated across schools"
            tone="neutral"
          />
        ) : (
          <AdminMetricHero
            icon={School}
            label="Active classes"
            value={classesLoading ? '…' : (classCount ?? '—')}
            hint="Streams / cohorts"
            tone="indigo"
          />
        )}
      </div>

      <AdminInsightCharts />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-[var(--color-border)] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_20px_-4px_rgb(0_0_0/0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">School</CardTitle>
            <CardDescription>Active organisation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isSuper ? (
              mock ? (
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  Layout preview — the live multi-school list appears after a real super-admin sign-in.
                </p>
              ) : schoolsLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-[75%] animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
                  <div className="h-4 w-[50%] animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
                </div>
              ) : (schools?.data?.length ?? 0) === 0 ? (
                <p className="text-[var(--color-muted)]">No schools registered yet.</p>
              ) : (
                <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)]">
                  {schools?.data?.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]">
                      <span className="font-medium text-[var(--color-foreground)]">{s.name}</span>
                      <code className="shrink-0 rounded-md bg-[var(--color-muted)]/10 px-2 py-0.5 text-xs text-[var(--color-muted)]">
                        {s.slug}
                      </code>
                    </li>
                  ))}
                </ul>
              )
            ) : mock ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/[0.04] p-4">
                <p className="text-base font-semibold text-[var(--color-foreground)]">{SEED_DEMO.schoolDisplayName}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Layout preview · public slug{' '}
                  <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 dark:bg-white/[0.08]">{SEED_DEMO.schoolSlug}</code>
                </p>
              </div>
            ) : schoolLoading ? (
              <div className="space-y-2">
                <div className="h-5 w-48 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
                <div className="h-4 w-32 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
              </div>
            ) : school ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/[0.04] p-4">
                <p className="text-base font-semibold text-[var(--color-foreground)]">{school.name}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Public slug <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 dark:bg-white/[0.08]">{school.slug}</code>
                </p>
              </div>
            ) : (
              <p className="text-[var(--color-muted)]">Could not load school details.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--color-border)] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_20px_-4px_rgb(0_0_0/0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">API &amp; automation</CardTitle>
            <CardDescription>For technical staff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--color-muted)]">
            <p>
              Authenticated REST endpoints power students, classes, attendance, and results. Use the explorer to test
              payloads before wiring integrations.
            </p>
            <p>
              <a
                className="font-semibold text-[var(--color-primary)] underline decoration-[var(--color-primary)]/35 underline-offset-2 hover:decoration-[var(--color-primary)]"
                href="http://localhost:4000/api-docs"
                target="_blank"
                rel="noreferrer"
              >
                Open API documentation
              </a>
              <span className="text-[var(--color-muted)]"> · local development</span>
            </p>
            <p className="border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed">
              Typical routes include <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 dark:bg-white/[0.08]">/students</code>,{' '}
              <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 dark:bg-white/[0.08]">/classes</code>,{' '}
              <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 dark:bg-white/[0.08]">/attendance</code>, and{' '}
              <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 dark:bg-white/[0.08]">/results</code>.
            </p>
            <p className="text-xs">
              <Link
                className="font-semibold text-[var(--color-primary)] underline decoration-[var(--color-primary)]/35 underline-offset-2"
                to="/"
              >
                Leave workspace
              </Link>{' '}
              to switch portal or account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
