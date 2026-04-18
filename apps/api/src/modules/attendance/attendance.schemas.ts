import { z } from 'zod';

export const bulkAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classId: z.string().cuid().optional(),
  rows: z.array(
    z.object({
      studentId: z.string().cuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    }),
  ),
});
