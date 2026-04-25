import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './report-card.service.js';

function routeParamString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export async function submit(req: AuthedRequest, res: Response): Promise<void> {
  const row = await svc.submitReportCard(req.auth!.schoolId!, req.auth!.sub, req.body);
  res.status(201).json(row);
}

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  const rows = await svc.listReportCards(req.auth!.schoolId!, {
    role: req.auth!.role,
    sub: req.auth!.sub,
  });
  res.json({ data: rows });
}

export async function approve(req: AuthedRequest, res: Response): Promise<void> {
  const id = routeParamString(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Missing submission id' });
    return;
  }
  const { note } = req.body as { note?: string };
  const row = await svc.setReportCardStatus(req.auth!.schoolId!, id, req.auth!.sub, 'APPROVED', note);
  res.json(row);
}

export async function reject(req: AuthedRequest, res: Response): Promise<void> {
  const id = routeParamString(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Missing submission id' });
    return;
  }
  const { note } = req.body as { note?: string };
  const row = await svc.setReportCardStatus(req.auth!.schoolId!, id, req.auth!.sub, 'REJECTED', note);
  res.json(row);
}

export async function rankings(req: AuthedRequest, res: Response): Promise<void> {
  const q = req.query as { termId: string; classId: string };
  if (!q.termId || !q.classId) {
    res.status(400).json({ error: 'termId and classId are required' });
    return;
  }
  const out = await svc.rankingsForTeacher(req.auth!.schoolId!, req.auth!.sub, q);
  res.json(out);
}
