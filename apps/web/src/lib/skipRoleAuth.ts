import type { NavigateFunction } from 'react-router-dom';

/** Distinct from any real JWT so we can disable API queries during layout-only work. */
export const DEV_MOCK_ACCESS_TOKEN = '__TAIM_DEV_UI_PREVIEW__';

/**
 * In development, role login forms skip the API and navigate straight into the app.
 * Set `VITE_USE_REAL_ROLE_AUTH=true` to exercise real sign-in against the API locally.
 */
export const SKIP_ROLE_AUTH =
  import.meta.env.DEV && import.meta.env.VITE_USE_REAL_ROLE_AUTH !== 'true';

export function isDevMockToken(token: string | null | undefined): boolean {
  return token === DEV_MOCK_ACCESS_TOKEN;
}

/** Matches `apps/api/prisma/seed.ts` demo users (for labels and defaults). */
export const SEED_DEMO = {
  schoolSlug: 'demo-school',
  schoolDisplayName: 'Tomhel Preparatory/JHS',
  adminEmail: 'admin@demo-school.gh',
  adminPassword: 'Admin123!',
  superAdminEmail: 'super@taim.local',
  superAdminPassword: 'Admin123!',
  teacherPhone: '233241000001',
  parentPhone: '233241000002',
  studentAdmission: 'STU-001',
  studentPin: '1234',
} as const;

export type DevPreviewRole = 'ADMIN' | 'SUPER_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

export function devPreviewSignIn(
  setAuth: (token: string, role: string, schoolSlug?: string | null) => void,
  navigate: NavigateFunction,
  role: DevPreviewRole,
  schoolSlug: string | null,
) {
  setAuth(DEV_MOCK_ACCESS_TOKEN, role, schoolSlug);
  if (role === 'STUDENT') {
    navigate('/app/student/home', { replace: true });
  } else if (role === 'TEACHER') {
    navigate('/app/dashboard/attendance', { replace: true });
  } else {
    navigate('/app/dashboard/overview', { replace: true });
  }
}
