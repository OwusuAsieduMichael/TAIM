import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/features/auth/api';
import { apiFetch } from '@/lib/api';
import { MOCK_STUDENT_ME, MOCK_STUDENT_RESULTS } from '@/lib/presentationMockData';
import { isPreviewSession } from '@/lib/skipRoleAuth';
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
  const preview = isPreviewSession(token);
  return useQuery({
    queryKey: ['auth', 'me', preview ? 'preview' : 'live'],
    queryFn: () => (preview ? Promise.resolve(MOCK_STUDENT_ME) : fetchMe(token!)),
    enabled: !!token,
  });
}

export function useStudentResults() {
  const token = useAuthStore((s) => s.token);
  const preview = isPreviewSession(token);
  return useQuery({
    queryKey: ['results', 'student', 'portal', preview ? 'preview' : 'live'],
    queryFn: () =>
      preview
        ? Promise.resolve({ data: MOCK_STUDENT_RESULTS })
        : apiFetch<{ data: StudentResultApi[] }>('/api/v1/results?published=true', { token }),
    enabled: !!token,
  });
}
