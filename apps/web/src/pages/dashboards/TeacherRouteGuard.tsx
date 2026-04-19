import { Navigate } from 'react-router-dom';
import { TeacherWorkspace } from '@/components/teacher/TeacherWorkspace';
import type { TeacherSection } from '@/features/teacher/types';
import { useAuthStore } from '@/store/authStore';

type Props = { section: TeacherSection };

export function TeacherRouteGuard({ section }: Props) {
  const role = useAuthStore((s) => s.role);
  if (role !== 'TEACHER') {
    return <Navigate to="/app/dashboard/overview" replace />;
  }
  return <TeacherWorkspace section={section} />;
}
