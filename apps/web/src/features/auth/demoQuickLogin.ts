import type { NavigateFunction } from 'react-router-dom';
import { loginAdmin, loginStudent, verifyParentOtp, verifyTeacherOtp } from '@/features/auth/api';
import { devPreviewSignIn, PRESENTATION_MODE, SEED_DEMO, SKIP_ROLE_AUTH, type DevPreviewRole } from '@/lib/skipRoleAuth';

/** Fixed demo OTP accepted by the GAS backend for teacher/parent quick sign-in. */
export const DEMO_OTP_CODE = '000000';

export type DemoRole = Exclude<DevPreviewRole, 'SUPER_ADMIN'>;

export const DEMO_ACCOUNTS: {
  role: DemoRole;
  label: string;
}[] = [
  { role: 'ADMIN', label: 'Administrator' },
  { role: 'TEACHER', label: 'Teacher' },
  { role: 'PARENT', label: 'Parent' },
  { role: 'STUDENT', label: 'Student' },
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
  if (SKIP_ROLE_AUTH || PRESENTATION_MODE) {
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

  if (role === 'STUDENT') {
    const res = await loginStudent(schoolSlug, SEED_DEMO.studentAdmission, SEED_DEMO.studentPin);
    setAuth(res.accessToken, res.user.role, schoolSlug);
    navigateAfterRole(navigate, role);
    return;
  }

  if (role === 'TEACHER') {
    const res = await verifyTeacherOtp(schoolSlug, SEED_DEMO.teacherPhone, DEMO_OTP_CODE);
    setAuth(res.accessToken, res.user.role, schoolSlug);
    navigateAfterRole(navigate, role);
    return;
  }

  if (role === 'PARENT') {
    const res = await verifyParentOtp(schoolSlug, SEED_DEMO.parentPhone, DEMO_OTP_CODE);
    setAuth(res.accessToken, res.user.role, schoolSlug);
    navigateAfterRole(navigate, role);
  }
}

export function demoAccountForRole(role: DemoRole) {
  return DEMO_ACCOUNTS.find((a) => a.role === role);
}
