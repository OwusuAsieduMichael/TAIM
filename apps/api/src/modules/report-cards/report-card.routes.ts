import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { teacherWorkforceGate } from '../../middleware/teacherWorkforceGate.js';
import { requireRoles, requireSchoolScope } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './report-card.controller.js';
import { z } from 'zod';
import { submitReportCardSchema } from './report-card.schemas.js';

const reviewBody = z.object({ note: z.string().max(2000).optional() });

export const reportCardRouter = Router();

reportCardRouter.use(requireAuth, requireSchoolScope);

reportCardRouter.post(
  '/submit',
  requireRoles('TEACHER'),
  teacherWorkforceGate,
  validateBody(submitReportCardSchema),
  asyncHandler((req, res) => ctrl.submit(req as AuthedRequest, res)),
);

reportCardRouter.get(
  '/rankings',
  requireRoles('TEACHER'),
  teacherWorkforceGate,
  asyncHandler((req, res) => ctrl.rankings(req as AuthedRequest, res)),
);

reportCardRouter.get(
  '/',
  requireRoles('ADMIN', 'TEACHER'),
  asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)),
);

reportCardRouter.post(
  '/:id/approve',
  requireRoles('ADMIN'),
  validateBody(reviewBody),
  asyncHandler((req, res) => ctrl.approve(req as AuthedRequest, res)),
);

reportCardRouter.post(
  '/:id/reject',
  requireRoles('ADMIN'),
  validateBody(reviewBody),
  asyncHandler((req, res) => ctrl.reject(req as AuthedRequest, res)),
);
