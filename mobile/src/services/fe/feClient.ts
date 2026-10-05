import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore — provided by react-native-dotenv babel plugin
import { FE_API_BASE_URL } from '@env';

/**
 * FluentEdge API client — small, self-contained fetch wrapper for the
 * /api/v1/fe endpoints. Kept separate from the legacy enterprise client
 * (which is tied to the disabled auth flow).
 *
 * Base URL resolution:
 * 1. FE_API_BASE_URL from .env (preferred — set it to your Mac's LAN IP,
 *    e.g. http://192.168.29.243:6000/api/v1/fe, which works on the iOS
 *    simulator, Android emulator, AND physical devices on the same WiFi).
 * 2. Fallback: platform loopback (iOS simulator → localhost, Android
 *    emulator → 10.0.2.2).
 */
const FALLBACK_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const FE_BASE_URL: string =
  FE_API_BASE_URL || `http://${FALLBACK_HOST}:6000/api/v1/fe`;

// Auth endpoints use /api/v1/auth/* (unified, not /api/v1/fe/auth/*)
export const AUTH_BASE_URL: string = FE_BASE_URL.replace(
  '/api/v1/fe',
  '/api/v1',
);

const ACCESS_KEY = 'fe.accessToken';
const REFRESH_KEY = 'fe.refreshToken';

let accessToken: string | null = null;

export const feTokens = {
  async load(): Promise<void> {
    accessToken = await AsyncStorage.getItem(ACCESS_KEY);
  },
  get(): string | null {
    return accessToken;
  },
  async set(access: string, refresh?: string): Promise<void> {
    accessToken = access;
    await AsyncStorage.setItem(ACCESS_KEY, access);
    if (refresh) await AsyncStorage.setItem(REFRESH_KEY, refresh);
  },
  async clear(): Promise<void> {
    accessToken = null;
    await AsyncStorage.removeMany([ACCESS_KEY, REFRESH_KEY]);
  },
};

export interface FeRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

/** Core request. Returns the `data` field of the `{ success, data }` envelope. */
export async function feRequest<T>(
  path: string,
  opts: FeRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = false } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${FE_BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    const message =
      json?.message || json?.error || `Request failed (${res.status})`;
    throw new FeApiError(message, res.status);
  }
  return json.data as T;
}

export class FeApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'FeApiError';
    this.status = status;
  }
}
