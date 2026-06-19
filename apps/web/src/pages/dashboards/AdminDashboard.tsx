import { useMemo } from 'react';
import { Building2, CalendarCheck, GraduationCap, School, UsersRound } from 'lucide-react';
import { AdminDashboardAlerts } from '@/components/admin/AdminDashboardAlerts';
import { AdminDashboardCalendar } from '@/components/admin/AdminDashboardCalendar';
import { AdminDashboardQuickActions } from '@/components/admin/AdminDashboardQuickActions';
import { AdminTeacherWorkforceCard } from '@/components/admin/AdminTeacherWorkforceCard';
import { AdminInsightCharts } from '@/components/admin/AdminInsightCharts';
import { AdminMetricHero } from '@/components/admin/AdminMetricHero';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { deriveAdminDashboardAlerts, useAdminSchoolSnapshot, type AdminDashboardAlertItem } from '@/hooks/useAdminSchoolSnapshot';
import { useAuthStore } from '@/store/authStore';

type School = { id: string; name: string; slug: string };

const SUPER_ALERTS: AdminDashboardAlertItem[] = [
  {
    id: 's1',
    title: 'Tenant provisioning',
    detail: 'Verify DNS and SSO readiness before onboarding new schools.',
    tone: 'info',
  },
  {
    id: 's2',
    title: 'Policy consistency',
    detail: 'Align default grading scales across schools to reduce support load.',
    tone: 'warning',
  },
  {
    id: 's3',
    title: 'Backup window',
    detail: 'Nightly exports completed successfully for all active tenants.',
    tone: 'success',
  },
];

export function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const mock = isDevMockToken(token);
  const isSuper = role === 'SUPER_ADMIN';
  const snapshot = useAdminSchoolSnapshot();
  const schoolAlerts = useMemo(() => deriveAdminDashboardAlerts(snapshot), [snapshot]);

  const { isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools', 'all'],
    queryFn: () => apiFetch<{ data: School[] }>('/api/v1/schools', { token }),
    enabled: !!token && role === 'SUPER_ADMIN' && !mock,
  });

  return (
    <div className="portal-page space-y-8">
      <PageHeader
        title="Dashboard"
        description={
          isSuper
            ? 'Platform-wide health — schools, tenants, and operational posture at a glance.'
            : 'Central intelligence for your school — KPIs, alerts, and shortcuts stay in sync with every admin module.'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isSuper ? (
          <AdminMetricHero
            icon={Building2}
            label="Schools on platform"
            value={schoolsLoading ? '…' : (snapshot.schoolCount ?? 0)}
            hint="Active tenants"
            tone="indigo"
          />
        ) : (
          <AdminMetricHero
            icon={GraduationCap}
            label="Total students"
            value={snapshot.isLoading ? '…' : (snapshot.studentCount ?? '—')}
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
            value={snapshot.isLoading ? '…' : (snapshot.teacherCount ?? '—')}
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
            value={snapshot.isLoading ? '…' : (snapshot.presentToday ?? '0')}
            hint={
              snapshot.attendanceRatePct != null
                ? `${snapshot.attendanceRatePct}% present · ${snapshot.today}`
                : `Present marks · ${snapshot.today}`
            }
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
            value={snapshot.isLoading ? '…' : (snapshot.classCount ?? '—')}
            hint="Streams / cohorts"
            tone="indigo"
          />
        )}
      </div>

      {!isSuper ? <AdminDashboardQuickActions /> : null}

      {!isSuper && !mock ? <AdminTeacherWorkforceCard /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminDashboardAlerts items={isSuper ? SUPER_ALERTS : schoolAlerts} />
        {!isSuper ? (
          <AdminDashboardCalendar />
        ) : (
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Multi-school calendar</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Cross-tenant scheduling and term alignment views ship next.
            </p>
          </section>
        )}
      </div>

      <AdminInsightCharts />
    </div>
  );
}
