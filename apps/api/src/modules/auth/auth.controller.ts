import type { Response } from 'express';
import type { AuthedRequest } from '../../middleware/auth.js';
import * as authService from './auth.service.js';

export async function adminLogin(req: AuthedRequest, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.loginAdmin(email, password);
  res.json(result);
}

export async function teacherOtpRequest(req: AuthedRequest, res: Response): Promise<void> {
  const result = await authService.requestOtp({ ...req.body, role: 'TEACHER' });
  res.json(result);
}

export async function teacherOtpVerify(req: AuthedRequest, res: Response): Promise<void> {
  const result = await authService.verifyOtp({ ...req.body, role: 'TEACHER' });
  res.json(result);
}

export async function parentOtpRequest(req: AuthedRequest, res: Response): Promise<void> {
  const result = await authService.requestOtp({ ...req.body, role: 'PARENT' });
  res.json(result);
}

export async function parentOtpVerify(req: AuthedRequest, res: Response): Promise<void> {
  const result = await authService.verifyOtp({ ...req.body, role: 'PARENT' });
  res.json(result);
}

export async function studentLogin(req: AuthedRequest, res: Response): Promise<void> {
  const result = await authService.loginStudent(req.body);
  res.json(result);
}

export async function me(req: AuthedRequest, res: Response): Promise<void> {
  const user = await authService.getProfile(req.auth!.sub);
  res.json(user);
}
