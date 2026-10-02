# Session Management & Cross-Platform Deletion

## Overview

The app implements robust session management to handle account deletion scenarios across web and mobile platforms. When a user deletes their account on any platform (web/mobile), the other platforms automatically logout and clear all session data.

## Session Management Architecture

### Three-Layer Session Storage

1. **AsyncStorage (Persistent)**
   - Stores: `ACCESS_TOKEN`, `REFRESH_TOKEN`, `USER_DATA`, `GUEST_MODE`
   - Persists across app restarts
   - Cleared on logout/deletion

2. **Zustand Store (In-Memory + Persistent)**
   - Stores: User auth state
   - Syncs with AsyncStorage on load
   - Auto-resets on app restart if no tokens

3. **AuthContext (React State)**
   - Stores: `user`, `accessToken`, `isAuthenticated`, `isLoading`
   - Triggers RootNavigator to redirect
   - Re-renders entire app on auth change

### API Interceptor (Request/Response)

**Request:**
- Injects Bearer token automatically
- Logs all requests with method/URL

**Response:**
- Handles 401 (Token Expired)
- Handles 403 (Account Deleted/Forbidden)
- Clears session on both errors
- Emits `sessionExpired` event

## Cross-Platform Deletion Scenario

### User deletes account on Web App
```
Web: POST /user/delete → 200 ✓
Web: Token invalidated on server
Web: Account deleted from database
```

### Mobile App continues using old token
```
Mobile: Next API call with old token
  ↓
API Server rejects: 403 Forbidden
  ↓
client.ts response interceptor catches 403
  ↓
Calls tokenStorage.clearAuthData()
  ↓
Calls sessionEvents.emitSessionExpired()
  ↓
AuthContext listeners are notified
  ↓
AuthContext updates state: isAuthenticated = false
  ↓
RootNavigator detects auth change
  ↓
Navigation stack switches to Auth screens
  ↓
User lands on SignIn screen
  ↓
All local data cleared ✓
```

## Error Codes & Handling

### 401 - Unauthorized (Token Expired)

**When it occurs:**
- Token expired on server
- Token revoked
- Invalid token format

**How we handle it:**
```typescript
if (status === 401 && !isAuthEndpoint) {
  await tokenStorage.clearAuthData();
  sessionEvents.emitSessionExpired();
}
```

**Result:**
- ✅ Session cleared
- ✅ User logged out
- ✅ Redirected to login

### 403 - Forbidden (Account Deleted/Disabled)

**When it occurs:**
- Account deleted (web/mobile/admin)
- Account disabled by admin
- User permissions revoked
- Account suspended

**How we handle it:**
```typescript
if (status === 403 && !isAuthEndpoint) {
  await tokenStorage.clearAuthData();
  sessionEvents.emitSessionExpired();
}
```

**Result:**
- ✅ Session cleared
- ✅ User logged out
- ✅ Redirected to login

### Network Errors

**When it occurs:**
- Device offline
- API unreachable
- DNS resolution failed

**How we handle it:**
```typescript
if (error.message === 'Network Error') {
  console.error('[API] Network error — check connectivity');
  // Error bubbles up to UI layer
  // User sees network error toast
  // Can retry when online
}
```

**Result:**
- ⚠️ Error toast shown
- ⚠️ User can retry
- ⚠️ Session NOT cleared (token still valid)

### Timeout Errors

**When it occurs:**
- API response too slow (> 30s default)
- Server overloaded
- Network congestion

**How we handle it:**
```typescript
if (error.code === 'ECONNABORTED') {
  console.error('[API] Request timeout — API may be slow');
  // Error bubbles up to UI layer
  // User sees timeout error
  // Can retry
}
```

**Result:**
- ⚠️ Error toast shown
- ⚠️ User can retry
- ⚠️ Session NOT cleared (token still valid)

## Session Lifecycle

### 1. Login (Authenticated)
```
User: email + password
  ↓
AuthContext.login()
  ↓
authService.login() → POST /user/auth/login
  ↓
API returns: { token, user }
  ↓
tokenStorage.saveTokens(token)
  ↓
AuthContext sets: isAuthenticated = true, user = {...}
  ↓
RootNavigator shows Main screens ✓
```

### 2. Active Session (Using App)
```
User: Makes API calls (get favorites, search, etc.)
  ↓
client.ts request interceptor:
  - Gets token from AsyncStorage
  - Adds: Authorization: Bearer <token>
  ↓
API processes request ✓
  ↓
client.ts response interceptor:
  - Logs success ✓
```

### 3. Logout (Manual)
```
User: Taps Logout button
  ↓
AuthContext.logout()
  ↓
authService.logout() → POST /user/auth/logout (optional)
  ↓
tokenStorage.clearAuthData()
  ↓
queryClient.clear()
  ↓
AuthContext sets: isAuthenticated = false
  ↓
RootNavigator shows Auth screens ✓
```

### 4. Delete Account (Manual - Mobile)
```
User: Taps Delete Account
  ↓
AuthContext.deleteAccount()
  ↓
userService.deleteAccount() → DELETE /user/delete
  ↓
API deletes account ✓
  ↓
tokenStorage.clearAuthData()
  ↓
queryClient.clear()
  ↓
AuthContext sets: isAuthenticated = false
  ↓
RootNavigator shows Auth screens ✓
```

### 5. Delete Account (On Web, Mobile Detects)
```
Web App: DELETE /user/delete → 200 ✓

Mobile App: Next API call
  ↓
API rejects with 403
  ↓
client.ts response interceptor:
  - Detects 403 on non-auth endpoint
  - tokenStorage.clearAuthData()
  - sessionEvents.emitSessionExpired()
  ↓
AuthContext listener receives event
  ↓
AuthContext sets: isAuthenticated = false
  ↓
RootNavigator shows Auth screens ✓
```

### 6. Session Expired (Server-Initiated)
```
Server: Token expires naturally or is revoked

Mobile App: Next API call
  ↓
API rejects with 401 or 403
  ↓
client.ts response interceptor handles it
  ↓
tokenStorage.clearAuthData()
  ↓
sessionEvents.emitSessionExpired()
  ↓
AuthContext listener receives event
  ↓
RootNavigator shows Auth screens ✓
```

## Implementation Details

### sessionEvents System

```typescript
// File: src/utils/sessionEvents.ts
const sessionEvents = {
  onSessionExpired: (callback) => {
    // Returns unsubscribe function
    // Called when 401 or 403 detected
    // AuthContext listens to this event
  },
  emitSessionExpired: () => {
    // Called by API interceptor
    // Triggers all listeners
  },
};
```

### AuthContext Listener

```typescript
// File: src/context/AuthContext.tsx
useEffect(() => {
  const unsubscribe = sessionEvents.onSessionExpired(() => {
    // Set state to logged out
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      ...
    });
  });
  return unsubscribe;
}, []);
```

### RootNavigator Response

```typescript
// When AuthContext changes to isAuthenticated=false
// RootNavigator automatically:
// - Unmounts Main screens
// - Mounts Auth screens (SignIn)
// - No navigation needed
```

## Key Features

✅ **Automatic Session Detection**: 401/403 automatically clears session
✅ **Cross-Platform Sync**: Web deletion immediately logs out mobile
✅ **No User Action Needed**: Automatic redirect, no manual logout required
✅ **Clean Logout**: All data cleared (tokens, cache, user state)
✅ **Error Recovery**: Network errors don't clear session
✅ **Timeout Handling**: Timeouts allow retry without logout
✅ **Silent Expiry**: User sees redirect, not error codes
✅ **Multiple Storage Layers**: AsyncStorage + Context + Zustand

## Testing Scenarios

### Scenario 1: Account Deleted on Web
1. Login to mobile app
2. Delete account on web app
3. Use mobile app
4. Next API call should:
   - Receive 403
   - Clear session
   - Redirect to login
   - ✅ Verify: User on SignIn screen, no tokens in storage

### Scenario 2: Token Expires Naturally
1. Login to mobile app
2. Wait for token expiry (or manually invalidate on server)
3. Make API call
4. Should:
   - Receive 401
   - Clear session
   - Redirect to login
   - ✅ Verify: User on SignIn screen

### Scenario 3: Network Error (Offline)
1. Login to mobile app
2. Turn off device internet
3. Make API call
4. Should:
   - Show network error toast
   - NOT clear session
   - Allow retry when online
   - ✅ Verify: Turn internet back on, retry succeeds

### Scenario 4: Manual Logout
1. Login to mobile app
2. Tap Logout button in Settings
3. Should:
   - Show logout confirmation
   - Call logout endpoint
   - Clear all data
   - Redirect to login
   - ✅ Verify: User on SignIn screen, no tokens

### Scenario 5: Manual Delete
1. Login to mobile app
2. Tap Delete Account in Settings
3. Confirm deletion
4. Should:
   - Call delete endpoint
   - Clear all data
   - Redirect to login
   - ✅ Verify: User on SignIn screen, account cannot login again

## Console Logs for Debugging

When session events occur:
```
[API] <-- ERROR 403 DELETE /user/delete
[API] 403 on non-auth endpoint — account deleted/forbidden, clearing session
// User immediately sees login screen
```

When logout happens:
```
[API] <-- 200 POST /user/auth/logout
// Session cleared, user on login screen
```

When network error occurs:
```
[API] Network error — check connectivity
// Error toast shown, session preserved
```

## Security Considerations

✅ **Immediate Token Revocation**: 401/403 immediately clears token from storage
✅ **No Token Reuse**: Cleared tokens cannot be used for future requests
✅ **No Silent Failures**: All session terminations are logged
✅ **No Data Leakage**: Cache cleared on logout/deletion
✅ **No Stale Data**: Next login gets fresh data from server
✅ **Cross-Tab Safety**: Each platform has independent session management

## Troubleshooting

**Issue**: User not logged out when account deleted on web
**Solution**: Check API interceptor is catching 403, verify sessionEvents listeners are registered

**Issue**: Network errors clearing session
**Solution**: Verify error status code check (`status === 401 || status === 403`)

**Issue**: Redirect not happening
**Solution**: Check RootNavigator listens to AuthContext.isAuthenticated

**Issue**: Data not cleared after logout
**Solution**: Verify tokenStorage.clearAuthData() and queryClient.clear() are called

## Future Enhancements

- Add offline queue for pending requests
- Add session timeout warning (e.g., "Session expires in 5 minutes")
- Add session activity tracking (auto-logout after 30 min inactivity)
- Add multi-device session management (logout all devices except current)
- Add session conflict detection (login on another device kicks off current)
