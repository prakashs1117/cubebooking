/**
 * Atlas API Client
 * Separate axios instance for the Atlas chemical data API.
 *
 * Auth flow (matches Ionic helperFunction.ts exactly):
 *   1. Generate validity timestamp: next 15-minute UTC boundary (format: YYYY-MM-DDHHmm)
 *   2. POST /v1/getHmacToken with { data: btoa(appKey + validity), identifier, appKey }
 *   3. Set Authorization: `HMAC ${appKey}:${tokenData.token}`
 *   4. Cache for 14 minutes (tokens valid per 15-min window)
 */

import axios, { AxiosInstance } from 'axios';
import { Buffer } from 'buffer';
import { apiConfig } from '@config/index';

interface HmacTokenResponse {
  token: string;
}

interface HmacCache {
  authHeader: string;
  expiresAt: number;
}

// 12 minutes — refresh 3 min before the 15-min server window expires
const HMAC_CACHE_TTL_MS = 12 * 60 * 1000;

let hmacCache: HmacCache | null = null;
let hmacFetchPromise: Promise<string> | null = null;

/**
 * Generate validity timestamp rounded UP to the next 15-minute UTC boundary.
 * Format: 'YYYY-MM-DDHHmm' — e.g. current=10:37 UTC → '2026-05-201045'
 * Matches Ionic's generateTokenTimeStamp().
 */
function generateValidityTimestamp(): string {
  const now = new Date();
  const utcMin = now.getUTCMinutes();
  // Always advance to the NEXT boundary — never stay at 0 when already on a boundary
  const remainder = utcMin % 15;
  const extraMin = remainder === 0 ? 15 : 15 - remainder;
  const aligned = new Date(now.getTime() + extraMin * 60 * 1000);

  const yyyy = aligned.getUTCFullYear();
  const mm = String(aligned.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(aligned.getUTCDate()).padStart(2, '0');
  const hh = String(aligned.getUTCHours()).padStart(2, '0');
  const min = String(aligned.getUTCMinutes()).padStart(2, '0');

  // Format: YYYY-MM-DDHHmm (no colon, no space between date and time)
  return `${yyyy}-${mm}-${dd}${hh}${min}`;
}

export async function fetchHmacToken(): Promise<string> {
  const now = Date.now();

  if (hmacCache && now < hmacCache.expiresAt) {
    console.log('[ATLAS] Using cached HMAC token');
    return hmacCache.authHeader;
  }

  if (hmacFetchPromise) {
    console.log('[ATLAS] Waiting for in-flight HMAC fetch');
    return hmacFetchPromise;
  }

  hmacFetchPromise = (async () => {
    try {
      const validity = generateValidityTimestamp();
      const dataStr = apiConfig.atlasAppKey + validity;
      const data = Buffer.from(dataStr).toString('base64');

      const body = {
        data,
        identifier: apiConfig.atlasIdentifier,
        appKey: apiConfig.atlasAppKey,
      };

      console.log(`[ATLAS HMAC] --> POST ${apiConfig.atlasHmacUrl}`);
      console.log(`[ATLAS HMAC]     validity: "${validity}"`);
      console.log(`[ATLAS HMAC]     dataStr (before base64): "${dataStr}"`);
      console.log(`[ATLAS HMAC]     body:`, JSON.stringify(body));

      const response = await axios.post<HmacTokenResponse>(
        apiConfig.atlasHmacUrl,
        body,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: apiConfig.timeout,
        },
      );

      console.log(
        `[ATLAS HMAC] <-- ${response.status} raw response:`,
        JSON.stringify(response.data),
      );

      const rawToken = response.data?.token;
      if (!rawToken) {
        throw new Error(
          `HMAC response missing token field. Got: ${JSON.stringify(
            response.data,
          )}`,
        );
      }

      // Format matches Ionic: `HMAC ${atlasAppKey}:${tokenData.token}`
      const authHeader = `HMAC ${apiConfig.atlasAppKey}:${rawToken}`;
      console.log(
        `[ATLAS HMAC] Authorization header: "${authHeader.substring(
          0,
          40,
        )}..."`,
      );

      hmacCache = { authHeader, expiresAt: now + HMAC_CACHE_TTL_MS };
      return authHeader;
    } catch (err: any) {
      console.log(
        '[ATLAS HMAC] ERROR fetching token:',
        err?.response?.status,
        JSON.stringify(err?.response?.data),
      );
      console.log('[ATLAS HMAC] ERROR message:', err?.message);
      throw err;
    } finally {
      hmacFetchPromise = null;
    }
  })();

  return hmacFetchPromise;
}

const atlasClient: AxiosInstance = axios.create({
  baseURL: apiConfig.atlasBaseUrl,
  timeout: apiConfig.timeout,
  headers: { 'Content-Type': 'application/json' },
});

atlasClient.interceptors.request.use(
  async config => {
    const authHeader = await fetchHmacToken();
    if (config.headers) {
      config.headers.Authorization = authHeader;
    }
    const fullUrl = `${config.baseURL ?? apiConfig.atlasBaseUrl}${
      config.url ?? ''
    }`;
    console.log(`[ATLAS] --> ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log(
      `[ATLAS]     Authorization: "${authHeader.substring(0, 40)}..."`,
    );
    if (config.params) {
      console.log('[ATLAS]     params:', JSON.stringify(config.params));
    }
    return config;
  },
  err => Promise.reject(err),
);

atlasClient.interceptors.response.use(
  response => {
    console.log(
      `[ATLAS] <-- ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`,
    );
    return response;
  },
  async error => {
    console.log(
      `[ATLAS] <-- ERROR ${
        error.response?.status ?? 'NO_RESPONSE'
      } ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
    );
    console.log(
      '[ATLAS]     error body:',
      JSON.stringify(error.response?.data),
    );
    console.log('[ATLAS]     message:', error.message);

    // On 401, invalidate the cached token and retry once with a fresh one
    if (error.response?.status === 401 && !error.config?._hmacRetried) {
      console.log(
        '[ATLAS] 401 received — invalidating HMAC cache and retrying',
      );
      hmacCache = null;
      error.config._hmacRetried = true;
      return atlasClient.request(error.config);
    }

    return Promise.reject(error);
  },
);

export default atlasClient;
