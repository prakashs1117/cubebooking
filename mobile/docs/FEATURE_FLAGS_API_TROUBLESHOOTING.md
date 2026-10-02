# Feature Flags API Troubleshooting Guide

## Current Status

✅ **API Sync Disabled** - App is using local `featureFlagNew.json` file

The API integration has been temporarily disabled to allow development to continue while the backend API response format is being fixed.

## Configuration

In `src/config/featureFlagsSync.config.ts`:

```typescript
AUTO_SYNC_ENABLED: false, // ⚠️ Currently disabled - using local JSON
```

## What Happened

The API response format doesn't match the expected structure. The app expects:

```json
{
  "flags": [
    {
      "id": "...",
      "key": "home_carousel",
      "name": "Home Carousel",
      "enabled": true,
      ...
    }
  ],
  "version": "1.0.0",
  "lastUpdated": "2026-03-05T10:00:00.000Z"
}
```

## How to Debug API Response

### Step 1: Enable API Sync

In `src/config/featureFlagsSync.config.ts`:

```typescript
AUTO_SYNC_ENABLED: true, // Enable to test API
```

### Step 2: Check Console Logs

After enabling, watch Metro bundler console for detailed logs:

```
🌐 Feature flags API response received: {
  status: 200,
  hasData: true,
  hasFlags: false,  // ⚠️ This should be true
  flagsCount: 0,
  dataKeys: ['data', 'message']  // Shows what keys are in response
}
```

### Step 3: Identify the Issue

Common issues:

#### Issue 1: Wrong Response Structure

**Problem**: API returns `{ data: { flags: [...] } }` instead of `{ flags: [...] }`

**Solution**: Backend should return flat structure:

```json
{
  "flags": [...],
  "version": "1.0.0"
}
```

#### Issue 2: Missing `flags` Property

**Problem**: Response is `{ features: [...] }` or `{ featureFlags: [...] }`

**Solution**: Rename property to `flags` in backend

#### Issue 3: Nested Data

**Problem**: Response is `{ success: true, data: { flags: [...] } }`

**Solution**: Either:

- Backend returns flat structure, OR
- Update `featureFlags.service.ts` to extract from nested structure:
  ```typescript
  return response.data.data; // If nested in "data"
  ```

### Step 4: Test with curl

Test your API directly:

```bash
curl -X GET http://localhost:3000/api/v1/feature-flags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:

```json
{
  "flags": [
    {
      "id": "cmmc1q4ui0001v6c0a1b2c3d4",
      "key": "home_carousel",
      "name": "Home Carousel",
      "description": "Show image carousel on home screen",
      "category": "ui",
      "type": "boolean",
      "enabled": true,
      "defaultValue": true,
      "targeting": {
        "environments": ["production", "staging", "development"],
        "rolloutPercentage": 100
      },
      "config": null,
      "metadata": {
        "tags": ["ui", "home", "carousel"],
        "owner": "frontend-team",
        "priority": "high"
      },
      "createdAt": "2026-03-04T13:01:54.000Z",
      "updatedAt": "2026-03-04T13:11:58.000Z"
    }
  ],
  "version": "1.0.0",
  "lastUpdated": "2026-03-05T10:00:00.000Z"
}
```

## Quick Fixes

### Fix 1: Update Backend Response Format

Make sure your backend returns the exact structure shown above.

### Fix 2: Adapt Frontend to Backend Format

If you can't change backend, update `src/services/api/featureFlags.service.ts`:

```typescript
export const fetchFeatureFlags = async (): Promise<FeatureFlagsAPIResponse> => {
  try {
    const response = await apiClient.get<any>('/feature-flags');

    // Adapt to your backend format
    let flags = response.data.flags; // Standard format

    // If nested in data.data
    if (response.data.data?.flags) {
      flags = response.data.data.flags;
    }

    // If different property name
    if (response.data.featureFlags) {
      flags = response.data.featureFlags;
    }

    return {
      flags: flags || [],
      version: response.data.version,
      lastUpdated: response.data.lastUpdated,
    };
  } catch (error) {
    console.error('❌ Error fetching feature flags:', error);
    throw error;
  }
};
```

## Current Behavior

With `AUTO_SYNC_ENABLED: false`:

- ✅ App loads flags from `src/data/featureFlagNew.json`
- ✅ All features work normally
- ✅ No API calls made
- ✅ No network errors
- ✅ Instant loading

## Re-enabling API Sync

Once your backend API is fixed:

### Step 1: Verify API Response

```bash
curl http://localhost:3000/api/v1/feature-flags
```

Should return:

```json
{
  "flags": [ ... array of flags ... ]
}
```

### Step 2: Enable Sync

In `src/config/featureFlagsSync.config.ts`:

```typescript
AUTO_SYNC_ENABLED: true,
```

### Step 3: Test in App

1. Restart app
2. Login
3. Check console for: `✅ Feature flags synced from API: { count: 39, timestamp: '...' }`

### Step 4: Test Real-time Update

1. Change a flag in backend
2. Wait 60 seconds
3. See change in app

## Common Error Messages

### Error: "API response is empty"

**Cause**: Backend returns null or undefined
**Fix**: Ensure backend returns valid JSON

### Error: "API response missing 'flags' property"

**Cause**: Response doesn't have `flags` key
**Fix**: Add `flags` array to response

### Error: "API response 'flags' is not an array"

**Cause**: `flags` is an object or string
**Fix**: Make `flags` an array

### Error: "401 Unauthorized"

**Cause**: Missing or invalid auth token
**Fix**: Check authentication in API client

### Error: "Network request failed"

**Cause**: Backend not running or wrong URL
**Fix**: Start backend and verify URL in `.env`

## Development Workflow

### Current (API Disabled)

1. Edit `src/data/featureFlagNew.json`
2. Restart app
3. Changes appear immediately

### Future (API Enabled)

1. Edit flags in backend
2. Wait 60 seconds (or force refresh)
3. Changes appear automatically

## Support

If you need help debugging:

1. Set `ENABLE_DEV_LOGS: true` in config
2. Enable API sync
3. Copy console logs
4. Share the logs showing:
   - API request URL
   - Response status
   - Response data structure
   - Error messages

## Quick Reference

| Configuration              | Effect                        |
| -------------------------- | ----------------------------- |
| `AUTO_SYNC_ENABLED: false` | Use local JSON only (current) |
| `AUTO_SYNC_ENABLED: true`  | Sync from API every 60s       |
| `POLLING_INTERVAL: 60000`  | Check API every 1 minute      |
| `ENABLE_DEV_LOGS: true`    | Show detailed logs            |

## Summary

🎯 **Current Status**: Using local JSON file (safe mode)
📝 **Action Needed**: Fix backend API response format
🔧 **Next Step**: Test API with curl, then enable sync

The app is fully functional with local data. Enable API sync once the backend is ready! 🚀
