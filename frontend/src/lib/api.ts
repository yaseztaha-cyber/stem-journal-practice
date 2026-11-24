export interface DesktopBridge {
  apiBase?: string;
  platform?: string;
  getAppVersion?: () => Promise<string>;
  checkForUpdates?: () => Promise<{ status: string; version?: string; message: string }>;
  getAiProviders?: () => Promise<string[]>;
  saveAiKeys?: (keys: Record<string, string>) => Promise<string[]>;
  restartApp?: () => Promise<void>;
  onUpdateStatus?: (cb: (s: { status: string; version?: string; message: string }) => void) => () => void;
}

declare global {
  interface Window {
    sjpDesktop?: DesktopBridge;
  }
}

const BASE = (typeof window !== 'undefined' && window.sjpDesktop?.apiBase) ?? '';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('sjp_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res: Response, hadAuth: boolean) {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('Unexpected server response');
  }
  if (!res.ok) {
    // Dead session (expired token, foreign token, or account gone): drop the
    // stale credentials and send the user back to sign in instead of leaving
    // every page erroring. Login/register failures carry no token code and are
    // never redirected (avoids loops on wrong passwords).
    if (
      res.status === 401 &&
      hadAuth &&
      (data?.code === 'token_expired' || data?.code === 'token_invalid')
    ) {
      try {
        localStorage.removeItem('sjp_token');
        localStorage.removeItem('sjp_user');
      } catch {
        /* ignore */
      }
      const p = window.location.pathname;
      if (p !== '/login' && p !== '/register') {
        window.location.assign('/login?expired=1');
        throw new Error('Session expired — please sign in again');
      }
    }
    const err = new Error((data && data.error) || `Request failed (${res.status})`) as Error & { data?: any; status?: number };
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

function hasAuth(): boolean {
  try {
    return !!localStorage.getItem('sjp_token');
  } catch {
    return false;
  }
}

export const api = {
  get: (path: string) => fetch(BASE + path, { headers: { ...authHeaders() } }).then((r) => handle(r, hasAuth())),
  post: (path: string, body?: unknown) =>
    fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => handle(r, hasAuth())),
  put: (path: string, body?: unknown) =>
    fetch(BASE + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => handle(r, hasAuth())),
  del: (path: string) => fetch(BASE + path, { method: 'DELETE', headers: { ...authHeaders() } }).then((r) => handle(r, hasAuth())),
  upload: (path: string, form: FormData) =>
    fetch(BASE + path, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: form,
    }).then((r) => handle(r, hasAuth())),
};

export function setToken(token: string | null) {
  if (token) localStorage.setItem('sjp_token', token);
  else localStorage.removeItem('sjp_token');
}

export function getUser(): any | null {
  try {
    const raw = localStorage.getItem('sjp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(u: any | null) {
  if (u) localStorage.setItem('sjp_user', JSON.stringify(u));
  else localStorage.removeItem('sjp_user');
}

export const CATEGORY_LABELS: Record<string, string> = {
  personal_reflection: 'Personal Reflection',
  team_collaboration: 'Team Collaboration',
  learning_transfer: 'Learning Transfer',
  engineering_design_process: 'Engineering Design Process',
};

export function wordCount(s: string): number {
  const t = (s ?? '').trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}
