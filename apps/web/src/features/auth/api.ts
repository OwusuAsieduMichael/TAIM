import { apiFetch } from '@/lib/api';

export type StudentGuardian = {
  name: string;
  phone: string | null;
  relation: string;
};

export type MeResponse = {
  id: string;
  fullName: string;
  role: string;
  schoolId: string | null;
  email: string | null;
  phone: string | null;
  accountStatus?: string;
  /** ISO timestamp — profile or account last updated on server. */
  lastActivityAt?: string | null;
  student: {
    id: string;
    admissionNumber: string;
    classId: string | null;
    schoolName?: string;
    schoolSlug?: string;
    className?: string | null;
    classLevel?: string | null;
    attendanceToday?: string | null;
    attendanceRecent?: { date: string; status: string }[];
    /** HTTPS URL to passport-style portrait (uploaded by school). */
    passportPhotoUrl?: string | null;
    firstName?: string;
    lastName?: string;
    gender?: string | null;
    /** ISO date `YYYY-MM-DD`. */
    dateOfBirth?: string | null;
    academicYearName?: string | null;
    currentTermName?: string | null;
    guardians?: StudentGuardian[];
  } | null;
};

export async function loginAdmin(email: string, password: string, token?: string | null) {
  return apiFetch<{ accessToken: string; user: { role: string } }>('/api/v1/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    token,
  });
}

export async function requestTeacherOtp(schoolSlug: string, phone: string) {
  return apiFetch<{ message: string }>('/api/v1/auth/teacher/otp/request', {
    method: 'POST',
    body: JSON.stringify({ schoolSlug, phone }),
  });
}

export async function verifyTeacherOtp(schoolSlug: string, phone: string, code: string) {
  return apiFetch<{ accessToken: string; user: { role: string } }>('/api/v1/auth/teacher/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ schoolSlug, phone, code }),
  });
}

export async function requestParentOtp(schoolSlug: string, phone: string) {
  return apiFetch<{ message: string }>('/api/v1/auth/parent/otp/request', {
    method: 'POST',
    body: JSON.stringify({ schoolSlug, phone }),
  });
}

export async function verifyParentOtp(schoolSlug: string, phone: string, code: string) {
  return apiFetch<{ accessToken: string; user: { role: string } }>('/api/v1/auth/parent/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ schoolSlug, phone, code }),
  });
}

export async function loginStudent(schoolSlug: string, admissionNumber: string, pin: string) {
  return apiFetch<{ accessToken: string; user: { role: string } }>('/api/v1/auth/student/login', {
    method: 'POST',
    body: JSON.stringify({ schoolSlug, admissionNumber, pin }),
  });
}

export async function fetchMe(token: string) {
  return apiFetch<MeResponse>('/api/v1/auth/me', { token });
}
