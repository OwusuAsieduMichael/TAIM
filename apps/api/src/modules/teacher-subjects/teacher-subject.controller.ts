import type { Response } from 'express';
import { pathParam } from '../../lib/pathParams.js';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './teacher-subject.service.js';

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const rows = await svc.listAssignments(req.auth!.schoolId!);
  res.json({ data: rows });
}

export async function create(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.assign(req.auth!.schoolId!, req.body);
  res.status(201).json(row);
}

export async function remove(req: AuthedRequest, res: Response): Promise<void> {
  const id = pathParam(req.params.id, 'id');
  await svc.remove(req.auth!.schoolId!, id);
  res.status(204).send();
}
