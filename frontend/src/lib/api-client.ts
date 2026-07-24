import 'server-only';
import { cookies } from 'next/headers';
import { setAuthCookies, clearAuthCookies } from './auth-cookies';
export const BASE_URL = process.env.NESTJS_URL || 'http://localhost:4000/api/v1';
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
const globalAny = globalThis as any;
async function handleTokenRefresh(): Promise<string | null> {
  if (globalAny.refreshPromise) {
    return globalAny.refreshPromise;
  }
  globalAny.refreshPromise = (async () => {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get('refresh_token')?.value;
      if (!refreshToken) return null;
      const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        await clearAuthCookies();
        return null;
      }
      const data = await res.json();
      await setAuthCookies(data.access_token, data.refresh_token || refreshToken);
      return data.access_token;
    } catch (error) {
      return null;
    } finally {
      globalAny.refreshPromise = null;
    }
  })();
  return globalAny.refreshPromise;
}
async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, unknown> | FormData,
  isRetry = false,
  customFetchOptions: RequestInit = {} 
): Promise<T> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('access_token')?.value;
  const headers = new Headers(customFetchOptions.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const fetchConfig: RequestInit = {
    ...customFetchOptions,
    method,
    headers,
  };
  if (body) {
    if (body instanceof FormData) {
      fetchConfig.body = body;
      headers.delete('Content-Type'); 
    } else {
      headers.set('Content-Type', 'application/json');
      fetchConfig.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, fetchConfig);
  if (res.status === 401 && !isRetry) {
    const refreshedToken = await handleTokenRefresh();
    if (refreshedToken) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
      const retryRes = await fetch(`${BASE_URL}${endpoint}`, { 
        ...fetchConfig, 
        headers: retryHeaders 
      });
      if (retryRes.status === 401) {
        const { redirect } = await import('next/navigation');
        redirect('/sign-in');
      }
      return handleResponse<T>(retryRes);
    } else {
      // Refresh failed, trigger Next.js redirect
      const { redirect } = await import('next/navigation');
      redirect('/sign-in');
    }
  }
  
  if (res.status === 401 && isRetry) {
    const { redirect } = await import('next/navigation');
    redirect('/sign-in');
  }

  return handleResponse<T>(res);
}
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new ApiError(msg || 'Something went wrong', res.status);
  }
  return data as T;
}
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return request<T>(endpoint, 'GET', undefined, false, options);
}
export async function apiPost<T>(endpoint: string, body: Record<string, unknown> | FormData): Promise<T> {
  return request<T>(endpoint, 'POST', body);
}
export async function apiPatch<T>(endpoint: string, body: Record<string, unknown> | FormData): Promise<T> {
  return request<T>(endpoint, 'PATCH', body);
}
export async function apiDelete<T>(endpoint: string, body?: Record<string, unknown> | FormData): Promise<T> {
  return request<T>(endpoint, 'DELETE', body);
}