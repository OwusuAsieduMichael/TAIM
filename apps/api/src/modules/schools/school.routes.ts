import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './school.controller.js';
import { createSchoolSchema } from './school.schemas.js';

export const schoolRouter = Router();

schoolRouter.use(requireAuth);

schoolRouter.get('/me', requireRoles('ADMIN', 'TEACHER', 'PARENT', 'STUDENT'), asyncHandler((req, res) => ctrl.me(req as AuthedRequest, res)));

schoolRouter.get('/', requireRoles('SUPER_ADMIN', 'ADMIN'), asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)));

schoolRouter.post(
  '/',
  requireRoles('SUPER_ADMIN'),
  validateBody(createSchoolSchema),
  asyncHandler((req, res) => ctrl.create(req as AuthedRequest, res)),
);
