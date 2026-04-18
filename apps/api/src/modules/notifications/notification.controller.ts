import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/errorHandler.js';
import * as svc from './notification.service.js';

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId;
  if (!schoolId) {
    throw new HttpError(400, 'School context required');
  }
  const rows = await svc.listForUser(req.auth!.sub, schoolId);
  res.json({ data: rows });
}

export async function read(req: AuthedRequest, res: Response): Promise<void> {
  await svc.markRead(req.auth!.sub, req.params.id);
  res.status(204).send();
}
