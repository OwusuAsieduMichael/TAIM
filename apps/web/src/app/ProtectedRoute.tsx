import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
