import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function createSchool(input: { name: string; slug: string }) {
  const exists = await prisma.school.findUnique({ where: { slug: input.slug } });
  if (exists) {
    throw new HttpError(409, 'Slug already in use');
  }
  return prisma.school.create({
    data: { name: input.name, slug: input.slug },
  });
}

export async function listSchools() {
  return prisma.school.findMany({ orderBy: { name: 'asc' } });
}

export async function getSchoolForUser(schoolId: string) {
  return prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
}
