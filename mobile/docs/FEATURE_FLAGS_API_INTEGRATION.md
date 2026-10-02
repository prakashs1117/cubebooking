# Feature Flags API Integration

Complete guide for the Feature Flags API integration with automatic polling and real-time updates.

## Overview

The app now automatically syncs feature flags from your backend API at regular intervals. When you change feature flags in the backend, they will automatically reflect in the app within the configured polling interval.

## API Endpoint

```
http://localhost:3000/api/v1/feature-flags
```

Configured in `.env`:

```env
API_BASE_URL=http://localhost:3000/api/v1
```

## Features

✅ **Automatic Polling** - Fetches updated flags every 60 seconds (configurable)
✅ **Real-time Updates** - Changes in backend automatically reflect in the app
✅ **Offline Support** - Uses cached flags when offline
✅ **Background Smart Polling** - Only polls when app is in foreground (saves battery)
✅ **Authentication-aware** - Only syncs when user is logged in
✅ **Network-aware** - Automatically pauses when offline
✅ **Retry Logic** - Handles temporary network failures
✅ **Zero Impact** - Falls back to local JSON if API is unavailable

## How It Works

### 1. Initial Load

When the app starts, it loads feature flags from `src/data/featureFlagNew.json`.

### 2. API Sync

Once the user is authenticated, the app starts polling the API:

```
GET http://localhost:3000/api/v1/feature-flags
```

### 3. Automatic Updates

Every 60 seconds (configurable), the app:

1. Fetches the latest flags from the API
2. Updates the local store with new values
3. All components automatically re-render with new flag values

### 4. Real-time Reflection

When you change a flag in the backend (e.g., disable a feature), the app will:

- Fetch the updated flag within 60 seconds
- Update the UI automatically
- No app restart required!

## Configuration

### Polling Interval

Edit `src/config/featureFlagsSync.config.ts`:

```typescript
export const FEATURE_FLAGS_SYNC_CONFIG = {
  // Change this to adjust polling frequency
  POLLING_INTERVAL: 60000, // 60 seconds (1 minute)

  // Options:
  // 30000  - 30 seconds (more frequent, more battery usage)
  // 60000  - 1 minute (balanced) ⭐ Recommended
  // 120000 - 2 minutes (less frequent)
  // 300000 - 5 minutes (battery efficient)
};
```

### Enable/Disable Automatic Sync

```typescript
export const FEATURE_FLAGS_SYNC_CONFIG = {
  AUTO_SYNC_ENABLED: true, // Set to false to disable
};
```

### Background Polling

```typescript
export const FEATURE_FLAGS_SYNC_CONFIG = {
  FOREGROUND_ONLY: true, // Set to false to poll even when app is backgrounded
};
```

## API Response Format

Your backend API should return:

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
    // ... more flags
  ],
  "version": "1.0.0",
  "lastUpdated": "2026-03-05T10:00:00.000Z"
}
```

## Usage in Components

### Using the Hook

```typescript
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

function MyComponent() {
  // This will automatically update when flags change from API
  const isFeatureEnabled = useFeatureFlagsStore(state =>
    state.isFeatureEnabled('home_carousel'),
  );

  return <View>{isFeatureEnabled && <HomeCarousel />}</View>;
}
```

### Getting Flag Details

```typescript
const flag = useFeatureFlagsStore(state =>
  state.getFeatureFlag('home_carousel'),
);

console.log('Flag:', flag?.name, 'Enabled:', flag?.enabled);
```

### Manual Refresh

```typescript
import { useFeatureFlagsSync } from '@hooks/useFeatureFlagsSync';

function MyComponent() {
  const { refetch, isRefetching } = useFeatureFlagsSync();

  const handleRefresh = () => {
    refetch(); // Manually fetch latest flags
  };

  return (
    <Button onPress={handleRefresh} disabled={isRefetching}>
      {isRefetching ? 'Refreshing...' : 'Refresh Flags'}
    </Button>
  );
}
```

## Testing the Integration

### 1. Start Your Backend

Ensure your backend API is running on `http://localhost:3000`.

### 2. Start the App

```bash
npm start
npm run ios  # or npm run android
```

### 3. Login

The feature flags sync only starts after authentication.

### 4. Change a Flag in Backend

In your backend admin panel or database:

- Change `home_carousel.enabled` from `true` to `false`

### 5. Wait for Sync (max 60 seconds)

The app will automatically fetch the updated flag and hide the home carousel.

### 6. Monitor Logs

In Metro bundler console, you'll see:

```
✅ Feature flags synced from API: {
  count: 39,
  timestamp: '2026-03-05T10:15:30.000Z'
}
```

## Monitoring

### Check Sync Status

```typescript
import { useFeatureFlagsSync } from '@hooks/useFeatureFlagsSync';

function StatusComponent() {
  const { isRefetching, dataUpdatedAt, isError, error } = useFeatureFlagsSync();

  return (
    <View>
      <Text>Status: {isRefetching ? 'Syncing...' : 'Up to date'}</Text>
      <Text>Last updated: {new Date(dataUpdatedAt).toLocaleString()}</Text>
      {isError && <Text>Error: {error.message}</Text>}
    </View>
  );
}
```

### Console Logs

In development mode, the app logs:

- ✅ Feature flags synced from API
- 🚩 Feature flag changes
- ❌ Sync errors (if any)

## Offline Behavior

### When Offline

- Uses cached flags from last successful sync
- Stops polling to save battery
- No error messages shown to user

### When Back Online

- Automatically resumes polling
- Fetches latest flags immediately
- Updates UI with new values

## Backward Compatibility

The app supports both old and new key formats:

```typescript
// Old format (still works)
state.isFeatureEnabled('ENABLE_HOME_CAROUSEL');

// New format (preferred)
state.isFeatureEnabled('home_carousel');
```

Both map to the same flag in the backend.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Native App                    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         RootNavigator.tsx                   │    │
│  │  • Initializes useFeatureFlagsSync hook     │    │
│  │  • Starts polling after authentication      │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                  │
│  ┌────────────────▼───────────────────────────┐    │
│  │      useFeatureFlagsSync Hook               │    │
│  │  • React Query with refetchInterval         │    │
│  │  • Polls every 60 seconds                   │    │
│  │  • Network-aware, auth-aware                │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                  │
│  ┌────────────────▼───────────────────────────┐    │
│  │   Feature Flags API Service                 │    │
│  │  • Axios client with interceptors           │    │
│  │  • GET /api/v1/feature-flags                │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                  │
│  ┌────────────────▼───────────────────────────┐    │
│  │      useFeatureFlagsStore (Zustand)         │    │
│  │  • Updates flags in store                   │    │
│  │  • Persists to AsyncStorage                 │    │
│  │  • Notifies all subscribers                 │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                  │
│  ┌────────────────▼───────────────────────────┐    │
│  │          All Components                      │    │
│  │  • Automatically re-render                   │    │
│  │  • Use updated flag values                   │    │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
                     ▲
                     │ HTTP GET (every 60s)
                     │
┌────────────────────┴─────────────────────────────────┐
│              Backend API Server                       │
│  http://localhost:3000/api/v1/feature-flags          │
│                                                       │
│  • Returns current feature flags                     │
│  • Updates reflected in app within 60s               │
└───────────────────────────────────────────────────────┘
```

## Troubleshooting

### Flags Not Updating

1. **Check API is running**: `curl http://localhost:3000/api/v1/feature-flags`
2. **Check authentication**: Sync only works when logged in
3. **Check network**: Ensure device/simulator has network access
4. **Check logs**: Look for "Feature flags synced" messages
5. **Check polling interval**: Wait at least 60 seconds for update

### API Errors

```typescript
// Check error details
const { isError, error } = useFeatureFlagsSync();

if (isError) {
  console.error('Feature flags sync error:', error);
}
```

### Performance Issues

If polling affects performance:

1. Increase `POLLING_INTERVAL` to 120000 (2 minutes)
2. Enable `FOREGROUND_ONLY` to avoid background polling
3. Disable auto-sync: `AUTO_SYNC_ENABLED: false`

## Best Practices

1. **Set Reasonable Intervals**: 1-5 minutes is usually sufficient
2. **Use Foreground Only**: Saves battery, most flags don't need instant updates
3. **Monitor API Response Time**: Keep response under 500ms
4. **Cache Effectively**: The app caches flags for 24 hours
5. **Test Offline Scenarios**: Ensure app works without API
6. **Version Your API**: Use the `version` field for compatibility checks

## Security Considerations

1. **Authentication Required**: API endpoints should require valid auth tokens
2. **Rate Limiting**: Implement rate limiting on backend (e.g., 100 requests/minute)
3. **HTTPS in Production**: Always use HTTPS for API calls
4. **Validate Responses**: Backend should validate flag structures
5. **Rollback Support**: Keep previous versions for quick rollback

## Production Checklist

- [ ] Update `API_BASE_URL` in `.env` to production URL
- [ ] Ensure backend API is secured with authentication
- [ ] Set appropriate `POLLING_INTERVAL` (60-300 seconds recommended)
- [ ] Enable `FOREGROUND_ONLY` to save battery
- [ ] Test offline behavior thoroughly
- [ ] Monitor API response times
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Document feature flags in backend
- [ ] Create admin panel for managing flags
- [ ] Test with slow network conditions

## Summary

🎉 **Feature Flags API Integration Complete!**

Your app now:

- ✅ Automatically fetches feature flags from backend
- ✅ Updates UI in real-time (within 60 seconds)
- ✅ Works offline with cached flags
- ✅ Saves battery with smart polling
- ✅ Requires zero manual intervention

Change a flag in your backend, and within 60 seconds, the change will appear in your app! 🚀
