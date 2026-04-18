import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './academic.controller.js';
import { createTermSchema, createYearSchema } from './academic.schemas.js';

export const academicRouter = Router();

academicRouter.use(requireAuth, requireSchoolScope, requireRoles('ADMIN'));

academicRouter.get('/years', asyncHandler((req, res) => ctrl.listYears(req as AuthedRequest, res)));
academicRouter.post('/years', validateBody(createYearSchema), asyncHandler((req, res) => ctrl.createYear(req as AuthedRequest, res)));
academicRouter.post(
  '/years/:yearId/terms',
  validateBody(createTermSchema),
  asyncHandler((req, res) => ctrl.createTerm(req as AuthedRequest, res)),
);
