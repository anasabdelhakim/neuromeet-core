import 'server-only';

// SECURITY: Using 'server-only' package ensures this file can NEVER be imported
// into client components. This protects our backend URL and any secret tokens
// from being exposed in the browser's JavaScript bundle.
export const BASE_URL = process.env.NESTJS_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Shared response parser
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new ApiError(msg || 'Something went wrong', res.status);
  }

  return data as T;
}

// ---------- POST ----------
export async function apiPost<T>(
  endpoint: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return handleResponse<T>(res);
}

// ---------- GET ----------
export async function apiGet<T>(
  endpoint: string,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return handleResponse<T>(res);
}

// ---------- PATCH ----------
export async function apiPatch<T>(
  endpoint: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });

  return handleResponse<T>(res);
}
