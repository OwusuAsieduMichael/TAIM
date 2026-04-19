import { prisma } from '../../lib/prisma.js';
import { compareSchoolClasses } from './classSort.js';

const studentSelect = {
  id: true,
  firstName: true,
  lastName: true,
  admissionNumber: true,
} as const;

export async function getTeacherWorkspace(teacherId: string, schoolId: string) {
  const [assignments, allClasses] = await Promise.all([
    prisma.teacherSubject.findMany({
      where: { teacherId, class: { schoolId } },
      include: {
        class: {
          include: {
            students: {
              select: studentSelect,
              orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            },
          },
        },
        subject: { select: { id: true, name: true, code: true } },
        academicYear: {
          include: {
            terms: { orderBy: { order: 'asc' }, select: { id: true, name: true, order: true } },
          },
        },
      },
      orderBy: [{ class: { name: 'asc' } }, { subject: { name: 'asc' } }],
    }),
    prisma.class.findMany({
      where: { schoolId },
      include: {
        students: {
          select: studentSelect,
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        },
      },
    }),
  ]);

  const classes = [...allClasses].sort(compareSchoolClasses).map((c) => ({
    id: c.id,
    name: c.name,
    level: c.level,
    students: c.students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      admissionNumber: s.admissionNumber,
    })),
  }));

  return {
    data: assignments.map((a) => ({
      assignmentId: a.id,
      classId: a.classId,
      className: a.class.name,
      classLevel: a.class.level,
      subjectId: a.subjectId,
      subjectName: a.subject.name,
      subjectCode: a.subject.code,
      academicYearId: a.academicYearId,
      academicYearName: a.academicYear?.name ?? null,
      terms: a.academicYear?.terms ?? [],
      students: a.class.students.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        admissionNumber: s.admissionNumber,
      })),
    })),
    classes,
  };
}
