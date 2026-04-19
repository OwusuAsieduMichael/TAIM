import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './result.service.js';

export async function upsert(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.upsertResult(req.auth!.schoolId!, req.body, {
    sub: req.auth!.sub,
    role: req.auth!.role,
  });
  res.json(row);
}

export async function publish(req: AuthedRequest, res: Response): Promise<void> {
  const result = await svc.publishResults(req.auth!.schoolId!, req.body);
  res.json(result);
}

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const q = req.query as { termId?: string; studentId?: string; published?: string };
  const rows = await svc.listResults(req.auth!.schoolId!, req.auth!, q);
  res.json({ data: rows });
}
