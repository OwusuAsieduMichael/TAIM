import { z } from 'zod';

const optionalHttpsUrl = z
  .union([z.string().url().max(2048), z.null()])
  .optional()
  .refine((v) => v == null || /^https:\/\//i.test(v), {
    message: 'URL must use https',
  });

export const createStudentSchema = z.object({
  admissionNumber: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().max(20).optional(),
  classId: z.string().cuid().optional(),
  parentIds: z.array(z.string().cuid()).optional(),
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
  gender: z.string().max(20).nullable().optional(),
  classId: z.string().cuid().nullable().optional(),
  passportPhotoUrl: optionalHttpsUrl,
});

export const resetPinSchema = z.object({
  pin: z.string().min(4).max(12).optional(),
});
