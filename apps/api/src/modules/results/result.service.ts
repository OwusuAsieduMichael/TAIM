import type { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { computeResult } from '../../lib/grades.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { sendSms } from '../../lib/sms.js';

export async function upsertResult(
  schoolId: string,
  input: {
    studentId: string;
    subjectId: string;
    termId: string;
    classId: string;
    caScore: number;
    examScore: number;
  },
  auth?: { sub: string; role: Role },
) {
  if (auth?.role === 'TEACHER') {
    const allowed = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: auth.sub,
        classId: input.classId,
        subjectId: input.subjectId,
      },
    });
    if (!allowed) {
      throw new HttpError(403, 'You are not assigned to teach this subject for this class');
    }
  }

  const [student, subject, term, klass] = await Promise.all([
    prisma.student.findFirst({ where: { id: input.studentId, schoolId } }),
    prisma.subject.findFirst({ where: { id: input.subjectId, schoolId } }),
    prisma.term.findFirst({
      where: { id: input.termId, academicYear: { schoolId } },
    }),
    prisma.class.findFirst({ where: { id: input.classId, schoolId } }),
  ]);
  if (!student || !subject || !term || !klass) {
    throw new HttpError(400, 'Invalid student, subject, term, or class');
  }
  if (auth?.role === 'TEACHER' && student.classId !== input.classId) {
    throw new HttpError(400, 'Student is not in this class');
  }
  const { finalScore, grade, remark } = computeResult(input.caScore, input.examScore);
  return prisma.result.upsert({
    where: {
      studentId_subjectId_termId: {
        studentId: input.studentId,
        subjectId: input.subjectId,
        termId: input.termId,
      },
    },
    create: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      termId: input.termId,
      classId: input.classId,
      caScore: input.caScore,
      examScore: input.examScore,
      finalScore,
      grade,
      remark,
    },
    update: {
      classId: input.classId,
      caScore: input.caScore,
      examScore: input.examScore,
      finalScore,
      grade,
      remark,
      published: false,
    },
  });
}

export async function publishResults(
  schoolId: string,
  input: { termId: string; subjectId?: string },
) {
  const where: Record<string, unknown> = {
    termId: input.termId,
    student: { schoolId },
    published: false,
  };
  if (input.subjectId) {
    where.subjectId = input.subjectId;
  }
  const rows = await prisma.result.findMany({
    where,
    include: {
      student: {
        include: {
          parents: { include: { parent: true } },
          user: true,
        },
      },
      subject: true,
    },
  });
  await prisma.$transaction(
    rows.map((r) =>
      prisma.result.update({
        where: { id: r.id },
        data: { published: true },
      })
    ),
  );
  for (const r of rows) {
    const msg = `TAIM: ${r.subject.name} result published. Grade ${r.grade} (${r.remark}).`;
    for (const link of r.student.parents) {
      const p = link.parent;
      await prisma.notification.create({
        data: {
          schoolId,
          userId: p.id,
          type: 'RESULTS',
          title: 'Results published',
          body: msg,
          metadata: { resultId: r.id, studentId: r.studentId },
        },
      });
      if (p.phone) await sendSms(p.phone, msg);
    }
    await prisma.notification.create({
      data: {
        schoolId,
        userId: r.student.userId,
        type: 'RESULTS',
        title: 'Results published',
        body: `${r.subject.name}: Grade ${r.grade} (${r.remark}).`,
        metadata: { resultId: r.id },
      },
    });
  }
  return { published: rows.length };
}

export async function listResults(
  schoolId: string,
  auth: { role: string; sub: string },
  query: { termId?: string; studentId?: string; published?: string },
) {
  const where: Record<string, unknown> = { student: { schoolId } };
  if (query.termId) where.termId = query.termId;
  if (query.studentId) where.studentId = query.studentId;
  if (query.published === 'true') where.published = true;
  if (query.published === 'false') where.published = false;
  if (auth.role === 'STUDENT') {
    const st = await prisma.student.findFirst({ where: { userId: auth.sub } });
    if (!st) {
      return [];
    }
    where.studentId = st.id;
    where.published = true;
  }
  if (auth.role === 'PARENT') {
    const links = await prisma.studentParent.findMany({
      where: { parentId: auth.sub },
      select: { studentId: true },
    });
    const ids = links.map((l) => l.studentId);
    where.studentId = { in: ids };
    where.published = true;
  }
  return prisma.result.findMany({
    where,
    include: { subject: true, term: true, student: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });
}
