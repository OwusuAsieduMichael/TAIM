import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

export function validateBody<S extends z.ZodTypeAny>(schema: S) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    req.body = parsed.data as z.infer<S>;
    next();
  };
}

export function validateQuery<S extends z.ZodTypeAny>(schema: S) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    req.query = parsed.data as unknown as Request['query'];
    next();
  };
}
