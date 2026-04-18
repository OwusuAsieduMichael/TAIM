import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const otpRequestSchema = z.object({
  schoolSlug: z.string().min(1),
  phone: z.string().min(8),
});

export const otpVerifySchema = z.object({
  schoolSlug: z.string().min(1),
  phone: z.string().min(8),
  code: z.string().length(6),
});

export const studentLoginSchema = z.object({
  schoolSlug: z.string().min(1),
  admissionNumber: z.string().min(1),
  pin: z.string().min(4).max(12),
});
