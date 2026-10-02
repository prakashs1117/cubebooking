import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsService } from '@services/api/settings.service';

export type DeviceRegion = 'US' | 'NON_US' | 'UNKNOWN';

const REGION_CACHE_KEY = '@device_region';
const REGION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const GUEST_LOCATION_KEY = '@guest_location';

interface RegionCache {
  region: DeviceRegion;
  timestamp: number;
}

interface GeoResult {
  countryCode: string;
  city: string;
}

export interface GuestLocation {
  lat: number;
  long: number;
  countryCode: string;
  city: string;
}

async function loadCachedRegion(): Promise<DeviceRegion | null> {
  try {
    const raw = await AsyncStorage.getItem(REGION_CACHE_KEY);
    if (!raw) return null;
    const cached: RegionCache = JSON.parse(raw);
    if (Date.now() - cached.timestamp < REGION_CACHE_TTL) {
      return cached.region;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveRegionCache(region: DeviceRegion): Promise<void> {
  try {
    const entry: RegionCache = { region, timestamp: Date.now() };
    await AsyncStorage.setItem(REGION_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // silently ignore
  }
}

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    // iOS permission is requested automatically by Geolocation.getCurrentPosition
    return true;
  }
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access',
        message:
          'My M Safety needs your location to show region-appropriate safety data.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
}

async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MyMSafety-App/1.0' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const address = data?.address ?? {};
    return {
      countryCode: (address.country_code ?? '').toUpperCase(),
      city: address.city ?? address.town ?? address.county ?? address.state ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Detects whether the device is physically in the US or outside.
 * Result is cached in AsyncStorage for 24 hours to avoid repeated GPS requests.
 */
export async function getDeviceRegion(): Promise<DeviceRegion> {
  const cached = await loadCachedRegion();
  if (cached) return cached;

  const granted = await requestLocationPermission();
  if (!granted) {
    return 'UNKNOWN';
  }

  try {
    const { latitude, longitude } = await getCurrentPosition();
    const geo = await reverseGeocode(latitude, longitude);
    const region: DeviceRegion =
      geo?.countryCode === 'US' ? 'US' : geo?.countryCode ? 'NON_US' : 'UNKNOWN';
    await saveRegionCache(region);
    return region;
  } catch {
    return 'UNKNOWN';
  }
}

/** Clears the cached region — useful for testing or forced refresh. */
export async function clearRegionCache(): Promise<void> {
  await AsyncStorage.removeItem(REGION_CACHE_KEY);
}

/**
 * Requests location permission, gets current position, reverse-geocodes it,
 * then POSTs the updated location block to the settings API.
 * Non-throwing — all errors are swallowed since this is non-critical.
 */
export async function syncLocationToSettings(): Promise<void> {
  try {
    const granted = await requestLocationPermission();
    const currentSettings = await settingsService.getSettings();

    if (!granted) {
      await settingsService.updateSettings({
        ...currentSettings,
        location: {
          askLocationAgain: true,
          locationUpdate: false,
          error: 1,
          countryCode: '',
          city: '',
          long: 0,
          lat: 0,
        },
      });
      return;
    }

    const { latitude, longitude } = await getCurrentPosition();
    const geo = await reverseGeocode(latitude, longitude);

    await settingsService.updateSettings({
      ...currentSettings,
      location: {
        askLocationAgain: false,
        locationUpdate: true,
        error: 0,
        countryCode: geo?.countryCode ?? '',
        city: geo?.city ?? '',
        long: longitude,
        lat: latitude,
      },
    });
  } catch {
    // Non-critical — location sync failure should never block the user
  }
}

/**
 * For guest users (no auth token / no settings API access).
 * Requests permission once and stores result in AsyncStorage.
 * Skips if already stored from a previous guest session.
 */
export async function syncGuestLocation(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(GUEST_LOCATION_KEY);
    if (existing) return;

    const granted = await requestLocationPermission();
    if (!granted) return;

    const { latitude, longitude } = await getCurrentPosition();
    const geo = await reverseGeocode(latitude, longitude);

    const entry: GuestLocation = {
      lat: latitude,
      long: longitude,
      countryCode: geo?.countryCode ?? '',
      city: geo?.city ?? '',
    };
    await AsyncStorage.setItem(GUEST_LOCATION_KEY, JSON.stringify(entry));
  } catch {
    // Non-critical
  }
}

/** Returns the stored guest location, or null if not yet captured. */
export async function getGuestLocation(): Promise<GuestLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
