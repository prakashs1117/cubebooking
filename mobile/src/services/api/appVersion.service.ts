/**
 * App Version Check Service
 *
 * Fetches the minimum required version from the API and compares it
 * against the currently installed app version. If the current version
 * is below the minimum, the user must update before proceeding.
 *
 * Fails open — if the request errors for any reason (no network, server
 * down) the user is allowed into the app.
 */

import { Platform } from 'react-native';
import { apiConfig } from '@config/index';
import { ENDPOINTS } from './endpoints';
import appConfigJson from '@/config/appConfig.json';

export interface AppVersionResponse {
  minimumVersion: string;
  latestVersion: string;
  iosStoreUrl?: string;
  androidStoreUrl?: string;
}

export interface VersionCheckResult {
  needsUpdate: boolean;
  storeUrl: string;
  latestVersion: string;
}

/**
 * Returns true if `current` is strictly older than `minimum`.
 * Handles standard semver strings: "1.2.3"
 */
export function isVersionOutdated(current: string, minimum: string): boolean {
  const parse = (v: string) =>
    v.split('.').map(n => Math.max(0, parseInt(n, 10) || 0));

  const [cMaj, cMin, cPat] = parse(current);
  const [mMaj, mMin, mPat] = parse(minimum);

  if (cMaj !== mMaj) return cMaj < mMaj;
  if (cMin !== mMin) return cMin < mMin;
  return cPat < mPat;
}

export async function checkAppVersion(): Promise<VersionCheckResult | null> {
  // DEV-only shortcut: flip "simulateForceUpdate" to true in appConfig.json to test the modal
  const devOverrides = (appConfigJson as any).devOverrides;
  if (__DEV__ && devOverrides?.simulateForceUpdate === true) {
    return {
      needsUpdate: true,
      storeUrl:
        Platform.OS === 'ios'
          ? appConfigJson.app.storeUrls.ios
          : appConfigJson.app.storeUrls.android,
      latestVersion: '99.0.0',
    };
  }

  try {
    const url = `${apiConfig.baseUrl}${ENDPOINTS.VERSION.CHECK}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const data: AppVersionResponse = await response.json();
    const currentVersion: string = appConfigJson.app.version;

    const needsUpdate = isVersionOutdated(currentVersion, data.minimumVersion);

    const storeUrl =
      Platform.OS === 'ios'
        ? data.iosStoreUrl ?? appConfigJson.app.storeUrls.ios
        : data.androidStoreUrl ?? appConfigJson.app.storeUrls.android;

    return { needsUpdate, storeUrl, latestVersion: data.latestVersion };
  } catch {
    // Fail open — never block the user due to a network/server error
    return null;
  }
}
