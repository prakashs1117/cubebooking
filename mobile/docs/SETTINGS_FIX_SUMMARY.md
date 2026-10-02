# Settings Screen Fix - Complete Implementation Summary

## Issue

Settings screen was showing nothing on first login because `GET /settings` returned empty when the server had no settings data for the user.

## Root Cause

The React Native app was missing the settings seeding logic that the Ionic app has. When a new user logs in, the server's `/settings` endpoint returns an empty response `{}` because the user has never saved settings. The mobile app needs to seed the server with default values on first login, matching the Ionic app's behavior via `dataSyncService.getServerData()`.

## Solution Implemented

### Three-Layer Fix

#### Layer 1: Default Settings Constant
**File:** `src/utils/defaultSettings.ts` (NEW)

Centralized constant matching Ionic defaults:
- Barcode scanner: enabled
- All SDS sections (16): visible
- All toggles: enabled
- Language: EN
- Region: EU
- Location: defaults

#### Layer 2: AuthContext Auto-Seeding
**File:** `src/context/AuthContext.tsx` (MODIFIED)

Enhanced `fetchAndCacheSettings()` to:
1. Detect empty server response (`!settings.home`)
2. Auto-POST DEFAULT_SETTINGS if empty
3. Cache the seeded result
4. Non-blocking background task (login completes immediately)

#### Layer 3: Hook-Level Fallback
**File:** `src/hooks/useSettings.ts` (MODIFIED)

Added `select` transform to query:
- Returns DEFAULT_SETTINGS if API returns empty
- Ensures SettingsScreen never shows blank
- Handles edge case where seeding hasn't completed yet

## Implementation Details

### AuthContext Changes (Lines 44-46, 119-143)

```typescript
// Import
import { DEFAULT_SETTINGS } from '@utils/defaultSettings';

// Enhanced fetchAndCacheSettings
const fetchAndCacheSettings = async () => {
  try {
    const settings = await settingsService.getSettings();
    const isEmptySettings = !settings || !settings.home;

    if (isEmptySettings) {
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

### useSettings Hook Changes (Line 6, 22)

```typescript
// Import
import { DEFAULT_SETTINGS } from '@utils/defaultSettings';

// Enhanced query with select
const query = useQuery({
  queryKey: settingsKeys.detail(),
  queryFn: () => settingsService.getSettings(),
  staleTime: 5 * 60 * 1000,
  enabled: isAuthenticated && !isGuest,
  retry: 1,
  select: (data) => (!data || !data.home ? DEFAULT_SETTINGS : data),  // NEW
});
```

## API Call Sequence

### First Login (New User)
```
POST /user/auth/login            (credentials)
  → GET /settings                (returns empty {})
  → POST /settings               (seed with defaults)
  → React Query cache populated
  → SettingsScreen shows defaults
```

### Subsequent Logins
```
POST /user/auth/login            (credentials)
  → GET /settings                (returns seeded settings)
  → React Query cache populated
  → SettingsScreen shows existing settings
```

## Behavior

### Console Logs - First Login
```
[AuthContext] Fetching and caching settings...
[AuthContext] Server returned empty settings, seeding with defaults...
[SettingsService] Posting settings to /settings
[AuthContext] Settings seeded and cached successfully
```

### Console Logs - Existing Settings
```
[AuthContext] Fetching and caching settings...
[SettingsService] Fetching settings from /settings
[AuthContext] Settings fetched, caching to React Query: {...}
[AuthContext] Settings cached successfully
```

## Testing Checklist

- [x] Code review - implementation matches Ionic pattern
- [x] Lint check - no new lint errors
- [x] Import paths - all use absolute imports (@utils, @services, etc.)
- [x] Type safety - AppSettings type properly used
- [x] Error handling - try-catch in both contexts
- [x] Non-blocking - login flow not affected
- [x] Query caching - React Query keys consistent

## UX Impact

**Before:**
1. User logs in
2. Home screen loads
3. Navigate to Settings
4. Settings screen blank (fetching)
5. If fetch succeeds, screen displays
6. If fetch fails, error state shown

**After:**
1. User logs in
2. Home screen loads
3. Background: settings auto-seeded if needed
4. Navigate to Settings
5. Settings screen shows immediately (defaults)
6. Real data loads seamlessly in background
7. Better perceived performance

## Files Changed

| File | Type | Changes |
|------|------|---------|
| `src/utils/defaultSettings.ts` | NEW | DEFAULT_SETTINGS constant |
| `src/context/AuthContext.tsx` | MODIFIED | Import DEFAULT_SETTINGS, enhance fetchAndCacheSettings() |
| `src/hooks/useSettings.ts` | MODIFIED | Import DEFAULT_SETTINGS, add select() transform |

## Git Commit

```
feat(settings): seed default settings on first login when server returns empty
```

Commit: `d63c3778`

## Matches Ionic App

This implementation replicates the Ionic app's approach:
- `dataSyncService.getServerData()` detects empty response
- Seeds with defaults via `saveSettings()`
- Caches in local state
- Ensures UI always has data

## Documentation

- Full implementation guide: `docs/SETTINGS_SEEDING.md`
- Architecture details: `docs/SESSION_MANAGEMENT.md` (updated)
- Settings types: `src/types/settings.types.ts`

## Verification

To test end-to-end:

```bash
1. npm start
2. Create new test account / log out existing
3. Log in with fresh account
4. Watch console for seeding logs
5. Navigate to Settings screen
6. Verify all toggles visible and functional
7. Toggle one setting → should persist
8. Restart app → setting still saved
```

## Future Enhancements

- Add analytics event "settings_seeded" to track new vs returning users
- Consider syncing GPS location instead of defaults (more personalized)
- Add explicit loading indicator during seeding phase
