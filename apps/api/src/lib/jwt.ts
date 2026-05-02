import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { getEnv } from '../config/env.js';

export type AccessPayload = {
  sub: string;
  role: Role;
  schoolId: string | null;
};

export function signAccessToken(payload: AccessPayload): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  const secret: Secret = JWT_SECRET;
  const expiresIn = JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>;
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string): AccessPayload {
  const { JWT_SECRET } = getEnv();
  const secret: Secret = JWT_SECRET;
  const decoded = jwt.verify(token, secret);
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
