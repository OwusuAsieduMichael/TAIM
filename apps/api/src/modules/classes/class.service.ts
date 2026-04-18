import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listClasses(schoolId: string) {
  return prisma.class.findMany({
    where: { schoolId },
    include: { academicYear: true },
    orderBy: { name: 'asc' },
  });
}

export async function createClass(
  schoolId: string,
  input: { name: string; level?: string; academicYearId?: string },
) {
  return prisma.class.create({
    data: {
      schoolId,
      name: input.name,
      level: input.level,
      academicYearId: input.academicYearId,
    },
  });
}

export async function updateClass(
  schoolId: string,
  id: string,
  patch: { name?: string; level?: string | null; academicYearId?: string | null },
) {
  const row = await prisma.class.findFirst({ where: { id, schoolId } });
  if (!row) {
    throw new HttpError(404, 'Class not found');
  }
  return prisma.class.update({
    where: { id },
    data: patch,
  });
}
