import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { ParentDashboard } from '@/pages/dashboards/ParentDashboard';
import { StudentDashboard } from '@/pages/dashboards/StudentDashboard';
import { TeacherDashboard } from '@/pages/dashboards/TeacherDashboard';
import { HomePage } from '@/pages/HomePage';
import { LoginAdminPage } from '@/pages/LoginAdminPage';
import { LoginParentPage } from '@/pages/LoginParentPage';
import { LoginStudentPage } from '@/pages/LoginStudentPage';
import { LoginTeacherPage } from '@/pages/LoginTeacherPage';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from './ProtectedRoute';

function RoleDashboard() {
  const role = useAuthStore((s) => s.role);
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return <AdminDashboard />;
  if (role === 'TEACHER') return <TeacherDashboard />;
  if (role === 'PARENT') return <ParentDashboard />;
  if (role === 'STUDENT') return <StudentDashboard />;
  return <Navigate to="/" replace />;
}

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login/admin', element: <LoginAdminPage /> },
  { path: '/login/teacher', element: <LoginTeacherPage /> },
  { path: '/login/parent', element: <LoginParentPage /> },
  { path: '/login/student', element: <LoginStudentPage /> },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <RoleDashboard /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
