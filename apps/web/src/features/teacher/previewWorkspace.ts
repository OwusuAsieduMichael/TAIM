import type { TeacherWorkspaceAssignment, TeacherWorkspaceResponse } from './types';
import { previewRosterForClass, TEACHER_PREVIEW_ROSTER_STUDENTS } from './previewRosterStudents';

/** Keep in sync with `apps/api/prisma/seed.ts` — KG / Primary / JHS curriculum subject ids and names. */
const TWI_SUBJECT = { id: 'seed-subj-twi', name: 'Ghanaian Language (Twi)', code: 'TWI' } as const;

const KG_SUBJECTS = [
  { id: 'seed-subj-kg-lit', name: 'Language & Literacy', code: 'KG-LIT' },
  { id: 'seed-subj-kg-num', name: 'Numeracy', code: 'KG-NUM' },
  { id: 'seed-subj-kg-ca', name: 'Creative Arts', code: 'KG-CA' },
  { id: 'seed-subj-kg-pdw', name: 'Physical Development & Well-being', code: 'KG-PDW' },
  TWI_SUBJECT,
] as const;

const PRIMARY_SUBJECTS = [
  { id: 'seed-subj-p-en', name: 'English Language', code: 'P-ENG' },
  { id: 'seed-subj-p-math', name: 'Mathematics', code: 'P-MATH' },
  { id: 'seed-subj-p-sci', name: 'Science', code: 'P-SCI' },
  { id: 'seed-subj-p-gh', name: 'Our World & Our People', code: 'P-OWP' },
  { id: 'seed-subj-p-rme', name: 'Religious & Moral Education', code: 'P-RME' },
  { id: 'seed-subj-p-ca', name: 'Creative Arts & Design', code: 'P-CAD' },
  { id: 'seed-subj-p-pe', name: 'Physical Education & Well-being', code: 'P-PE' },
  { id: 'seed-subj-p-ict', name: 'Computing', code: 'P-ICT' },
  TWI_SUBJECT,
] as const;

const JHS_SUBJECTS = [
  { id: 'seed-subject-en', name: 'English Language', code: 'JHS-ENG' },
  { id: 'seed-subject', name: 'Mathematics', code: 'JHS-MATH' },
  { id: 'seed-subj-jhs-is', name: 'Integrated Science', code: 'JHS-SCI' },
  { id: 'seed-subj-jhs-ss', name: 'Social Studies', code: 'JHS-SS' },
  { id: 'seed-subj-jhs-rme', name: 'Religious & Moral Education (RME)', code: 'JHS-RME' },
  { id: 'seed-subj-jhs-cad', name: 'Creative Arts & Design', code: 'JHS-CAD' },
  { id: 'seed-subj-jhs-ct', name: 'Career Technology', code: 'JHS-CT' },
  TWI_SUBJECT,
] as const;

const terms = [
  { id: 'seed-term1', name: 'Term 1', order: 1 },
  { id: 'seed-term2', name: 'Term 2', order: 2 },
];
const yearMeta = {
  academicYearId: 'seed-year',
  academicYearName: '2025/2026',
  terms,
};

type PreviewClassRow = { id: string; name: string; level: string };

/** Same order as `compareSchoolClasses` in the API (`classSort.ts`). */
function previewClassRows(): PreviewClassRow[] {
  const rows: PreviewClassRow[] = [
    { id: 'seed-class-kg1', name: 'KG1-A', level: 'KG1' },
    { id: 'seed-class-kg1b', name: 'KG1-B', level: 'KG1' },
    { id: 'seed-class-kg2', name: 'KG2-A', level: 'KG2' },
    { id: 'seed-class-kg2b', name: 'KG2-B', level: 'KG2' },
  ];
  for (let d = 1; d <= 6; d++) {
    const lv = `P${d}`;
    for (const sec of ['A', 'B'] as const) {
      const slug = sec.toLowerCase();
      rows.push({
        id: `seed-class-p${d}${slug}`,
        name: `${lv}-${sec}`,
        level: lv,
      });
    }
  }
  rows.push(
    { id: 'seed-class', name: 'JHS1-A', level: 'JHS1' },
    { id: 'seed-class-jhs1b', name: 'JHS1-B', level: 'JHS1' },
    { id: 'seed-class-jhs2', name: 'JHS2-A', level: 'JHS2' },
    { id: 'seed-class-jhs2b', name: 'JHS2-B', level: 'JHS2' },
    { id: 'seed-class-jhs3', name: 'JHS3-A', level: 'JHS3' },
    { id: 'seed-class-jhs3b', name: 'JHS3-B', level: 'JHS3' },
  );
  return rows;
}

const PREVIEW_CLASSES = previewClassRows().map((c) => ({
  ...c,
  students:
    c.id === 'seed-class' ? TEACHER_PREVIEW_ROSTER_STUDENTS : previewRosterForClass(c.id),
}));

function subjectsForLevel(level: string) {
  if (level.startsWith('KG')) return KG_SUBJECTS;
  if (level.startsWith('P')) return PRIMARY_SUBJECTS;
  return JHS_SUBJECTS;
}

function buildPreviewAssignments(): TeacherWorkspaceAssignment[] {
  const rows: TeacherWorkspaceAssignment[] = [];
  for (const c of PREVIEW_CLASSES) {
    const subs = subjectsForLevel(c.level);
    for (const s of subs) {
      rows.push({
        assignmentId: `seed-ts-${c.id}-${s.id}`,
        classId: c.id,
        className: c.name,
        classLevel: c.level,
        subjectId: s.id,
        subjectName: s.name,
        subjectCode: s.code,
        ...yearMeta,
        students: c.students,
      });
    }
  }
  return rows;
}

/** Stable IDs from `apps/api/prisma/seed.ts` — used only for UI preview when auth is skipped. */
export const TEACHER_PREVIEW_WORKSPACE: TeacherWorkspaceResponse = {
  classes: PREVIEW_CLASSES.map(({ id, name, level, students }) => ({ id, name, level, students })),
  data: buildPreviewAssignments(),
};
