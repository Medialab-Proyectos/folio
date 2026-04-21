// On the browser we always go through our own HTTPS proxy to avoid Mixed Content.
// On the server (SSR/API routes) we call the backend directly.
// NEXT_PUBLIC_API_URL is inlined into the client bundle at build time by Next.js,
// so it is always '/api/proxy' in the browser — no typeof window ambiguity.
function getBaseUrl(): string {
  // NEXT_PUBLIC_API_URL is inlined as '/api/proxy' in the browser bundle by Next.js
  const base = process.env.NEXT_PUBLIC_API_URL
    ?? (typeof window !== 'undefined' ? '/api/proxy' : (process.env.BACKEND_URL ?? 'http://34.233.63.96:8001'));
  return base;
}

// One-time log so we can verify which base URL is active in the browser
if (typeof window !== 'undefined') {
  console.log('[GF] API base URL:', getBaseUrl(), '| NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
// Bump this value whenever the backend URL changes to force all users to re-login
const AUTH_VERSION_KEY = 'auth_api_version';
const CURRENT_AUTH_VERSION = 'v1-34233';

// If the stored version doesn't match, wipe old tokens so users re-authenticate
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem(AUTH_VERSION_KEY);
  if (storedVersion !== CURRENT_AUTH_VERSION) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.setItem(AUTH_VERSION_KEY, CURRENT_AUTH_VERSION);
  }
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokens = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem(TOKEN_KEY);
    return v && v !== 'undefined' && v !== 'null' ? v : null;
  },
  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem(REFRESH_KEY);
    return v && v !== 'undefined' && v !== 'null' ? v : null;
  },
  set: (access: string, refresh?: string) => {
    if (!access || access === 'undefined' || access === 'null') return;
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh && refresh !== 'undefined' && refresh !== 'null') localStorage.setItem(REFRESH_KEY, refresh);
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

// Mutex: prevents multiple concurrent 401s from each triggering a separate
// refresh attempt (the second would fail because refresh tokens are single-use).
let _refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  const refreshToken = tokens.getRefresh();
  if (!refreshToken) return false;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/auth/refresh`, {
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
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  { body, params, auth = true, method = 'GET', headers = {}, ...rest }: RequestOptions = {}
): Promise<T> {
  const rawUrl = `${getBaseUrl()}${path}`;
  const url = rawUrl.startsWith('http')
    ? new URL(rawUrl)
    : new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

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
      console.log(`[GF] ${method} ${path} — token present: ${!!token}`, token ? token.slice(0, 20) + '...' : 'MISSING');
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
