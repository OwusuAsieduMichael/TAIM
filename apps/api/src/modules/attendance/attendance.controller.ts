import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './attendance.service.js';

export async function bulk(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId!;
  const result = await svc.bulkMark(schoolId, req.auth!.sub, req.auth!.role, req.body);
  res.json(result);
}

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId!;
  const q = req.query as { classId?: string; date?: string };
  const rows = await svc.listAttendance(schoolId, q);
  res.json({ data: rows });
}
