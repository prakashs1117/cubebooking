# Handling 403 Errors with Empty Response Bodies

## Problem Statement

When the API (`https://mymsafety-dev.merckgroup.com/api/v1/user/auth/login`) returns a 403 status code with an empty response body (no JSON payload), the error message was not being displayed to users.

**API Behavior:**
```
POST /api/v1/user/auth/login
Response: Status 403
Body: {} (empty object or null)
```

## Solution Overview

Enhanced the error handling system to gracefully handle empty API responses by using status-code-to-message mappings.

## How It Works

### 4-Level Error Message Fallback Chain

When the API returns an error, the app follows this priority:

1. **Server Message** - If the API returns a non-empty error message field
   - Example: `{ "error": "Invalid email or password" }`
   - → User sees: "Invalid email or password"

2. **Endpoint-Specific Mapping** - For known endpoints/status combinations
   - Example: POST `/user/auth/login` returns 403
   - → Mapped to translation key: `errors.api.accountDisabled`
   - → User sees: "Your account has been disabled"

3. **Generic HTTP Status Mapping** - For any HTTP status code
   - Example: 403 (Forbidden)
   - → Mapped to translation key: `errors.http.forbidden`
   - → User sees: "You don't have permission to access this resource."

4. **Ultimate Fallback** - If all else fails
   - → Uses: `errors.api.unknown`
   - → User sees: "An unexpected error occurred. Please try again."

### Data Flow Diagram

```
API Request Failed (403 empty body)
    ↓
parseApiError() extracts:
    - status: 403
    - endpoint: /user/auth/login
    - message: "" (empty)
    ↓
getLocalizedErrorMessage() checks:
    1. Is message non-empty? No
    2. Is endpoint in ENDPOINT_ERROR_MAP with this status? Yes!
    3. Return: errors.api.accountDisabled
    ↓
i18n.t('errors.api.accountDisabled')
    ↓
Display in error modal
```

## Code Changes

### 1. Enhanced `parseApiError()` - `src/utils/apiErrorHandler.ts`

- Detects empty response bodies (null, undefined, empty object)
- Checks multiple response fields: `message`, `error`, `msg`
- Falls back to Axios error message
- Returns meaningful string, never empty

```typescript
// Checks for empty response
const hasEmptyResponse =
  !serverMessage &&
  (responseData === null ||
    responseData === undefined ||
    (typeof responseData === 'object' && Object.keys(responseData).length === 0));
```

### 2. Updated `getLocalizedErrorMessage()` - `src/utils/apiErrorHandler.ts`

- Changed priority order: server message first, then endpoint mapping
- Endpoint-specific mappings for `/auth/login` and `/user/auth/login`:
  ```typescript
  '/user/auth/login': {
    401: 'errors.api.invalidCredentials',
    404: 'errors.api.userNotFound',
    403: 'errors.api.accountDisabled',
  }
  ```

### 3. Added Debug Logging - `src/screens/SignInScreen.tsx` & `.tablet.tsx`

- Console logs for debugging API errors
- Fallback message handling

```typescript
console.error('[SignIn] Login error:', error);
const apiError = parseApiError(error);
const errorMessage = handleApiError(error);
console.error('[SignIn] Parsed error:', { apiError, errorMessage });
```

## Test Coverage

Added 6 new test cases to `__tests__/utils/apiErrorHandler.test.ts`:

```
✓ handles 403 login error with empty response body
✓ handles 403 login error with null response body
✓ uses endpoint-specific mapping for 403 login error with empty message
✓ uses generic HTTP mapping when endpoint has no specific mapping
✓ prefers server message over endpoint mapping when both available
✓ maps 403 on /user/auth/login endpoint to account disabled
```

**Total: 28 tests passing**

## Real-World Example

### Scenario: Account Disabled (403 Empty Body)

**API Response:**
```
Status: 403
Body: {} (empty)
```

**Error Handling Flow:**
```
1. parseApiError() detects empty body, returns code=403, message=""
2. getLocalizedErrorMessage() checks:
   - Is "" non-empty? No
   - Is /user/auth/login in mapping for 403? Yes
   - Return: "errors.api.accountDisabled"
3. i18n translates: "Your account has been disabled"
4. Modal shows: Error 403 (Forbidden) - Your account has been disabled
```

**User Experience:**
- ✅ User sees meaningful error message
- ✅ User understands their account is disabled
- ✅ User can take action (contact support, reset password, etc.)

## Edge Cases Handled

| Scenario | Response | Behavior |
|----------|----------|----------|
| 403 with empty object | `{}` | Uses endpoint mapping |
| 403 with null | `null` | Uses endpoint mapping |
| 403 with error message | `{ "error": "..." }` | Uses server message |
| 403 unknown endpoint | 403 + unknown path | Uses generic HTTP mapping |
| Network error | Connection failed | Uses network error translation |
| Timeout | Request aborted | Uses timeout translation |

## Error Messages Referenced

Translation keys used in `src/localization/translations/en.json`:

```json
{
  "errors": {
    "api": {
      "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
      "accountDisabled": "Your account has been disabled. Please contact support.",
      "userNotFound": "No account found with this email address.",
      "unknown": "An unexpected error occurred. Please try again."
    },
    "http": {
      "forbidden": "You don't have permission to access this resource.",
      "internalServerError": "A server error occurred. Please try again later."
    }
  }
}
```

## Debugging

Enable error logging by checking browser/device console:

```
[SignIn] Login error: AxiosError { response: { status: 403, data: {} } }
[SignIn] Parsed error: { 
  apiError: { code: 403, message: "", endpoint: "/user/auth/login" }, 
  errorMessage: "Your account has been disabled. Please contact support." 
}
```

## Files Modified

1. `src/utils/apiErrorHandler.ts` - Enhanced error parsing and localization
2. `src/screens/SignInScreen.tsx` - Added debug logging
3. `src/screens/SignInScreen.tablet.tsx` - Added debug logging
4. `__tests__/utils/apiErrorHandler.test.ts` - Added comprehensive tests
5. `docs/SIGNIN_ERROR_HANDLING.md` - Updated documentation
6. `docs/ERROR_HANDLING_403_EMPTY_RESPONSE.md` - This file

## Testing the Fix Locally

To test with mock 403 empty response:

```bash
npm test -- --testPathPattern="apiErrorHandler" --no-coverage
```

All 28 tests should pass, including the new empty response handling tests.

## Future Improvements

- Add analytics tracking for error types
- Implement retry logic for specific error codes
- Add user-actionable suggestions in error messages
- Support for multiple languages error messages
