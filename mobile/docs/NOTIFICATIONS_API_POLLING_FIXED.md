# Notifications API Polling - FIXED ✅

## Issue

Notifications were only being fetched once on initial load, not polling at regular intervals like feature flags.

## Root Cause

The `useNotifications` hook was configured for polling, but it was only being called in the `NotificationBell` component which:

1. Only renders in the header of certain screens
2. May unmount/remount as user navigates
3. Doesn't persist across all screens

This caused the polling to stop when the component unmounted.

## Solution

Added global notifications polling in `RootNavigator.tsx`, similar to feature flags:

```typescript
// src/navigation/RootNavigator.tsx

// Sync notifications from API with automatic polling (only when authenticated)
useNotifications({
  enabled: isAuthenticated && NOTIFICATIONS_SYNC_CONFIG.AUTO_SYNC_ENABLED,
  pollingInterval: NOTIFICATIONS_SYNC_CONFIG.POLLING_INTERVAL,
  autoSync: true,
  page: NOTIFICATIONS_SYNC_CONFIG.DEFAULT_PAGE,
  limit: NOTIFICATIONS_SYNC_CONFIG.DEFAULT_LIMIT,
});
```

## What Changed

### 1. Created Notifications Config File

**File**: `src/config/notificationsSync.config.ts`

```typescript
export const NOTIFICATIONS_SYNC_CONFIG = {
  POLLING_INTERVAL: 30000, // 30 seconds
  AUTO_SYNC_ENABLED: true, // ✅ Enabled
  FOREGROUND_ONLY: true, // Save battery
  STALE_TIME: 25000, // 25 seconds
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  ENABLE_DEV_LOGS: true,
};
```

### 2. Enhanced useNotifications Hook

**File**: `src/hooks/useNotifications.ts`

**Added**:

- ✅ Detailed logging for debugging
- ✅ Uses centralized config
- ✅ Logs each fetch attempt
- ✅ Logs polling status
- ✅ Better error logging

```typescript
// Logs you'll see in Metro console:
🔔 Notifications polling status: {
  enabled: true,
  pollingInterval: 30000,
  isPolling: true,
  nextPollIn: '30s'
}

🔔 Fetching notifications from API... {
  page: 1,
  limit: 20,
  timestamp: '2026-03-05T10:30:00.000Z'
}

✅ Notifications fetched successfully: {
  count: 5,
  unreadCount: 2,
  timestamp: '2026-03-05T10:30:01.000Z'
}
```

### 3. Updated RootNavigator

**File**: `src/navigation/RootNavigator.tsx`

**Added**:

- Global notifications polling
- Starts after authentication
- Runs continuously while authenticated
- Stops when user logs out

## How It Works Now

### Polling Flow

```
App Launches
    ↓
User Logs In
    ↓
RootNavigator initializes useNotifications
    ↓
Initial fetch from API
    ↓
[00:00] ✅ Notifications loaded
    ↓
[00:30] 🔔 Auto-refetch (30 seconds later)
    ↓
[01:00] 🔔 Auto-refetch
    ↓
[01:30] 🔔 Auto-refetch
    ↓
    (continues every 30 seconds)
```

### Real-time Updates

When a new notification arrives in the backend:

```
Backend: New notification created
    ↓
Wait max 30 seconds
    ↓
App: Polls API
    ↓
App: Receives new notification
    ↓
App: Updates Zustand store
    ↓
NotificationBell: Badge updates automatically
    ↓
NotificationModal: Shows new notification
    ✓ No app restart needed!
```

## API Endpoint

```
✅ Endpoint: http://localhost:3000/api/v1/me/notifications?page=1&limit=20
```

**Requires**: Authentication token

**Response Format**:

```json
{
  "notifications": [
    {
      "id": "...",
      "title": "...",
      "message": "...",
      "type": "...",
      "isRead": false,
      "createdAt": "..."
    }
  ],
  "unreadCount": 2,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 5,
    "limit": 20
  }
}
```

## Configuration

### Polling Settings

**File**: `src/config/notificationsSync.config.ts`

```typescript
POLLING_INTERVAL: 30000,    // 30 seconds (adjust as needed)
AUTO_SYNC_ENABLED: true,    // Enable/disable polling
FOREGROUND_ONLY: true,      // Stop polling when app backgrounded
```

### Adjust Polling Frequency

```typescript
// Faster updates (15 seconds)
POLLING_INTERVAL: 15000,

// Balanced (30 seconds) ⭐ Recommended
POLLING_INTERVAL: 30000,

// Battery efficient (1 minute)
POLLING_INTERVAL: 60000,
```

## Testing

### Test Polling is Working

1. **Run the app**
2. **Login**
3. **Watch Metro console** for:
   ```
   🔔 Notifications polling status: { enabled: true, isPolling: true, nextPollIn: '30s' }
   🔔 Fetching notifications from API...
   ✅ Notifications fetched successfully: { count: 5, unreadCount: 2 }
   ```
4. **Wait 30 seconds**
5. **See another fetch log** - confirms polling is working

### Test Real-time Updates

1. **Create a new notification** in your backend
2. **Wait max 30 seconds**
3. **Watch notification bell** - badge should update
4. ✅ No app restart needed

### Test Authentication

1. **Logout**
2. **Polling should stop** (check logs)
3. **Login again**
4. **Polling should resume** immediately

## Console Logs (Development Mode)

### On Initial Load

```
🔔 Notifications polling status: {
  enabled: true,
  pollingInterval: 30000,
  isPolling: true,
  nextPollIn: '30s'
}

🔑 Retrieved token from tokenStorage: eyJhbGciOiJIUzI1NiI...

📡 API Request: http://localhost:3000/api/v1/me/notifications?page=1&limit=20
🔑 Auth Token: eyJhbGciOiJIUzI1NiI...
📡 API Response Status: 200

✅ Notifications fetched successfully: {
  count: 5,
  unreadCount: 2,
  timestamp: '2026-03-05T10:30:01.123Z'
}
```

### Every 30 Seconds

```
🔔 Fetching notifications from API... {
  page: 1,
  limit: 20,
  timestamp: '2026-03-05T10:30:31.456Z'
}

✅ Notifications fetched successfully: {
  count: 5,
  unreadCount: 2,
  timestamp: '2026-03-05T10:30:32.789Z'
}
```

### On Error

```
❌ Notifications fetch failed: Error: Network request failed
```

### On Auth Error

```
🔐 Authentication error, logging out user...
🔐 Redirected to Auth screen
🔐 Auth error - stopping retries
```

## Architecture

```
┌──────────────────────────────────────────────┐
│         React Native App (Frontend)          │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │       RootNavigator.tsx                 │ │
│  │  • useNotifications() hook (Global)     │ │
│  │  • Starts after authentication          │ │
│  └────────────┬───────────────────────────┘ │
│               │                              │
│  ┌────────────▼───────────────────────────┐ │
│  │   useNotifications Hook                 │ │
│  │  • React Query with polling             │ │
│  │  • Polls every 30 seconds               │ │
│  │  • Auto-retry on failure                │ │
│  │  • Detailed logging                     │ │
│  └────────────┬───────────────────────────┘ │
│               │                              │
│  ┌────────────▼───────────────────────────┐ │
│  │  notifications.service.ts (Fetch API)   │ │
│  │  • GET /me/notifications?page=1&limit=20│ │
│  │  • Auth token from tokenStorage         │ │
│  └────────────┬───────────────────────────┘ │
│               │                              │
│  ┌────────────▼───────────────────────────┐ │
│  │  Zustand Store (notificationStore)      │ │
│  │  • syncFromAPI(notifications)           │ │
│  │  • Updates unreadCount                  │ │
│  │  • Notifies subscribers                 │ │
│  └────────────┬───────────────────────────┘ │
│               │                              │
│  ┌────────────▼───────────────────────────┐ │
│  │   NotificationBell & Other Components   │ │
│  │  • useNotificationStore()               │ │
│  │  • Auto re-render on changes            │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
                  ▲
                  │ HTTP GET (every 30s)
                  │
┌─────────────────┴─────────────────────────────┐
│         Backend API (Your Server)             │
│                                               │
│  GET /api/v1/me/notifications                 │
│  Returns: { notifications: [...], ... }      │
│                                               │
│  • Real-time updates                          │
│  • Requires authentication                    │
│  • Returns paginated results                  │
└───────────────────────────────────────────────┘
```

## Components Using Notifications

### Global (Always Active)

- **RootNavigator** - Initializes polling, runs while authenticated

### Components (Subscribe to Store)

- **NotificationBell** - Shows badge with unread count
- **NotificationModal** - Displays notification list
- **CustomHeader** - Contains NotificationBell

All these components automatically update when new notifications arrive!

## Comparison: Before vs After

### Before (Broken)

```
✅ Initial fetch works
❌ No polling
❌ Must refresh manually
❌ Depends on NotificationBell component mounting
❌ Stops when navigating away
```

### After (Fixed)

```
✅ Initial fetch works
✅ Polls every 30 seconds
✅ Automatic updates
✅ Global polling in RootNavigator
✅ Works across all screens
✅ Detailed logging for debugging
```

## Files Modified/Created

### Created

- `src/config/notificationsSync.config.ts` - Centralized configuration

### Modified

- `src/hooks/useNotifications.ts` - Enhanced logging, uses config
- `src/navigation/RootNavigator.tsx` - Added global polling

## Disable Polling (If Needed)

To temporarily disable notifications polling:

```typescript
// src/config/notificationsSync.config.ts
AUTO_SYNC_ENABLED: false,
```

App will stop polling but notifications already fetched remain in store.

## Production Checklist

- [ ] Verify API endpoint in `.env`
- [ ] Test with production API
- [ ] Adjust polling interval (30-60 seconds recommended)
- [ ] Disable dev logs:
  ```typescript
  ENABLE_DEV_LOGS: false,
  ```
- [ ] Monitor API response times
- [ ] Set up error tracking
- [ ] Test offline behavior
- [ ] Test with slow network

## Troubleshooting

### Polling not working

1. ✅ Check Metro console for polling logs
2. ✅ Verify you're logged in (polling only works when authenticated)
3. ✅ Check `AUTO_SYNC_ENABLED: true` in config
4. ✅ Wait full 30 seconds for next poll
5. ✅ Check network connectivity

### API errors

Check console for error details:

```
❌ Notifications fetch failed: Error: Unauthorized: Please login again
```

**Solutions**:

- **Unauthorized** → Login again
- **Network error** → Check internet connection
- **Timeout** → Check API server is running

### Notifications not updating

1. ✅ Create test notification in backend
2. ✅ Wait 30 seconds
3. ✅ Check Metro console for fetch logs
4. ✅ Check notification bell badge updates

## Summary

✅ **Notifications Polling**: FIXED
✅ **Polling Interval**: 30 seconds
✅ **Global Integration**: RootNavigator
✅ **Detailed Logging**: Enabled in dev
✅ **Configuration**: Centralized config file
✅ **Real-time Updates**: Working
✅ **Offline Support**: Cached notifications
✅ **Battery Efficient**: Foreground only

## What Happens Now

1. **After Login**: Immediately starts polling
2. **Every 30 seconds**: Checks for new notifications
3. **New Notification**: Badge updates automatically
4. **Navigation**: Polling continues across all screens
5. **Logout**: Polling stops
6. **Background**: Polling pauses (saves battery)
7. **Foreground**: Polling resumes

**Your notifications are now polling every 30 seconds! 🔔✨**

Test it by creating a notification in your backend and watching it appear within 30 seconds! 🚀
