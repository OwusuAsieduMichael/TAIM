import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as ctrl from './notification.controller.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', asyncHandler((req, res) => ctrl.list(req as AuthedRequest, res)));
notificationRouter.patch('/:id/read', asyncHandler((req, res) => ctrl.read(req as AuthedRequest, res)));
