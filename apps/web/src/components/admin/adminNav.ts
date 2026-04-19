import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  School,
  ScrollText,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react';

export type AdminNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

/** Primary school admin navigation — matches `/app/dashboard/*` routes. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: '/app/dashboard/overview', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/dashboard/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/app/dashboard/admin/teachers', label: 'Teachers', icon: UsersRound },
  { to: '/app/dashboard/admin/classes', label: 'Classes', icon: School },
  { to: '/app/dashboard/admin/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/app/dashboard/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/app/dashboard/admin/results', label: 'Results', icon: ScrollText },
  { to: '/app/dashboard/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/dashboard/admin/settings', label: 'Settings', icon: Settings },
];
