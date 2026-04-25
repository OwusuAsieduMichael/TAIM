import { apiFetch } from '@/lib/api';

export type TeacherWorkforceStatus = {
  serverNow: string;
  schoolTimezone: string;
  localDate: string;
  punctualityMinutes: number;
  workforceDisabled: boolean;
  morningIssuedAt: string | null;
  signedInAt: string | null;
  signInLate: boolean;
  eveningIssuedAt: string | null;
  eveningDeadlineAt: string | null;
  signedOutAt: string | null;
  signOutLate: boolean;
  forcedLogoutAt: string | null;
  canOperate: boolean;
};

export async function fetchTeacherWorkforceStatus(token: string) {
  return apiFetch<TeacherWorkforceStatus>('/api/v1/teacher/workforce/status', { token });
}

export async function postTeacherWorkforceSignIn(token: string, code: string) {
  return apiFetch<{ ok: boolean; signInLate?: boolean; skipped?: boolean }>('/api/v1/teacher/workforce/sign-in', {
    method: 'POST',
    token,
    body: JSON.stringify({ code }),
  });
}

export async function postTeacherWorkforceSignOut(token: string, code: string) {
  return apiFetch<{ ok: boolean; signOutLate?: boolean; skipped?: boolean }>('/api/v1/teacher/workforce/sign-out', {
    method: 'POST',
    token,
    body: JSON.stringify({ code }),
  });
}

export async function postSchoolMorningWorkforceOtps(token: string) {
  return apiFetch<{ localDate: string; teachers: number; smsSent: number }>('/api/v1/schools/workforce/morning-otps', {
    method: 'POST',
    token,
  });
}

export async function postSchoolEveningWorkforceOtps(token: string) {
  return apiFetch<{
    localDate: string;
    eligibleTeachers: number;
    smsSent: number;
    eveningDeadlineAt: string;
  }>('/api/v1/schools/workforce/evening-otps', {
    method: 'POST',
    token,
  });
}
