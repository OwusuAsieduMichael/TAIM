import { Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { ParentDashboard } from '@/pages/dashboards/ParentDashboard';
import { useAuthStore } from '@/store/authStore';

/** `/app/dashboard/overview` — school admin, super admin, and parent home. */
export function DashboardOverviewPage() {
  const role = useAuthStore((s) => s.role);
  if (role === 'TEACHER') {
    return <Navigate to="/app/dashboard/attendance" replace />;
  }
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return <AdminDashboard />;
  }
  if (role === 'PARENT') {
    return <ParentDashboard />;
  }
  return <Navigate to="/" replace />;
}
