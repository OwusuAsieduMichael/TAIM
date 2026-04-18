import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './auth.controller.js';
import {
  adminLoginSchema,
  otpRequestSchema,
  otpVerifySchema,
  studentLoginSchema,
} from './auth.schemas.js';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const strictAuthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

export const authRouter = Router();

authRouter.post(
  '/admin/login',
  strictAuthLimiter,
  validateBody(adminLoginSchema),
  asyncHandler(ctrl.adminLogin),
);

authRouter.post(
  '/teacher/otp/request',
  strictAuthLimiter,
  validateBody(otpRequestSchema),
  asyncHandler(ctrl.teacherOtpRequest),
);
authRouter.post(
  '/teacher/otp/verify',
  strictAuthLimiter,
  validateBody(otpVerifySchema),
  asyncHandler(ctrl.teacherOtpVerify),
);

authRouter.post(
  '/parent/otp/request',
  strictAuthLimiter,
  validateBody(otpRequestSchema),
  asyncHandler(ctrl.parentOtpRequest),
);
authRouter.post(
  '/parent/otp/verify',
  strictAuthLimiter,
  validateBody(otpVerifySchema),
  asyncHandler(ctrl.parentOtpVerify),
);

authRouter.post(
  '/student/login',
  strictAuthLimiter,
  validateBody(studentLoginSchema),
  asyncHandler(ctrl.studentLogin),
);

authRouter.get('/me', authLimiter, requireAuth, asyncHandler((req, res) => ctrl.me(req as AuthedRequest, res)));
