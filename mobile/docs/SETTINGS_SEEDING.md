# Settings Seeding - Implementation Guide

## Problem

The Settings screen was showing nothing on first login because `GET /settings` returns an empty response when the server has no settings data for a new user. Unlike the Ionic app which automatically seeds settings via `dataSyncService.getServerData()`, the React Native app had no such mechanism.

## Solution

Settings are now automatically seeded on first login with sensible defaults, matching the Ionic app behavior.

### Implementation

#### 1. Default Settings Constant (`src/utils/defaultSettings.ts`)

```typescript
export const DEFAULT_SETTINGS: AppSettings = {
  home: { barcodeScanner: true },
  articleDetails: { safetyDataSheet: true, ehs: true, transportInformation: true },
  dataPrivacy: { favourites: true, customerData: true },
  sections: Array(16).fill(true),  // All 16 SDS sections visible
  location: {
    askLocationAgain: false,
    locationUpdate: true,
    error: 0,
    countryCode: '',
    city: '',
    lat: 0,
    long: 0,
  },
  validityAreaLanguage: { rating: 'PUBLIC', validityArea: 'EU', language: 'EN' },
  appLanguage: 'en',
};
```

#### 2. AuthContext Enhancement (`src/context/AuthContext.tsx`)

`fetchAndCacheSettings()` now detects empty responses and seeds the server:

```typescript
const fetchAndCacheSettings = async () => {
  try {
    const settings = await settingsService.getSettings();
    const isEmptySettings = !settings || !settings.home;

    if (isEmptySettings) {
      // Server has no settings — seed with defaults
      const seeded = await settingsService.updateSettings(DEFAULT_SETTINGS);
      queryClient.setQueryData(settingsKeys.detail(), seeded);
    } else {
      queryClient.setQueryData(settingsKeys.detail(), settings);
    }
  } catch (error) {
    console.warn('[AuthContext] Failed to fetch settings:', error);
  }
};
```

**Flow:**
1. Login successful → token saved
2. `fetchAndCacheSettings()` called (non-blocking background task)
3. `GET /settings` returns empty
4. Detects empty → `POST /settings` with defaults
5. Server returns seeded settings
6. Caches result in React Query

#### 3. useSettings Hook Fallback (`src/hooks/useSettings.ts`)

Added `select` transform to always return defaults if API returns empty:

```typescript
const query = useQuery({
  queryKey: settingsKeys.detail(),
  queryFn: () => settingsService.getSettings(),
  select: (data) => (!data || !data.home ? DEFAULT_SETTINGS : data),
  // ... other config
});
```

**Purpose:** Even if seeding hasn't completed, the Settings screen immediately shows default values instead of blank/loading state.

## Behavior

### First Login (New User)

```
1. User logs in → POST /user/auth/login
   ↓
2. Token saved → AuthContext sets isAuthenticated=true
   ↓
3. Navigation: User sees Home screen immediately
   ↓
4. Background: fetchAndCacheSettings() runs
   - GET /settings returns {} (empty)
   - Detects empty, calls POST /settings with defaults
   - Server returns seeded settings object
   - Caches in React Query
   ↓
5. User navigates to Settings
   - useSettings hook serves cached seeded data
   - All toggles visible and functional
   - Settings persist on toggle (mutations work)
```

### Subsequent Logins

```
1. User logs in
   ↓
2. fetchAndCacheSettings() runs
   - GET /settings returns full settings object (from previous login)
   - Caches directly
   ↓
3. Settings screen shows existing settings
```

### App Restart (Logged-in Session)

```
1. App cold start → loadStoredAuth() runs
   ↓
2. Token found in AsyncStorage
   ↓
3. AuthContext sets isAuthenticated=true
   ↓
4. Background: fetchAndCacheSettings() runs same flow
   ↓
5. Settings screen shows cached settings
```

## Console Logs for Debugging

**First login (empty server):**
```
[AuthContext] Fetching and caching settings...
[AuthContext] Server returned empty settings, seeding with defaults...
[SettingsService] Posting settings to /settings
[AuthContext] Settings seeded and cached successfully
```

**Existing settings (non-empty server):**
```
[AuthContext] Fetching and caching settings...
[SettingsService] Fetching settings from /settings
[AuthContext] Settings fetched, caching to React Query: {...}
[AuthContext] Settings cached successfully
```

## API Calls Sequence

### New User First Login

```
POST   /user/auth/login          ← credentials
GET    /settings                 ← empty response
POST   /settings                 ← seed defaults
GET    /settings                 ← (optional re-fetch)
```

### Subsequent Changes

```
POST   /user/auth/login          ← credentials
GET    /settings                 ← returns existing settings
POST   /settings                 ← when user toggles
```

## Related Files

- `src/utils/defaultSettings.ts` — DEFAULT_SETTINGS constant
- `src/context/AuthContext.tsx` — fetchAndCacheSettings() (lines 119-143)
- `src/hooks/useSettings.ts` — useSettings hook with select (line 22)
- `src/services/api/settings.service.ts` — getSettings() / updateSettings()

## Testing Checklist

- [ ] Fresh account login → Settings screen shows all toggles
- [ ] Toggle a setting → persists and shows success toast
- [ ] Restart app → settings still reflect last saved state
- [ ] Check console logs for seeding flow on first login
- [ ] Network error during seeding → doesn't break login flow
- [ ] Logout and re-login → settings fetch completes quickly

## Known Limitations

- First-time seeding is non-blocking, so if Settings screen is opened immediately after login (before seeding completes), it may briefly show defaults then update. This is acceptable UX.
- If both seeding POST and a user toggle mutation happen simultaneously, the optimistic update from the toggle takes precedence (expected behavior).

## Future Enhancements

- Add explicit loading state hint while seeding is in progress
- Add analytics event for "settings_seeded" to track new vs returning users
- Consider syncing location data (GPS coordinates) instead of defaults
