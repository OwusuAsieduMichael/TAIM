import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Default landing after `/app` — students use the dedicated portal shell. */
export function AppRoleRedirect() {
  const role = useAuthStore((s) => s.role);
  if (role === 'STUDENT') {
    return <Navigate to="/app/student/home" replace />;
  }
  return <Navigate to="/app/dashboard" replace />;
}
