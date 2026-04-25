import type { NextFunction, Response } from 'express';
import type { AuthedRequest } from './auth.js';
import { HttpError } from './errorHandler.js';
import { canTeacherOperate } from '../modules/teacher-workforce/teacher-workforce.service.js';

export async function teacherWorkforceGate(req: AuthedRequest, _res: Response, next: NextFunction): Promise<void> {
  if (req.auth?.role !== 'TEACHER') {
    next();
    return;
  }
  const schoolId = req.auth.schoolId;
  if (!schoolId) {
    next(new HttpError(403, 'School scope required'));
    return;
  }
  try {
    const ok = await canTeacherOperate(req.auth.sub, schoolId);
    if (!ok) {
      next(
        new HttpError(
          403,
          'Complete morning sign-in with your SMS code, or your session has ended after the evening window.',
          'TEACHER_WORKFORCE_BLOCKED',
        ),
      );
      return;
    }
    next();
  } catch (e) {
    next(e);
  }
}
