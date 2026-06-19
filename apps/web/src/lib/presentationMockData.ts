import type { MeResponse } from '@/features/auth/api';
import type { StudentResultApi } from '@/hooks/useStudentPortal';
import { SEED_DEMO } from '@/lib/skipRoleAuth';

export const MOCK_STUDENT_ME: MeResponse = {
  id: 'seed-student-user',
  fullName: 'Ama Mensah',
  role: 'STUDENT',
  schoolId: 'seed-school',
  email: null,
  phone: null,
  accountStatus: 'ACTIVE',
  lastActivityAt: new Date().toISOString(),
  student: {
    id: 'seed-student',
    admissionNumber: SEED_DEMO.studentAdmission,
    classId: 'seed-class-jhs1',
    schoolName: SEED_DEMO.schoolDisplayName,
    schoolSlug: SEED_DEMO.schoolSlug,
    className: 'JHS 1A',
    classLevel: 'JHS 1',
    attendanceToday: 'PRESENT',
    attendanceRecent: [
      { date: new Date().toISOString().slice(0, 10), status: 'PRESENT' },
      { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), status: 'PRESENT' },
    ],
    passportPhotoUrl: null,
    firstName: 'Ama',
    lastName: 'Mensah',
    gender: 'Female',
    dateOfBirth: '2012-05-10',
    academicYearName: '2025/2026',
    currentTermName: 'Term 1',
    guardians: [{ name: 'Demo Parent', phone: SEED_DEMO.parentPhone, relation: 'Mother' }],
  },
};

export const MOCK_STUDENT_RESULTS: StudentResultApi[] = [
  {
    id: 'seed-result1',
    caScore: 24,
    examScore: 56,
    finalScore: 80,
    grade: 80,
    remark: 'Excellent',
    subject: { name: 'Mathematics' },
    term: { name: 'Term 1' },
  },
  {
    id: 'seed-result2',
    caScore: 22,
    examScore: 48,
    finalScore: 70,
    grade: 70,
    remark: 'Good',
    subject: { name: 'English Language' },
    term: { name: 'Term 1' },
  },
];

export type ParentResultRow = { subject: { name: string }; grade: number | string; remark: string };

export const MOCK_PARENT_NOTIFICATIONS = [
  {
    id: 'seed-notif1',
    title: 'Results available',
    body: 'Term 1 Mathematics results for Ama Mensah are now published.',
    readAt: null as string | null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-notif2',
    title: 'Attendance update',
    body: 'Ama Mensah was marked present today.',
    readAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const MOCK_PARENT_RESULTS: ParentResultRow[] = [
  { subject: { name: 'Mathematics' }, grade: 80, remark: 'Excellent' },
  { subject: { name: 'English Language' }, grade: 70, remark: 'Good' },
];
