const base = import.meta.env.VITE_API_URL ?? '';

function formatApiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data !== 'object' || data === null) {
    return fallback;
  }
  const o = data as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof o.error === 'string') {
    parts.push(o.error);
  }
  if (typeof o.hint === 'string') {
    parts.push(o.hint);
  }
  if (typeof o.details === 'string') {
    parts.push(o.details);
  } else if (o.details !== undefined && o.details !== null) {
    try {
      parts.push(JSON.stringify(o.details));
    } catch {
      parts.push(String(o.details));
    }
  }
  return parts.length > 0 ? parts.join(' — ') : fallback;
}

/** Vite’s /api proxy returns 5xx with no JSON when nothing listens on port 4000. */
function augmentUnreachableApiHint(
  path: string,
  res: Response,
  text: string,
  data: unknown,
  baseMsg: string,
): string {
  if (!import.meta.env.DEV || !path.startsWith('/api')) {
    return baseMsg;
  }
  const looksLikeOurJson =
    typeof data === 'object' &&
    data !== null &&
    (typeof (data as Record<string, unknown>).error === 'string' ||
      typeof (data as Record<string, unknown>).hint === 'string');
  if (looksLikeOurJson) {
    return baseMsg;
  }
  const emptyOrNonJson = text.trim() === '' || typeof data === 'string';
  const proxyStyleFailure =
    res.status === 502 ||
    res.status === 504 ||
    (res.status === 500 && (emptyOrNonJson || baseMsg === 'Internal Server Error'));
  if (proxyStyleFailure) {
    return `${baseMsg} — Start the API in another terminal: npm run dev:api (http://localhost:4000).`;
  }
  return baseMsg;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  const { token: _t, ...rest } = options;
  const res = await fetch(`${base}${path}`, { ...rest, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const rawMsg = formatApiErrorMessage(data, res.statusText);
    const msg = augmentUnreachableApiHint(path, res, text, data, rawMsg);
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}
