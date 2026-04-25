import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { teacherWorkforceGate } from '../../middleware/teacherWorkforceGate.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as wfc from '../teacher-workforce/teacher-workforce.controller.js';
import * as ctrl from './teacher-portal.controller.js';

export const teacherPortalRouter = Router();

const workforceOtpBody = z.object({ code: z.string().min(4).max(12) });

teacherPortalRouter.use(requireAuth, requireSchoolScope, requireRoles('TEACHER'));

teacherPortalRouter.get('/workforce/status', asyncHandler((req, res) => wfc.status(req as AuthedRequest, res)));
teacherPortalRouter.post(
  '/workforce/sign-in',
  validateBody(workforceOtpBody),
  asyncHandler((req, res) => wfc.signIn(req as AuthedRequest, res)),
);
teacherPortalRouter.post(
  '/workforce/sign-out',
  validateBody(workforceOtpBody),
  asyncHandler((req, res) => wfc.signOut(req as AuthedRequest, res)),
);

teacherPortalRouter.use(teacherWorkforceGate);
teacherPortalRouter.get('/workspace', asyncHandler((req, res) => ctrl.workspace(req as AuthedRequest, res)));
