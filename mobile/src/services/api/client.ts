/**
 * API Client Configuration
 * Uses fetch-based wrapper so React Native's native networking bypasses CORS.
 * Axios (XHR-based) triggers CORS preflight from the Metro debugger origin;
 * native fetch does not — the request goes directly from the device/simulator.
 */

import { tokenStorage } from '@services/storage/tokenStorage';
import { apiConfig } from '@config/index';
import { sessionEvents } from '@utils/sessionEvents';

const BASE_URL = apiConfig.baseUrl;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  config: { method?: string; url?: string };
}

async function request<T>(
  method: Method,
  url: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const accessToken = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...config.headers,
  };

  if (accessToken && method !== 'OPTIONS') {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Build query string
  let fullUrl = `${BASE_URL}${url}`;
  if (config.params) {
    const qs = Object.entries(config.params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) fullUrl += `?${qs}`;
  }

  const body = config.data !== undefined ? JSON.stringify(config.data) : undefined;

  // Sanitized log (hide passwords)
  const logBody = config.data
    ? JSON.stringify({ ...(config.data as object), ...(('password' in (config.data as object)) ? { password: '***' } : {}) })
    : undefined;
  console.log(`[API] --> ${method} ${fullUrl}`);
  if (logBody) console.log('[API]     body:', logBody);

  let response: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), apiConfig.timeout);
    response = await fetch(fullUrl, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err: any) {
    console.error('[API] Network error:', err?.message);
    const networkErr: any = new Error(err?.name === 'AbortError' ? 'Request timed out' : 'Network Error');
    networkErr.config = { method, url };
    throw networkErr;
  }

  let responseData: T;
  try {
    const contentType = response.headers.get('content-type') ?? '';
    console.log(`[API]     content-type: ${contentType}`);
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // Server sent octet-stream or other non-JSON content-type — try parsing as text then JSON
      const text = await response.text();
      console.log(`[API]     raw text (first 500): ${text.slice(0, 500)}`);
      try {
        responseData = JSON.parse(text) as T;
      } catch {
        responseData = undefined as T;
      }
    }
  } catch {
    responseData = undefined as T;
  }

  console.log(`[API] <-- ${response.status} ${method} ${url}`);
  console.log('[API]     response:', JSON.stringify(responseData));

  const result: ApiResponse<T> = {
    data: responseData,
    status: response.status,
    config: { method, url },
  };

  if (!response.ok) {
    const isAuthEndpoint = url.startsWith('/auth/');

    if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
      console.warn(`[API] ${response.status} — clearing session`);
      await tokenStorage.clearAuthData();
      sessionEvents.emitSessionExpired();
    }

    const err: any = new Error(
      (responseData as any)?.message ?? `HTTP ${response.status}`
    );
    err.response = result;
    err.config = result.config;
    throw err;
  }

  return result;
}

// Axios-compatible interface so all service files work without changes
const apiClient = {
  get: <T>(url: string, config?: RequestConfig) =>
    request<T>('GET', url, config),
  post: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>('POST', url, { ...config, data }),
  put: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>('PUT', url, { ...config, data }),
  patch: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>('PATCH', url, { ...config, data }),
  delete: <T>(url: string, config?: RequestConfig) =>
    request<T>('DELETE', url, config),
};

export default apiClient;
