import crypto from 'crypto';
import { getEnv } from '../config/env.js';

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export function hashOtp(code: string): string {
  const secret = getEnv().JWT_SECRET;
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

export function verifyOtpHash(code: string, hash: string): boolean {
  const a = hashOtp(code);
  if (a.length !== hash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(hash, 'utf8'));
}
