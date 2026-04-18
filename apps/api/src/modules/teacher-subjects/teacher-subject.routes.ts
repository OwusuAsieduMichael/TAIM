import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './teacher-subject.controller.js';
import { assignTeacherSubjectSchema } from './teacher-subject.schemas.js';

export const teacherSubjectRouter = Router();

teacherSubjectRouter.use(requireAuth, requireSchoolScope, requireRoles('ADMIN'));

teacherSubjectRouter.get('/', asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)));
teacherSubjectRouter.post('/', validateBody(assignTeacherSubjectSchema), asyncHandler((req, res) => ctrl.create(req as AuthedRequest, res)));
teacherSubjectRouter.delete('/:id', asyncHandler((req, res) => ctrl.remove(req as AuthedRequest, res)));
