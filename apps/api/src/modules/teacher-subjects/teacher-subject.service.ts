import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listAssignments(schoolId: string) {
  return prisma.teacherSubject.findMany({
    where: {
      class: { schoolId },
    },
    include: {
      teacher: { select: { id: true, fullName: true, phone: true } },
      subject: true,
      class: true,
      academicYear: true,
    },
  });
}

export async function assign(
  schoolId: string,
  input: {
    teacherId: string;
    subjectId: string;
    classId: string;
    academicYearId?: string;
  },
) {
  const [teacher, subject, klass] = await Promise.all([
    prisma.user.findFirst({ where: { id: input.teacherId, schoolId, role: 'TEACHER' } }),
    prisma.subject.findFirst({ where: { id: input.subjectId, schoolId } }),
    prisma.class.findFirst({ where: { id: input.classId, schoolId } }),
  ]);
  if (!teacher || !subject || !klass) {
    throw new HttpError(400, 'Invalid teacher, subject, or class for this school');
  }
  return prisma.teacherSubject.create({
    data: {
      teacherId: input.teacherId,
      subjectId: input.subjectId,
      classId: input.classId,
      academicYearId: input.academicYearId,
    },
  });
}

export async function remove(schoolId: string, id: string) {
  const row = await prisma.teacherSubject.findFirst({
    where: { id, class: { schoolId } },
  });
  if (!row) {
    throw new HttpError(404, 'Assignment not found');
  }
  await prisma.teacherSubject.delete({ where: { id } });
}
