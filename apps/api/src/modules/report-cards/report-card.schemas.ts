import { z } from 'zod';

export const submitReportCardSchema = z.object({
  termId: z.string().min(1),
  classId: z.string().min(1),
  note: z.string().max(2000).optional(),
});

export const reviewReportCardSchema = z.object({
  note: z.string().max(2000).optional(),
});
