import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1),
  level: z.string().optional(),
  academicYearId: z.string().cuid().optional(),
});

export const updateClassSchema = createClassSchema.partial();
