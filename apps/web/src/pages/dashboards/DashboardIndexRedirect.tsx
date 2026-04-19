import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** `/app/dashboard` — teachers land on attendance; everyone else on overview. */
export function DashboardIndexRedirect() {
  const role = useAuthStore((s) => s.role);
  if (role === 'TEACHER') {
    return <Navigate to="attendance" replace />;
  }
  return <Navigate to="overview" replace />;
}
