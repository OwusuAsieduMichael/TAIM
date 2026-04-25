import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as svc from './teacher-workforce.service.js';

export async function status(req: AuthedRequest, res: Response): Promise<void> {
  const out = await svc.getWorkforceStatus(req.auth!.sub, req.auth!.schoolId!);
  res.json(out);
}

export async function signIn(req: AuthedRequest, res: Response): Promise<void> {
  const { code } = req.body as { code: string };
  const out = await svc.verifySignIn(req.auth!.sub, req.auth!.schoolId!, code);
  res.json(out);
}

export async function signOut(req: AuthedRequest, res: Response): Promise<void> {
  const { code } = req.body as { code: string };
  const out = await svc.verifySignOut(req.auth!.sub, req.auth!.schoolId!, code);
  res.json(out);
}
