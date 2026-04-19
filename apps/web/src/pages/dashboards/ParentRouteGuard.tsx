import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ParentRouteGuard({ children }: { children: ReactNode }) {
  const role = useAuthStore((s) => s.role);
  if (role === 'TEACHER') {
    return <Navigate to="/app/dashboard/attendance" replace />;
  }
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return <Navigate to="/app/dashboard/overview" replace />;
  }
  if (role !== 'PARENT') {
    return <Navigate to="/app/dashboard/overview" replace />;
  }
  return <>{children}</>;
}
