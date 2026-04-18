import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listSubjects(schoolId: string) {
  return prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
}

export async function createSubject(schoolId: string, input: { name: string; code?: string }) {
  return prisma.subject.create({
    data: { schoolId, name: input.name, code: input.code },
  });
}

export async function updateSubject(
  schoolId: string,
  id: string,
  patch: { name?: string; code?: string | null },
) {
  const row = await prisma.subject.findFirst({ where: { id, schoolId } });
  if (!row) {
    throw new HttpError(404, 'Subject not found');
  }
  return prisma.subject.update({ where: { id }, data: patch });
}
