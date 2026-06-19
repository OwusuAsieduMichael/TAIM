import type { NavigateFunction } from 'react-router-dom';
import {
  loginAdmin,
  loginStudent,
  requestParentOtp,
  requestTeacherOtp,
  verifyParentOtp,
  verifyTeacherOtp,
} from '@/features/auth/api';
import { devPreviewSignIn, SEED_DEMO, SKIP_ROLE_AUTH, type DevPreviewRole } from '@/lib/skipRoleAuth';

/** Fixed demo OTP accepted by the GAS backend for teacher/parent quick sign-in. */
export const DEMO_OTP_CODE = '000000';

export type DemoRole = DevPreviewRole;

export const DEMO_ACCOUNTS: {
  role: DemoRole;
  label: string;
  credentials: string;
}[] = [
  {
    role: 'ADMIN',
    label: 'School admin',
    credentials: `${SEED_DEMO.adminEmail} · ${SEED_DEMO.adminPassword}`,
  },
  {
    role: 'SUPER_ADMIN',
    label: 'Super admin',
    credentials: `${SEED_DEMO.superAdminEmail} · ${SEED_DEMO.superAdminPassword}`,
  },
  {
    role: 'TEACHER',
    label: 'Teacher',
    credentials: `${SEED_DEMO.schoolSlug} · 0241000001 · OTP ${DEMO_OTP_CODE}`,
  },
  {
    role: 'PARENT',
    label: 'Parent',
    credentials: `${SEED_DEMO.schoolSlug} · 0241000002 · OTP ${DEMO_OTP_CODE}`,
  },
  {
    role: 'STUDENT',
    label: 'Student',
    credentials: `${SEED_DEMO.schoolSlug} · ${SEED_DEMO.studentAdmission} · PIN ${SEED_DEMO.studentPin}`,
  },
];

function navigateAfterRole(navigate: NavigateFunction, role: DemoRole) {
  if (role === 'STUDENT') {
    navigate('/app/student/home', { replace: true });
  } else if (role === 'TEACHER') {
    navigate('/app/dashboard/attendance', { replace: true });
  } else {
    navigate('/app/dashboard/overview', { replace: true });
  }
}

export async function demoQuickSignIn(
  role: DemoRole,
  setAuth: (token: string, role: string, schoolSlug?: string | null) => void,
  navigate: NavigateFunction,
): Promise<void> {
  if (SKIP_ROLE_AUTH) {
    devPreviewSignIn(
      setAuth,
      navigate,
      role,
      role === 'STUDENT' || role === 'TEACHER' || role === 'PARENT' ? SEED_DEMO.schoolSlug : null,
    );
    return;
  }

  const schoolSlug = SEED_DEMO.schoolSlug;

  if (role === 'ADMIN') {
    const res = await loginAdmin(SEED_DEMO.adminEmail, SEED_DEMO.adminPassword);
    setAuth(res.accessToken, res.user.role, null);
    navigateAfterRole(navigate, role);
    return;
  }

  if (role === 'SUPER_ADMIN') {
    const res = await loginAdmin(SEED_DEMO.superAdminEmail, SEED_DEMO.superAdminPassword);
    setAuth(res.accessToken, res.user.role, null);
    navigateAfterRole(navigate, role);
    return;
  }

  if (role === 'STUDENT') {
    const res = await loginStudent(schoolSlug, SEED_DEMO.studentAdmission, SEED_DEMO.studentPin);
    setAuth(res.accessToken, res.user.role, schoolSlug);
    navigateAfterRole(navigate, role);
    return;
  }

  if (role === 'TEACHER') {
    await requestTeacherOtp(schoolSlug, SEED_DEMO.teacherPhone);
    const res = await verifyTeacherOtp(schoolSlug, SEED_DEMO.teacherPhone, DEMO_OTP_CODE);
    setAuth(res.accessToken, res.user.role, schoolSlug);
    navigateAfterRole(navigate, role);
    return;
  }

  if (role === 'PARENT') {
    await requestParentOtp(schoolSlug, SEED_DEMO.parentPhone);
    const res = await verifyParentOtp(schoolSlug, SEED_DEMO.parentPhone, DEMO_OTP_CODE);
    setAuth(res.accessToken, res.user.role, schoolSlug);
    navigateAfterRole(navigate, role);
  }
}

export function demoAccountForRole(role: DemoRole) {
  return DEMO_ACCOUNTS.find((a) => a.role === role);
}
