import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './attendance.controller.js';
import { bulkAttendanceSchema } from './attendance.schemas.js';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth, requireSchoolScope, requireRoles('ADMIN', 'TEACHER'));

attendanceRouter.get('/', asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)));
attendanceRouter.post('/bulk', validateBody(bulkAttendanceSchema), asyncHandler((req, res) => ctrl.bulk(req as AuthedRequest, res)));
