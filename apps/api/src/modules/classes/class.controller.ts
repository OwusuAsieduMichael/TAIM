import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './class.service.js';

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const rows = await svc.listClasses(req.auth!.schoolId!);
  res.json({ data: rows });
}

export async function create(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.createClass(req.auth!.schoolId!, req.body);
  res.status(201).json(row);
}

export async function update(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.updateClass(req.auth!.schoolId!, req.params.id, req.body);
  res.json(row);
}
