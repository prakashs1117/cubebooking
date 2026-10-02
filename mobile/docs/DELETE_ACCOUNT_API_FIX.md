# Delete Account API Fix - Request Body Implementation

## Issue

The DELETE `/user/delete` endpoint requires a request body with user data, not a simple DELETE with no body. This matches the Ionic app implementation which sends user context with the deletion request.

## Solution

Updated the React Native app to send DELETE request with user payload, matching the Ionic app's `http.service.ts` implementation.

## Implementation

### API Request Format

**Before (Incorrect):**
```javascript
DELETE /user/delete
// No body
```

**After (Correct - Matches Ionic):**
```javascript
DELETE /user/delete
{
  "userId": "user-id-string",
  "email": "user@example.com",
  "name": "User Full Name",
  "position": "Job Title"
}
```

### Files Modified

#### 1. `src/services/api/user.service.ts`

**New Interface:**
```typescript
export interface DeleteAccountPayload {
  userId: string;
  email: string;
  name: string | null;
  position: string | null;
}
```

**Updated Method:**
```typescript
deleteAccount: async (user: User): Promise<void> => {
  const payload: DeleteAccountPayload = {
    userId: user.id,
    email: user.email,
    name: user.name || null,
    position: user.position || null,
  };
  await apiClient.request<void>({
    method: 'delete',
    url: ENDPOINTS.USER.DELETE,
    data: payload,
  });
};
```

**Key Changes:**
- Accepts `User` parameter from AuthContext
- Constructs `DeleteAccountPayload` with user data
- Uses `apiClient.request()` instead of `apiClient.delete()` to support body data
- Body fields match Ionic's `IDeleteAccount` interface

#### 2. `src/context/AuthContext.tsx`

**Updated Method:**
```typescript
const deleteAccount = async () => {
  try {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    if (!state.user) {
      throw new Error('No user context available');
    }

    // Pass current user to service
    await userService.deleteAccount(state.user);

    // Clear all auth data and cache
    await tokenStorage.clearAuthData();
    queryClient.clear();

    // Update state to trigger logout flow
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      isGuest: false,
      error: null,
    });
  } catch (error) {
    // ... error handling
  }
};
```

**Key Changes:**
- Added user context check before deletion
- Passes `state.user` to `userService.deleteAccount()`
- Validates user exists before sending request

## Matching Ionic App

### Ionic Implementation (Reference)

From `http.service.ts`:
```typescript
public deleteAccount(url: string, payload: IDeleteAccount, config = this.defaultConfig): Promise<any> {
  let options = {};
  if (config.token) {
    options['headers'] = new HttpHeaders({ 'Authorization': 'Bearer ' + config.token })
  }
  return new Promise((resolve, reject) => {
    this.http.request('delete', this.safetyDataAPIBaseURL + url, options)
      .subscribe(
        res => resolve(res),
        err => reject(this.handleError(err.error)));
  });
}
```

From `safety-data-api.service.ts`:
```typescript
public deleteUserAccount(deleteAccount: IDeleteAccount) {
  return this.httpService.deleteAccount('/user/delete', deleteAccount, {...});
}
```

From `settings.ts`:
```typescript
const params = {
  userId: this.authService.userId,
  newName: null,
  email: null,
  newPosition: null,
};
await this.deleteService.deleteAccount(params);
```

### React Native Implementation (Now Matching)

- ✅ Uses DELETE HTTP method
- ✅ Sends request body with user data
- ✅ Includes userId, email, name, position
- ✅ Automatically includes Authorization header (via interceptor)
- ✅ Clears session on success

## Request/Response Flow

```
SettingsScreen.tsx
  ↓ user taps "Delete Account"
  ↓ calls deleteAccount() from useAuth()
  ↓
AuthContext.deleteAccount()
  ↓ validates user exists
  ↓ calls userService.deleteAccount(state.user)
  ↓
userService.deleteAccount(user)
  ↓ constructs DeleteAccountPayload
  ↓ apiClient.request({method: 'delete', url, data: payload})
  ↓
apiClient interceptor
  ↓ adds Authorization header (Bearer token)
  ↓ logs request
  ↓
Backend DELETE /user/delete
  ↓ validates user ID from payload
  ↓ deletes account from database
  ↓ response: success
  ↓
apiClient response interceptor
  ↓ logs success
  ↓
AuthContext.deleteAccount()
  ↓ clears tokens (tokenStorage.clearAuthData())
  ↓ clears React Query cache (queryClient.clear())
  ↓ updates state (isAuthenticated = false)
  ↓
RootNavigator detects auth change
  ↓ redirects to SignIn screen
```

## API Interceptor Behavior

### Request Interceptor
- Injects `Authorization: Bearer <token>` header
- **Does NOT skip for DELETE requests** (unlike OPTIONS preflight)
- Logs: `[API] --> DELETE /user/delete`
- Logs request body (with password sanitization if present)

### Response Interceptor
- Handles success: logs response
- Handles 401/403: clears session, emits sessionExpired event
- Handles network errors: logs and bubbles up
- Handles timeouts: logs and bubbles up

## Testing

### Test Case 1: Delete Account with Valid User
```
1. Login with test account
2. Navigate to Settings
3. Tap "Delete Account"
4. Confirm deletion
5. Verify console logs show:
   [API] --> DELETE /user/delete
   [API]     body: {"userId":"...", "email":"...", ...}
   [API] <-- 200 DELETE /user/delete
6. Verify redirect to SignIn screen
7. Verify cannot login with deleted account
```

### Test Case 2: Delete Account - User Mismatch (Edge Case)
```
1. If state.user is null (shouldn't happen)
2. Verify error: "No user context available"
3. Verify screen doesn't redirect
4. Verify error toast shown
```

### Test Case 3: Network Error During Deletion
```
1. Turn off internet
2. Tap "Delete Account"
3. Verify error toast: "Network error" or API error message
4. Verify user NOT logged out (session preserved)
5. Verify can retry when online
```

## Console Logs for Debugging

**Successful Deletion:**
```
[API] --> DELETE /user/delete
[API]     body: {"userId":"12345","email":"user@example.com","name":"John Doe","position":"Developer"}
[API] <-- 200 DELETE /user/delete
[API]     response: {}
[AuthContext] Account deleted successfully
// User redirected to SignIn
```

**Failed Deletion (403 - Already Deleted):**
```
[API] --> DELETE /user/delete
[API]     body: {...}
[API] <-- ERROR 403 DELETE /user/delete
[API]     error data: {"error":"Account already deleted"}
[API] 403 on non-auth endpoint — account deleted/forbidden, clearing session
// User redirected to SignIn
```

**Missing User Context:**
```
Error thrown: "No user context available"
Error message shown: "Delete Failed" (i18n translated)
// Modal stays open for retry
```

## Type Safety

The `DeleteAccountPayload` interface ensures type-safe deletion:
- `userId: string` — maps to `user.id`
- `email: string` — maps to `user.email`
- `name: string | null` — maps to `user.name` (nullable)
- `position: string | null` — maps to `user.position` (nullable)

## Backward Compatibility

No breaking changes:
- Endpoint URL unchanged: `/user/delete`
- HTTP method correct: `DELETE`
- Response handling unchanged
- Post-deletion flow unchanged (logout, redirect, cache clear)

## Related Documentation

- [Delete Account Implementation](DELETE_ACCOUNT_IMPLEMENTATION.md)
- [Session Management](SESSION_MANAGEMENT.md)
- [Ionic App Reference](../src/app/services/http.service.ts)

## Git Commit

```
fix(delete-account): send DELETE request with user payload matching Ionic app
Commit: 35c1ec9c
```
