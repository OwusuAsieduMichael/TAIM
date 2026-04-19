import { Navigate } from 'react-router-dom';

/** @deprecated Use `/app/dashboard/attendance` routes — kept for any stale imports. */
export function TeacherDashboard() {
  return <Navigate to="/app/dashboard/attendance" replace />;
}
