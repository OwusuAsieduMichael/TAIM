import type { Response } from 'express';
import { pathParam } from '../../lib/pathParams.js';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './student.service.js';

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId!;
  const rows = await svc.listStudents(schoolId);
  res.json({ data: rows });
}

export async function create(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId!;
  const body = req.body as Record<string, unknown>;
  const result = await svc.createStudent(schoolId, body as Parameters<typeof svc.createStudent>[1]);
  res.status(201).json(result);
}

export async function update(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId!;
  const id = pathParam(req.params.id, 'id');
  const row = await svc.updateStudent(schoolId, id, req.body);
  res.json(row);
}

export async function resetPin(req: AuthedRequest, res: Response): Promise<void> {
  const schoolId = req.auth!.schoolId!;
  const body = req.body as { pin?: string };
  const ip = req.ip;
  const id = pathParam(req.params.id, 'id');
  const result = await svc.resetStudentPin(schoolId, req.auth!.sub, id, body.pin, ip);
  res.json(result);
}
