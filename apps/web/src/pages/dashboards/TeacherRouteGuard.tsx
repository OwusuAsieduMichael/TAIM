import { Navigate } from 'react-router-dom';
import { TeacherWorkforceShell } from '@/components/teacher/TeacherWorkforceShell';
import type { TeacherSection } from '@/features/teacher/types';
import { useAuthStore } from '@/store/authStore';

type Props = { section: TeacherSection };

export function TeacherRouteGuard({ section }: Props) {
  const role = useAuthStore((s) => s.role);
  if (role !== 'TEACHER') {
    return <Navigate to="/app/dashboard/overview" replace />;
  }
  return <TeacherWorkforceShell section={section} />;
}
