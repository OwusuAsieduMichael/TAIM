import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './class.controller.js';
import { createClassSchema, updateClassSchema } from './class.schemas.js';

export const classRouter = Router();

classRouter.use(requireAuth, requireSchoolScope, requireRoles('ADMIN'));

classRouter.get('/', asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)));
classRouter.post('/', validateBody(createClassSchema), asyncHandler((req, res) => ctrl.create(req as AuthedRequest, res)));
classRouter.patch('/:id', validateBody(updateClassSchema), asyncHandler((req, res) => ctrl.update(req as AuthedRequest, res)));
