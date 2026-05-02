import type { Response } from 'express';
import { pathParam } from '../../lib/pathParams.js';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './subject.service.js';

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const rows = await svc.listSubjects(req.auth!.schoolId!);
  res.json({ data: rows });
}

export async function create(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.createSubject(req.auth!.schoolId!, req.body);
  res.status(201).json(row);
}

export async function update(req: AuthedRequest, res: Response): Promise<void> {
  const id = pathParam(req.params.id, 'id');
  const row = await svc.updateSubject(req.auth!.schoolId!, id, req.body);
  res.json(row);
}
