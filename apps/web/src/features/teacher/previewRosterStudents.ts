import type { TeacherWorkspaceStudent } from './types';

/**
 * Mirrors `apps/api/prisma/seed.ts` demo class roster for dev UI preview (mock sign-in only).
 * After `npm run db:seed` in `apps/api`, a real teacher token loads the same rows from `GET /api/v1/teacher/workspace`.
 */
export const TEACHER_PREVIEW_ROSTER_STUDENTS: TeacherWorkspaceStudent[] = [
  { id: 'seed-student', firstName: 'Demo', lastName: 'Student', admissionNumber: 'STU-001' },
  { id: 'cltaimdemo020000000000000', firstName: 'Kofi', lastName: 'Mensah', admissionNumber: 'STU-002' },
  { id: 'cltaimdemo030000000000000', firstName: 'Ama', lastName: 'Serwaa', admissionNumber: 'STU-003' },
  { id: 'cltaimdemo040000000000000', firstName: 'Kwame', lastName: 'Boateng', admissionNumber: 'STU-004' },
  { id: 'cltaimdemo050000000000000', firstName: 'Yaa', lastName: 'Osei', admissionNumber: 'STU-005' },
  { id: 'cltaimdemo060000000000000', firstName: 'Joseph', lastName: 'Adjei', admissionNumber: 'STU-006' },
  { id: 'cltaimdemo070000000000000', firstName: 'Abena', lastName: 'Owusu', admissionNumber: 'STU-007' },
  { id: 'cltaimdemo080000000000000', firstName: 'Kwesi', lastName: 'Twumasi', admissionNumber: 'STU-008' },
  { id: 'cltaimdemo090000000000000', firstName: 'Efua', lastName: 'Hammond', admissionNumber: 'STU-009' },
  { id: 'cltaimdemo100000000000000', firstName: 'Malik', lastName: 'Ibrahim', admissionNumber: 'STU-010' },
  { id: 'cltaimdemo110000000000000', firstName: 'Nadia', lastName: 'Mahama', admissionNumber: 'STU-011' },
  { id: 'cltaimdemo120000000000000', firstName: 'Samuel', lastName: 'Darko', admissionNumber: 'STU-012' },
  { id: 'cltaimdemo130000000000000', firstName: 'Afua', lastName: 'Prempeh', admissionNumber: 'STU-013' },
  { id: 'cltaimdemo140000000000000', firstName: 'Peter', lastName: 'Tettey', admissionNumber: 'STU-014' },
  { id: 'cltaimdemo150000000000000', firstName: 'Linda', lastName: 'Appiah', admissionNumber: 'STU-015' },
  { id: 'cltaimdemo160000000000000', firstName: 'David', lastName: 'Koomson', admissionNumber: 'STU-016' },
  { id: 'cltaimdemo170000000000000', firstName: 'Grace', lastName: 'Ankrah', admissionNumber: 'STU-017' },
  { id: 'cltaimdemo180000000000000', firstName: 'Emmanuel', lastName: 'Sarpong', admissionNumber: 'STU-018' },
  { id: 'cltaimdemo190000000000000', firstName: 'Patricia', lastName: 'Agyei', admissionNumber: 'STU-019' },
  { id: 'cltaimdemo200000000000000', firstName: 'Daniel', lastName: 'Frimpong', admissionNumber: 'STU-020' },
];

/** Same padding rule as `rosterStudentId` in `apps/api/prisma/seed.ts`. */
export function rosterStudentIdPreview(tag: string, index1: number): string {
  const idx = String(index1).padStart(2, '0');
  const base = `clseed${tag}${idx}`;
  return (base + '0'.repeat(Math.max(0, 25 - base.length))).slice(0, 25);
}

const PREVIEW_CLASS_ROSTER_META: Record<string, { tag: string; admPrefix: string }> = {
  'seed-class-kg1': { tag: 'kg1a', admPrefix: 'K1A' },
  'seed-class-kg1b': { tag: 'kg1b', admPrefix: 'K1B' },
  'seed-class-kg2': { tag: 'kg2a', admPrefix: 'K2A' },
  'seed-class-kg2b': { tag: 'kg2b', admPrefix: 'K2B' },
  'seed-class-jhs1b': { tag: 'j1b', admPrefix: 'J1B' },
  'seed-class-jhs2': { tag: 'j2a', admPrefix: 'J2A' },
  'seed-class-jhs2b': { tag: 'j2b', admPrefix: 'J2B' },
  'seed-class-jhs3': { tag: 'j3a', admPrefix: 'J3A' },
  'seed-class-jhs3b': { tag: 'j3b', admPrefix: 'J3B' },
};
for (let d = 1; d <= 6; d++) {
  for (const sec of ['a', 'b'] as const) {
    const lv = `P${d}`;
    const secU = sec === 'a' ? 'A' : 'B';
    PREVIEW_CLASS_ROSTER_META[`seed-class-p${d}${sec}`] = {
      tag: `p${d}${sec}`,
      admPrefix: `${lv}${secU}`,
    };
  }
}

/** Twelve demo names/admissions per non–JHS1-A class, aligned with seed `rosterByClass`. */
const PREVIEW_ROSTER_12 = TEACHER_PREVIEW_ROSTER_STUDENTS.slice(1, 13);

export function previewRosterForClass(classId: string): TeacherWorkspaceStudent[] {
  if (classId === 'seed-class') return TEACHER_PREVIEW_ROSTER_STUDENTS;
  const meta = PREVIEW_CLASS_ROSTER_META[classId];
  if (!meta) return [];
  return PREVIEW_ROSTER_12.map((s, i) => ({
    ...s,
    id: rosterStudentIdPreview(meta.tag, i + 1),
    admissionNumber: `${meta.admPrefix}-${String(i + 1).padStart(2, '0')}`,
  }));
}
