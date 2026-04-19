import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './teacher-portal.service.js';

export async function workspace(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId!;
  const teacherId = req.auth!.sub;
  const payload = await svc.getTeacherWorkspace(teacherId, schoolId);
  res.json(payload);
}
