import { z } from 'zod';

export const upsertResultSchema = z.object({
  studentId: z.string().cuid(),
  subjectId: z.string().cuid(),
  termId: z.string().cuid(),
  classId: z.string().cuid(),
  caScore: z.number().min(0).max(30),
  examScore: z.number().min(0).max(70),
});

export const publishResultsSchema = z.object({
  termId: z.string().cuid(),
  subjectId: z.string().cuid().optional(),
});
