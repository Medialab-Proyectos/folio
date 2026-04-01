const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://3.14.11.227:8001';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokens = {
  getAccess: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null,
  set: (access: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: QueryParams;
  auth?: boolean;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = tokens.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokens.set(data.access_token);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  { body, params, auth = true, method = 'GET', headers = {}, ...rest }: RequestOptions = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { ...(headers as Record<string, string>) };
    if (body && !(body instanceof FormData)) {
      h['Content-Type'] = 'application/json';
    }
    if (auth) {
      const token = tokens.getAccess();
      if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  };

  const makeRequest = () =>
    fetch(url.toString(), {
      method,
      headers: buildHeaders(),
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...rest,
    });

  let res = await makeRequest();

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await makeRequest();
    } else {
      tokens.clear();
      throw new APIError(401, 'Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {
      // ignore parse error
    }
    throw new APIError(res.status, detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
