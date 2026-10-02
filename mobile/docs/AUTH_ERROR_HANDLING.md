# Authentication Error Handling

## Overview

The app now automatically handles authentication errors (401 Unauthorized, 403 Forbidden) by logging out the user and redirecting to the login screen.

## 🔐 How It Works

### Automatic Logout on 401/403

When any API call receives a 401 or 403 error:

1. **User is logged out** - User data and token are cleared from store
2. **Redirected to Auth screen** - App navigates to login page
3. **Error is logged** - Console shows `🔐 Authentication error, logging out user...`

### Affected Services

✅ **Notifications Service** (`src/services/api/notifications.service.ts`)

- GET /me/notifications
- All notification endpoints

✅ **Events Service** (`src/services/api/events.service.ts`)

- GET /events
- GET /events/:slug
- All event endpoints

## 📊 Error Flow

```
API Request → 401/403 Response
    ↓
handleAuthError() called
    ↓
useUserStore.clearUser()
    ↓
navigationRef.navigate('Auth')
    ↓
User sees Login Screen
```

## 🔧 Implementation Details

### 1. Navigation Reference

The app maintains a navigation reference in `App.tsx`:

```typescript
const navigationRef = useRef<any>(null);

<NavigationContainer ref={navigationRef}>{/* ... */}</NavigationContainer>;

// Set ref for services
setNotificationServiceNavigationRef(navigationRef.current);
setEventsServiceNavigationRef(navigationRef.current);
```

### 2. Auth Error Handler

Both services have the same `handleAuthError` function:

```typescript
const handleAuthError = (status: number) => {
  console.log('🔐 Authentication error, logging out user...');

  // Clear user from store (logout)
  useUserStore.getState().clearUser();

  // Navigate to Auth/Login screen
  if (navigationRef) {
    try {
      navigationRef.navigate('Auth');
      console.log('🔐 Redirected to Auth screen');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }
};
```

### 3. Error Detection

API client checks response status:

```typescript
if (response.status === 401) {
  handleAuthError(401);
  throw new Error('Unauthorized: Please login again');
}

if (response.status === 403) {
  handleAuthError(403);
  throw new Error('Forbidden: You do not have permission');
}
```

### 4. Smart Retry Logic

The `useNotifications` hook doesn't retry on auth errors:

```typescript
retry: (failureCount, error: any) => {
  // Don't retry on authentication errors
  if (
    error?.message?.includes('Unauthorized') ||
    error?.message?.includes('Forbidden')
  ) {
    return false;
  }
  // Retry other errors up to 3 times
  return failureCount < 3;
};
```

## 🎯 User Experience

### Before (Without Auto Logout)

```
1. User opens app
2. Token expired
3. API returns 401
4. Error message shown
5. User stuck on error screen
6. Manual navigation to login required
```

### After (With Auto Logout)

```
1. User opens app
2. Token expired
3. API returns 401
4. User automatically logged out
5. Redirected to login screen
6. Clean login experience ✅
```

## 🧪 Testing

### Test Expired Token

```typescript
// Set an invalid/expired token
useUserStore.getState().setAuthToken('invalid-token');

// Try to fetch notifications
const { data, error } = useNotifications();

// Expected behavior:
// 1. Console: "🔐 Authentication error, logging out user..."
// 2. Console: "🔐 Redirected to Auth screen"
// 3. User redirected to login
// 4. Store cleared
```

### Test Missing Token

```typescript
// Clear token
useUserStore.getState().clearUser();

// Try to fetch notifications
const { data, error } = useNotifications();

// Expected: 401 → auto logout → redirect to Auth
```

### Manual Test Steps

1. ✅ Login with valid token
2. ✅ Open notifications (should work)
3. ✅ Manually expire token or set invalid token
4. ✅ Pull to refresh notifications
5. ✅ Should auto logout and show Auth screen

## 📝 Error Messages

### Console Logs

**Success:**

```
✅ Navigation ref set for API services
```

**Auth Error:**

```
🔐 Authentication error, logging out user...
🔐 Redirected to Auth screen
```

**Navigation Error:**

```
Navigation error: [error details]
```

### User-Facing Errors

The error is thrown but caught by React Query, so the UI shows:

- Loading indicator stops
- Error state (if implemented in component)
- User is on Auth/Login screen

## 🔒 Security Benefits

1. **No Stale Sessions** - Expired tokens immediately trigger logout
2. **Automatic Cleanup** - User data cleared on auth failure
3. **Clear User Experience** - User knows they need to re-authenticate
4. **No Manual Intervention** - Everything happens automatically

## 🎨 Customization

### Change Redirect Screen

To redirect to a different screen instead of 'Auth':

```typescript
// In notifications.service.ts or events.service.ts
const handleAuthError = (status: number) => {
  console.log('🔐 Authentication error, logging out user...');
  useUserStore.getState().clearUser();

  if (navigationRef) {
    navigationRef.navigate('YourCustomLoginScreen'); // ← Change here
  }
};
```

### Add Custom Logic Before Logout

```typescript
const handleAuthError = (status: number) => {
  // Save some state before logout
  AsyncStorage.setItem('lastError', 'session_expired');

  // Show toast notification
  Toast.show({
    type: 'error',
    text1: 'Session Expired',
    text2: 'Please login again',
  });

  // Then logout and redirect
  useUserStore.getState().clearUser();
  navigationRef?.navigate('Auth');
};
```

### Add Analytics Tracking

```typescript
const handleAuthError = (status: number) => {
  // Track logout event
  analytics.track('auto_logout', {
    reason: status === 401 ? 'unauthorized' : 'forbidden',
    timestamp: new Date().toISOString(),
  });

  useUserStore.getState().clearUser();
  navigationRef?.navigate('Auth');
};
```

## 🚨 Edge Cases Handled

### 1. Navigation Not Ready

If navigation ref is null (unlikely), error is logged but app doesn't crash:

```typescript
if (navigationRef) {
  try {
    navigationRef.navigate('Auth');
  } catch (error) {
    console.error('Navigation error:', error);
  }
}
```

### 2. Multiple Simultaneous 401s

If multiple API calls fail at once, only one logout occurs because React Query deduplicates.

### 3. Background Polling

Polling automatically stops when user is logged out because `isAuthenticated` becomes false.

## 📚 Related Files

### Core Files

- `App.tsx` - Sets navigation reference
- `src/stores/userStore.ts` - User state and auth token
- `src/services/api/notifications.service.ts` - Notification API with auth
- `src/services/api/events.service.ts` - Events API with auth
- `src/hooks/useNotifications.ts` - Notification hook with retry logic

### Documentation

- `AUTHENTICATION_GUIDE.md` - Full authentication guide
- `NOTIFICATION_API_INTEGRATION.md` - Notification API guide

## ✅ Production Checklist

Before deploying:

- [ ] Test with real expired tokens
- [ ] Test with invalid tokens
- [ ] Test with missing tokens
- [ ] Verify Auth screen exists and works
- [ ] Test multiple API failures
- [ ] Test background polling behavior
- [ ] Add user-facing error messages if needed
- [ ] Add analytics tracking if needed
- [ ] Test on both iOS and Android

---

**Status**: ✅ Fully Implemented

Last Updated: March 4, 2026
Version: 1.0.0
