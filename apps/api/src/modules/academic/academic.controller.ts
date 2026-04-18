import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './academic.service.js';

export async function listYears(req: AuthedRequest, res: Response): Promise<void> {
  const rows = await svc.listYears(req.auth!.schoolId!);
  res.json({ data: rows });
}

export async function createYear(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.createYear(req.auth!.schoolId!, req.body);
  res.status(201).json(row);
}

export async function createTerm(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.createTerm(req.auth!.schoolId!, req.params.yearId, req.body);
  res.status(201).json(row);
}
