import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './school.service.js';

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  if (req.auth!.role === 'SUPER_ADMIN') {
    const rows = await svc.listSchools();
    res.json({ data: rows });
    return;
  }
  if (req.auth!.role === 'ADMIN' && req.auth!.schoolId) {
    const school = await svc.getSchoolForUser(req.auth!.schoolId);
    res.json({ data: [school] });
    return;
  }
  res.json({ data: [] });
}

export async function me(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.auth!.schoolId) {
    res.status(404).json({ error: 'No school assigned' });
    return;
  }
  const school = await svc.getSchoolForUser(req.auth!.schoolId);
  res.json(school);
}

export async function create(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.createSchool(req.body);
  res.status(201).json(row);
}
