import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { sendSms } from '../../lib/sms.js';

export async function bulkMark(
  schoolId: string,
  userId: string,
  role: string,
  input: {
    date: string;
    classId?: string;
    rows: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }[];
  },
) {
  const day = new Date(input.date + 'T12:00:00.000Z');
  if (Number.isNaN(day.getTime())) {
    throw new HttpError(400, 'Invalid date');
  }
  const studentIds = input.rows.map((r) => r.studentId);
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds }, schoolId },
    include: {
      parents: { include: { parent: true } },
    },
  });
  if (students.length !== studentIds.length) {
    throw new HttpError(400, 'One or more students are invalid for this school');
  }
  if (role === 'TEACHER' && input.classId) {
    const allowed = await prisma.teacherSubject.findFirst({
      where: { teacherId: userId, classId: input.classId },
    });
    if (!allowed) {
      throw new HttpError(403, 'You are not assigned to this class');
    }
    for (const s of students) {
      if (s.classId !== input.classId) {
        throw new HttpError(400, 'Student not in this class');
      }
    }
  }
  await prisma.$transaction(
    input.rows.map((row) =>
      prisma.attendance.upsert({
        where: {
          studentId_date: { studentId: row.studentId, date: day },
        },
        create: {
          studentId: row.studentId,
          date: day,
          status: row.status,
          classId: input.classId,
          markedById: userId,
        },
        update: {
          status: row.status,
          classId: input.classId,
          markedById: userId,
        },
      }),
    ),
  );
  for (const row of input.rows) {
    if (row.status !== 'ABSENT') continue;
    const st = students.find((s) => s.id === row.studentId);
    if (!st) continue;
    for (const link of st.parents) {
      const parent = link.parent;
      if (!parent.phone) continue;
      await prisma.notification.create({
        data: {
          schoolId,
          userId: parent.id,
          type: 'ABSENCE',
          title: 'Absence alert',
          body: `${st.firstName} ${st.lastName} was marked absent on ${input.date}.`,
          metadata: { studentId: st.id, date: input.date },
        },
      });
      await sendSms(
        parent.phone,
        `TAIM: ${st.firstName} ${st.lastName} absent on ${input.date}.`,
      );
    }
  }
  return { ok: true, count: input.rows.length };
}

export async function listAttendance(schoolId: string, query: { classId?: string; date?: string }) {
  const where: Record<string, unknown> = { student: { schoolId } };
  if (query.classId) {
    where.classId = query.classId;
  }
  if (query.date) {
    where.date = new Date(query.date + 'T12:00:00.000Z');
  }
  return prisma.attendance.findMany({
    where,
    include: { student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } } },
    orderBy: { date: 'desc' },
    take: 200,
  });
}
