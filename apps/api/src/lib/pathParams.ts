import { HttpError } from '../middleware/errorHandler.js';

export function pathParam(value: string | string[] | undefined, name: string): string {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === 'string' && v.length > 0);
    if (typeof first === 'string') return first;
  }
  throw new HttpError(400, `Missing path parameter: ${name}`);
}
