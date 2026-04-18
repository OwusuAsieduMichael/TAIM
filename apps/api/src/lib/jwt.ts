import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { getEnv } from '../config/env.js';

export type AccessPayload = {
  sub: string;
  role: Role;
  schoolId: string | null;
};

export function signAccessToken(payload: AccessPayload): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessPayload {
  const { JWT_SECRET } = getEnv();
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token');
  }
  const { sub, role, schoolId } = decoded as Record<string, unknown>;
  if (typeof sub !== 'string' || typeof role !== 'string') {
    throw new Error('Invalid token payload');
  }
  return {
    sub,
    role: role as Role,
    schoolId: schoolId === null || schoolId === undefined ? null : String(schoolId),
  };
}
