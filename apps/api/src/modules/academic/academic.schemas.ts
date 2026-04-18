import { z } from 'zod';

export const createYearSchema = z.object({
  name: z.string().min(2),
  startsOn: z.string().datetime(),
  endsOn: z.string().datetime(),
});

export const createTermSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().min(1).max(3),
  startsOn: z.string().datetime(),
  endsOn: z.string().datetime(),
});
