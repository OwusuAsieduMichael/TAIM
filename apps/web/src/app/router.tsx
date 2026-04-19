import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { AppRoleRedirect } from '@/app/AppRoleRedirect';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StudentAppLayout } from '@/layouts/StudentAppLayout';
import { AdminAttendancePage } from '@/pages/dashboards/admin/AdminAttendancePage';
import { AdminClassesPage } from '@/pages/dashboards/admin/AdminClassesPage';
import { AdminReportsPage } from '@/pages/dashboards/admin/AdminReportsPage';
import { AdminResultsPage } from '@/pages/dashboards/admin/AdminResultsPage';
import { AdminSettingsPage } from '@/pages/dashboards/admin/AdminSettingsPage';
import { AdminStudentsPage } from '@/pages/dashboards/admin/AdminStudentsPage';
import { AdminSubjectsPage } from '@/pages/dashboards/admin/AdminSubjectsPage';
import { AdminTeachersPage } from '@/pages/dashboards/admin/AdminTeachersPage';
import { AdminRouteGuard } from '@/pages/dashboards/AdminRouteGuard';
import { ParentRouteGuard } from '@/pages/dashboards/ParentRouteGuard';
import { ParentSettingsPage } from '@/pages/dashboards/ParentSettingsPage';
import { DashboardIndexRedirect } from '@/pages/dashboards/DashboardIndexRedirect';
import { DashboardOverviewPage } from '@/pages/dashboards/DashboardOverviewPage';
import { TeacherRouteGuard } from '@/pages/dashboards/TeacherRouteGuard';
import { HomePage } from '@/pages/HomePage';
import { LoginAdminPage } from '@/pages/LoginAdminPage';
import { LoginParentPage } from '@/pages/LoginParentPage';
import { LoginStudentPage } from '@/pages/LoginStudentPage';
import { LoginTeacherPage } from '@/pages/LoginTeacherPage';
import { ProtectedRoute } from './ProtectedRoute';

const StudentHomePage = lazy(() =>
  import('@/pages/student/StudentHomePage').then((m) => ({ default: m.StudentHomePage })),
);
const StudentResultsPage = lazy(() =>
  import('@/pages/student/StudentResultsPage').then((m) => ({ default: m.StudentResultsPage })),
);
const StudentAttendancePage = lazy(() =>
  import('@/pages/student/StudentAttendancePage').then((m) => ({ default: m.StudentAttendancePage })),
);
const StudentProfilePage = lazy(() =>
  import('@/pages/student/StudentProfilePage').then((m) => ({ default: m.StudentProfilePage })),
);
function StudentRouteFallback() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16 sm:max-w-2xl">
      <div className="space-y-3">
        <div className="h-10 w-44 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
        <div className="h-36 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
        <div className="h-28 animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>
    </div>
  );
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
      { index: true, element: <AppRoleRedirect /> },
      {
        path: 'student',
        element: <StudentAppLayout />,
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          {
            path: 'home',
            element: (
              <Suspense fallback={<StudentRouteFallback />}>
                <StudentHomePage />
              </Suspense>
            ),
          },
          {
            path: 'results',
            element: (
              <Suspense fallback={<StudentRouteFallback />}>
                <StudentResultsPage />
              </Suspense>
            ),
          },
          {
            path: 'attendance',
            element: (
              <Suspense fallback={<StudentRouteFallback />}>
                <StudentAttendancePage />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<StudentRouteFallback />}>
                <StudentProfilePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: 'dashboard',
            element: <Outlet />,
            children: [
              { index: true, element: <DashboardIndexRedirect /> },
              { path: 'overview', element: <DashboardOverviewPage /> },
              {
                path: 'parent/settings',
                element: (
                  <ParentRouteGuard>
                    <ParentSettingsPage />
                  </ParentRouteGuard>
                ),
              },
              {
                path: 'admin/students',
                element: (
                  <AdminRouteGuard>
                    <AdminStudentsPage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: 'admin/teachers',
                element: (
                  <AdminRouteGuard>
                    <AdminTeachersPage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: 'admin/classes',
                element: (
                  <AdminRouteGuard>
                    <AdminClassesPage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: 'admin/subjects',
                element: (
                  <AdminRouteGuard>
                    <AdminSubjectsPage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: 'admin/attendance',
                element: (
                  <AdminRouteGuard>
                    <AdminAttendancePage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: 'admin/results',
                element: (
                  <AdminRouteGuard>
                    <AdminResultsPage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: 'admin/reports',
                element: (
                  <AdminRouteGuard>
                    <AdminReportsPage />
                  </AdminRouteGuard>
                ),
              },
              {
                path: 'admin/settings',
                element: (
                  <AdminRouteGuard>
                    <AdminSettingsPage />
                  </AdminRouteGuard>
                ),
              },
              { path: 'attendance', element: <TeacherRouteGuard section="attendance" /> },
              { path: 'reports', element: <TeacherRouteGuard section="reports" /> },
              { path: 'results', element: <TeacherRouteGuard section="results" /> },
              { path: 'settings', element: <TeacherRouteGuard section="settings" /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
