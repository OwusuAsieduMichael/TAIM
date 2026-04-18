import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './subject.controller.js';
import { createSubjectSchema, updateSubjectSchema } from './subject.schemas.js';

export const subjectRouter = Router();

subjectRouter.use(requireAuth, requireSchoolScope, requireRoles('ADMIN'));

subjectRouter.get('/', asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)));
subjectRouter.post('/', validateBody(createSubjectSchema), asyncHandler((req, res) => ctrl.create(req as AuthedRequest, res)));
subjectRouter.patch('/:id', validateBody(updateSubjectSchema), asyncHandler((req, res) => ctrl.update(req as AuthedRequest, res)));
