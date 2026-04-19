import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './result.controller.js';
import { publishResultsSchema, upsertResultSchema } from './result.schemas.js';

export const resultRouter = Router();

resultRouter.use(requireAuth);

resultRouter.get(
  '/',
  requireSchoolScope,
  requireRoles('ADMIN', 'TEACHER', 'PARENT', 'STUDENT'),
  asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)),
);

resultRouter.post(
  '/upsert',
  requireSchoolScope,
  requireRoles('ADMIN', 'TEACHER'),
  validateBody(upsertResultSchema),
  asyncHandler((req, res) => ctrl.upsert(req as AuthedRequest, res)),
);

resultRouter.post(
  '/publish',
  requireSchoolScope,
  requireRoles('ADMIN'),
  validateBody(publishResultsSchema),
  asyncHandler((req, res) => ctrl.publish(req as AuthedRequest, res)),
);
