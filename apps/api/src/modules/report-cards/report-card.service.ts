import type { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function submitReportCard(
  schoolId: string,
  teacherId: string,
  input: { termId: string; classId: string; note?: string },
) {
  const allowed = await prisma.teacherSubject.findFirst({
    where: { teacherId, classId: input.classId },
  });
  if (!allowed) {
    throw new HttpError(403, 'You are not assigned to this class');
  }
  const term = await prisma.term.findFirst({
    where: { id: input.termId, academicYear: { schoolId } },
  });
  if (!term) throw new HttpError(400, 'Invalid term');
  const klass = await prisma.class.findFirst({ where: { id: input.classId, schoolId } });
  if (!klass) throw new HttpError(400, 'Invalid class');

  const pending = await prisma.reportCardSubmission.findFirst({
    where: {
      schoolId,
      teacherId,
      termId: input.termId,
      classId: input.classId,
      status: { in: ['PENDING_APPROVAL', 'APPROVED'] },
    },
  });
  if (pending?.status === 'APPROVED') {
    throw new HttpError(409, 'An approved submission already exists for this class and term');
  }
  if (pending?.status === 'PENDING_APPROVAL') {
    throw new HttpError(409, 'A submission is already pending approval');
  }

  return prisma.reportCardSubmission.create({
    data: {
      schoolId,
      teacherId,
      termId: input.termId,
      classId: input.classId,
      status: 'PENDING_APPROVAL',
      note: input.note ?? null,
    },
    include: { term: true, class: true, teacher: { select: { id: true, fullName: true } } },
  });
}

export async function listReportCards(schoolId: string, auth: { role: Role; sub: string }) {
  const where: Record<string, unknown> = { schoolId };
  if (auth.role === 'TEACHER') {
    where.teacherId = auth.sub;
  }
  return prisma.reportCardSubmission.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    take: 200,
    include: {
      term: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      teacher: { select: { id: true, fullName: true } },
      reviewer: { select: { id: true, fullName: true } },
    },
  });
}

export async function setReportCardStatus(
  schoolId: string,
  submissionId: string,
  reviewerId: string,
  status: 'APPROVED' | 'REJECTED',
  note?: string,
) {
  const row = await prisma.reportCardSubmission.findFirst({
    where: { id: submissionId, schoolId },
  });
  if (!row) throw new HttpError(404, 'Submission not found');
  if (row.status !== 'PENDING_APPROVAL') {
    throw new HttpError(400, 'Only pending submissions can be reviewed');
  }
  return prisma.reportCardSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      reviewedAt: new Date(),
      reviewerId,
      note: note ?? row.note,
    },
    include: { term: true, class: true, teacher: { select: { id: true, fullName: true } } },
  });
}

export async function rankingsForTeacher(
  schoolId: string,
  teacherId: string,
  query: { termId: string; classId: string },
) {
  const approved = await prisma.reportCardSubmission.findFirst({
    where: {
      schoolId,
      teacherId,
      termId: query.termId,
      classId: query.classId,
      status: 'APPROVED',
    },
  });
  if (!approved) {
    throw new HttpError(
      403,
      'Rankings are available only after admin approves your report card submission for this class and term.',
      'REPORT_CARD_NOT_APPROVED',
    );
  }
  const students = await prisma.student.findMany({
    where: { schoolId, classId: query.classId },
    select: { id: true, firstName: true, lastName: true, admissionNumber: true },
  });
  const results = await prisma.result.findMany({
    where: { termId: query.termId, classId: query.classId, student: { schoolId } },
    include: { subject: { select: { name: true, id: true } } },
  });
  const byStudent = new Map<string, { studentId: string; name: string; admissionNumber: string; total: number; count: number }>();
  for (const s of students) {
    byStudent.set(s.id, {
      studentId: s.id,
      name: `${s.firstName} ${s.lastName}`,
      admissionNumber: s.admissionNumber,
      total: 0,
      count: 0,
    });
  }
  for (const r of results) {
    const agg = byStudent.get(r.studentId);
    if (!agg) continue;
    agg.total += r.finalScore;
    agg.count += 1;
  }
  const rows = [...byStudent.values()]
    .map((r) => ({
      ...r,
      average: r.count > 0 ? Math.round((r.total / r.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.average - a.average)
    .map((r, idx) => ({ rank: idx + 1, ...r }));
  return { submissionId: approved.id, termId: query.termId, classId: query.classId, rankings: rows };
}
