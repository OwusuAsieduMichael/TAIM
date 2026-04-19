import { apiFetch } from '@/lib/api';
import type { TeacherWorkspaceResponse } from './types';

export async function fetchTeacherWorkspace(token: string) {
  return apiFetch<TeacherWorkspaceResponse>('/api/v1/teacher/workspace', { token });
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export async function postAttendanceBulk(
  token: string,
  body: { date: string; classId?: string; rows: { studentId: string; status: AttendanceStatus }[] },
) {
  return apiFetch<{ ok: boolean; count: number }>('/api/v1/attendance/bulk', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export type ResultUpsertBody = {
  studentId: string;
  subjectId: string;
  termId: string;
  classId: string;
  caScore: number;
  examScore: number;
};

export async function postResultUpsert(token: string, body: ResultUpsertBody) {
  return apiFetch<unknown>('/api/v1/results/upsert', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export type ResultListRow = {
  id: string;
  studentId: string;
  subjectId: string;
  termId: string;
  classId: string;
  caScore: number;
  examScore: number;
  finalScore: number;
  grade: number;
  remark: string;
  published: boolean;
  student: { id: string; firstName: string; lastName: string };
  subject: { id: string; name: string };
};

export async function fetchResultsForTerm(token: string, termId: string) {
  return apiFetch<{ data: ResultListRow[] }>(`/api/v1/results?termId=${encodeURIComponent(termId)}`, { token });
}
