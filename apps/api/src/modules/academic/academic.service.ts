import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listYears(schoolId: string) {
  return prisma.academicYear.findMany({
    where: { schoolId },
    include: { terms: { orderBy: { order: 'asc' } } },
    orderBy: { startsOn: 'desc' },
  });
}

export async function createYear(
  schoolId: string,
  input: { name: string; startsOn: string; endsOn: string },
) {
  return prisma.academicYear.create({
    data: {
      schoolId,
      name: input.name,
      startsOn: new Date(input.startsOn),
      endsOn: new Date(input.endsOn),
    },
  });
}

export async function createTerm(
  schoolId: string,
  yearId: string,
  input: { name: string; order: number; startsOn: string; endsOn: string },
) {
  const year = await prisma.academicYear.findFirst({ where: { id: yearId, schoolId } });
  if (!year) {
    throw new HttpError(404, 'Academic year not found');
  }
  return prisma.term.create({
    data: {
      academicYearId: yearId,
      name: input.name,
      order: input.order,
      startsOn: new Date(input.startsOn),
      endsOn: new Date(input.endsOn),
    },
  });
}
