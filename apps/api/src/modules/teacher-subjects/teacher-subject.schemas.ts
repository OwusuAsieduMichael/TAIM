import { z } from 'zod';

export const assignTeacherSubjectSchema = z.object({
  teacherId: z.string().cuid(),
  subjectId: z.string().cuid(),
  classId: z.string().cuid(),
  academicYearId: z.string().cuid().optional(),
});
