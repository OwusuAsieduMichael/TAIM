import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

function isPrismaInitError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { constructor?: { name?: string } }).constructor?.name === 'PrismaClientInitializationError'
  );
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P1001' || err.code === 'P1017') {
      res.status(503).json({
        error: 'Database unavailable',
        hint:
          'Supabase: DATABASE_URL must use the transaction pooler (e.g. *.pooler.supabase.com:6543). DIRECT_URL uses db.*.supabase.co:5432. See apps/api/.env.example.',
        ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
      });
      console.error(err);
      return;
    }
    if (err.code === 'P2021') {
      res.status(503).json({
        error: 'Database tables are missing',
        hint: 'Apply migrations, then seed. From folder apps/api run: npx prisma migrate deploy && npx prisma db seed (use DIRECT_URL / pooler per .env.example).',
        ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
      });
      console.error(err);
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Duplicate record', code: err.code });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Record not found', code: err.code });
      return;
    }
  }
  if (isPrismaInitError(err)) {
    res.status(503).json({
      error: 'Database unavailable',
      hint:
        'Check DATABASE_URL: use the Supabase pooler host (e.g. *.pooler.supabase.com:6543), not db.*.supabase.co:6543. Direct host uses port 5432.',
      ...(process.env.NODE_ENV !== 'production' && err instanceof Error
        ? { details: err.message }
        : {}),
    });
    console.error(err);
    return;
  }
  if (err instanceof Error && isLikelyDbConnectionMessage(err.message)) {
    res.status(503).json({
      error: 'Database unavailable',
      hint:
        'Fix DATABASE_URL / DIRECT_URL in apps/api/.env (pooler :6543 vs direct db host :5432). Run: npx prisma migrate deploy && npx prisma db seed',
      ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
    });
    console.error(err);
    return;
  }
  console.error(err);
  const expose = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: 'Internal server error',
    ...(expose && err instanceof Error ? { details: err.message } : {}),
  });
}

function isLikelyDbConnectionMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("can't reach database server") ||
    m.includes('connect econnrefused') ||
    m.includes('connection timed out') ||
    m.includes('prismaclientinitializationerror') ||
    m.includes('server has closed the connection')
  );
}
