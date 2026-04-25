import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/errorHandler.js';
import * as svc from '../teacher-workforce/teacher-workforce.service.js';

export async function morningOtps(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId;
  if (!schoolId) throw new HttpError(403, 'School scope required');
  const out = await svc.issueMorningOtps(schoolId);
  res.json(out);
}

export async function eveningOtps(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId;
  if (!schoolId) throw new HttpError(403, 'School scope required');
  const out = await svc.issueEveningOtps(schoolId);
  res.json(out);
}
