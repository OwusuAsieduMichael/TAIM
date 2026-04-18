import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './student.controller.js';
import { createStudentSchema, resetPinSchema, updateStudentSchema } from './student.schemas.js';

export const studentRouter = Router();

studentRouter.use(requireAuth, requireSchoolScope, requireRoles('ADMIN'));

studentRouter.get('/', asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)));
studentRouter.post('/', validateBody(createStudentSchema), asyncHandler((req, res) => ctrl.create(req as AuthedRequest, res)));
studentRouter.patch('/:id', validateBody(updateStudentSchema), asyncHandler((req, res) => ctrl.update(req as AuthedRequest, res)));
studentRouter.post('/:id/reset-pin', validateBody(resetPinSchema), asyncHandler((req, res) => ctrl.resetPin(req as AuthedRequest, res)));
