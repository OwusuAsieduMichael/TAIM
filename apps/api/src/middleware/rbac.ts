import type { NextFunction, Response } from 'express';
import type { Role } from '@prisma/client';
import type { AuthedRequest } from './auth.js';
import { HttpError } from './errorHandler.js';

export function requireRoles(...allowed: Role[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction): void => {
    const role = req.auth?.role;
    if (!role || !allowed.includes(role)) {
      next(new HttpError(403, 'Forbidden'));
      return;
    }
    next();
  };
}

export function requireSchoolScope(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const role = req.auth?.role;
  if (role === 'SUPER_ADMIN') {
    next();
    return;
  }
  if (!req.auth?.schoolId) {
    next(new HttpError(403, 'School scope required'));
    return;
  }
  next();
}
