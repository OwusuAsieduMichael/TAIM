import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/features/auth/api';
import { apiFetch } from '@/lib/api';
import { isDevMockToken } from '@/lib/skipRoleAuth';
import { useAuthStore } from '@/store/authStore';

export type StudentResultApi = {
  id: string;
  caScore: number;
  examScore: number;
  finalScore: number;
  grade: number;
  remark: string;
  subject: { name: string };
  term?: { name: string };
};

export function useStudentMe() {
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => fetchMe(token!),
    enabled: !!token && !mock,
  });
}

export function useStudentResults() {
  const token = useAuthStore((s) => s.token);
  const mock = isDevMockToken(token);
  return useQuery({
    queryKey: ['results', 'student', 'portal'],
    queryFn: () => apiFetch<{ data: StudentResultApi[] }>('/api/v1/results?published=true', { token }),
    enabled: !!token && !mock,
  });
}
