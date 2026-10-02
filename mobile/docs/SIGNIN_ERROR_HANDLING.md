# Sign In Error Handling

## Overview
When users enter incorrect credentials on the Sign In screen, the app now properly displays error messages from the API.

## Implementation Details

### Changes Made

1. **Enhanced Error Parsing** (`src/utils/apiErrorHandler.ts`)
   - Improved `parseApiError()` to check multiple response fields: `message`, `error`, `msg`
   - Handles empty response bodies (null, undefined, empty object)
   - Falls back to Axios error message if server message unavailable
   - Always returns a meaningful message, never empty

2. **Smart Message Localization** (`src/utils/apiErrorHandler.ts`)
   - `getLocalizedErrorMessage()` uses 4-level fallback chain:
     1. Server message if non-empty (e.g., "Account locked")
     2. Endpoint-specific mapping (e.g., /auth/login 403 → "Your account has been disabled")
     3. Generic HTTP status mapping (e.g., 403 → "Forbidden")
     4. Ultimate fallback to "An error occurred"
   - Ensures users always see a meaningful error message

3. **Sign In Screens** (`src/screens/SignInScreen.tsx` and `SignInScreen.tablet.tsx`)
   - Added error logging with console.error for debugging
   - Ensured fallback to translation key if message is empty
   - Added null coalescing: `errorMessage || t('errors.api.unknown')`

### Error Response Flow

When login fails:
1. `AuthContext.login()` catches the error and throws it
2. `SignInScreen` catches the error in the try-catch block
3. `parseApiError()` extracts error code and message from response
4. `handleApiError()` formats the error message
5. Error modal displays with title and message to user

### Example Scenarios

**Invalid Credentials (401)**
- API responds with: `{ "error": "Invalid email or password" }`
- Extracted message: "Invalid email or password"
- If no server message: Uses translation key `errors.api.invalidCredentials`

**Account Disabled (403)**
- API responds with: `{}` (empty body) or `null`
- No server message extracted
- Falls back to endpoint-specific mapping: `errors.api.accountDisabled`
- Displays: "Your account has been disabled"

**User Not Found (404)**
- API responds with: `{ "message": "User not found" }`
- Extracted message: "User not found"
- If no server message: Uses translation key `errors.api.userNotFound`

**Network Error**
- Axios throws network error
- Extracted message: "Network Error" or "Failed to fetch"
- Fallback to: `errors.api.networkError` translation

**Server Error with Empty Body (500, 503, etc.)**
- API responds with: `{}` (empty body)
- No server message extracted
- Falls back to generic HTTP status mapping: `errors.http.internalServerError`
- Displays: "A server error occurred. Please try again later."

### Testing

Run tests:
```bash
npm test -- --testPathPattern="apiErrorHandler" --no-coverage
```

All tests pass, validating:
- Error parsing from various response formats
- Localized message fallback chain
- Null/undefined handling
- String error handling

### Files Changed
- `src/utils/apiErrorHandler.ts` - Enhanced error parsing and message extraction
- `src/screens/SignInScreen.tsx` - Added error logging and fallback messages
- `src/screens/SignInScreen.tablet.tsx` - Added error logging and fallback messages

### Debug Logging

When a sign-in error occurs, check the console for:
```
[SignIn] Login error: <error object>
[SignIn] Parsed error: { apiError, errorMessage }
```

This helps identify if errors are being extracted correctly from API responses.
