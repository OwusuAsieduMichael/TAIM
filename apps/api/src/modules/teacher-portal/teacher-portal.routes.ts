import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './teacher-portal.controller.js';

export const teacherPortalRouter = Router();

teacherPortalRouter.use(requireAuth, requireSchoolScope, requireRoles('TEACHER'));

teacherPortalRouter.get('/workspace', asyncHandler((req, res) => ctrl.workspace(req as AuthedRequest, res)));
