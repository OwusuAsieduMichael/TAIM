import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();
