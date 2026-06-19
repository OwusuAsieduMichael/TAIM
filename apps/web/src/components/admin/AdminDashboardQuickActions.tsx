import { BarChart3, CalendarCheck, GraduationCap, ScrollText, UsersRound } from 'lucide-react';
import { ServiceHubCard } from '@/components/portal/ServiceHubCard';

const actions = [
  {
    href: '/app/dashboard/admin/students',
    title: 'Students',
    description: 'Add, review, and manage enrolled learners across classes.',
    icon: GraduationCap,
  },
  {
    href: '/app/dashboard/admin/teachers',
    title: 'Teachers',
    description: 'Manage staff profiles, assignments, and classroom coverage.',
    icon: UsersRound,
  },
  {
    href: '/app/dashboard/admin/attendance',
    title: "Today's attendance",
    description: 'Mark and review daily presence for every class.',
    icon: CalendarCheck,
  },
  {
    href: '/app/dashboard/admin/results',
    title: 'Results & publish',
    description: 'Enter scores, review grades, and publish term results.',
    icon: ScrollText,
  },
  {
    href: '/app/dashboard/admin/reports',
    title: 'Reports & analytics',
    description: 'Class performance, attendance trends, and export-ready summaries.',
    icon: BarChart3,
    featured: true,
  },
] as const;

export function AdminDashboardQuickActions() {
  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((item) => (
          <ServiceHubCard
            key={item.href}
            href={item.href}
            title={item.title}
            description={item.description}
            icon={item.icon}
            featured={'featured' in item ? item.featured : false}
          />
        ))}
      </div>
    </section>
  );
}
