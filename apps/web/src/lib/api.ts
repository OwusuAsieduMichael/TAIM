const base = import.meta.env.VITE_API_URL ?? '';
const gasBackend = import.meta.env.VITE_API_BACKEND === 'gas';
const gasUrl = import.meta.env.VITE_GAS_URL ?? import.meta.env.VITE_API_URL ?? '';

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
    if (gasBackend) {
      return `${baseMsg} — Check VITE_GAS_URL in apps/web/.env and that the Apps Script web app is deployed.`;
    }
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

function parseJsonBody(body: BodyInit | null | undefined): Record<string, unknown> {
  if (!body || typeof body !== 'string') {
    return {};
  }
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function gasFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const envelope = {
    route: path,
    method: options.method ?? 'GET',
    token: options.token ?? null,
    body: parseJsonBody(options.body),
  };
  const target = import.meta.env.DEV ? '/api/gas' : gasUrl;
  if (!target) {
    throw new ApiError(
      'VITE_GAS_URL is not set. Add your Apps Script /exec URL to apps/web/.env',
      500,
    );
  }
  const res = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(envelope),
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  const gasError =
    typeof data === 'object' && data !== null && typeof (data as Record<string, unknown>).error === 'string';
  if (!res.ok || gasError) {
    const status = gasError ? 400 : res.status;
    const rawMsg = formatApiErrorMessage(data, res.statusText);
    const msg = augmentUnreachableApiHint(path, res, text, data, rawMsg);
    throw new ApiError(msg, status, data);
  }
  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  if (gasBackend) {
    return gasFetch<T>(path, options);
  }

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
