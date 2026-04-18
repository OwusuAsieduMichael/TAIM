import { prisma } from '../../lib/prisma.js';

export async function listForUser(userId: string, schoolId: string) {
  return prisma.notification.findMany({
    where: { userId, schoolId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function markRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}
