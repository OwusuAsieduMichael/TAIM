import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, type AccessPayload } from '../lib/jwt.js';
import { HttpError } from './errorHandler.js';

export type AuthedRequest = Request & { auth?: AccessPayload };

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Missing bearer token'));
    return;
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}
