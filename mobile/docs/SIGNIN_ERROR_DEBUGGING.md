# Sign In Error Message - Debugging Guide

## Console Log Output to Check

When you test the Sign In with wrong credentials, look for these console logs in order:

### 1. SignInScreen Logs
```
[SignIn] Starting login with email: user@example.com
[SignIn] Loading finished
[SignIn] Login error caught: AxiosError { ... }
[SignIn] Error type: object
[SignIn] Error keys: [...]
[SignIn] Parsed error: { code: 403, message: "..." }
[SignIn] Final error message: "Your account has been disabled"
[SignIn] Setting apiError state to: "Your account has been disabled"
```

### 2. AuthContext Logs
```
[AuthContext] login() called with email: user@example.com
[AuthContext] Calling authService.login()
[AuthContext] login() caught error: AxiosError { ... }
[AuthContext] Translated error message: "Your account has been disabled"
[AuthContext] Re-throwing error for screen to catch
```

### 3. Expected Flow

```
SignInScreen handleSignIn()
         ↓
[SignIn] Starting login with email: ...
         ↓
AuthContext login()
         ↓
[AuthContext] login() called with email: ...
[AuthContext] Calling authService.login()
         ↓
API Call (fails with 403)
         ↓
[AuthContext] login() caught error: ...
[AuthContext] Translated error message: ...
[AuthContext] Re-throwing error for screen to catch
         ↓
SignInScreen catch block
         ↓
[SignIn] Login error caught: ...
[SignIn] Parsed error: ...
[SignIn] Final error message: ...
[SignIn] Setting apiError state to: ...
         ↓
Error text should appear above login button
```

## How to Debug

### Step 1: Open Console
- **iOS Simulator**: Press `Cmd + D` → "Debug" → Open DevTools
- **Android Emulator**: `adb logcat | grep SignIn`
- **Web**: Press `F12` → Console tab

### Step 2: Try Login with Wrong Credentials
1. Enter any email address
2. Enter wrong password
3. Tap "Log In"
4. Watch console for logs

### Step 3: Check Each Step

**Step 3a: Check if login is being called**
```
Look for: [SignIn] Starting login with email: ...
If missing: Login function might not be called at all
```

**Step 3b: Check if error is caught by AuthContext**
```
Look for: [AuthContext] login() caught error: ...
If missing: Error might not be thrown from authService
```

**Step 3c: Check if error reaches SignInScreen**
```
Look for: [SignIn] Login error caught: ...
If missing: Error is not being re-thrown from AuthContext
```

**Step 3d: Check if error message is extracted**
```
Look for: [SignIn] Final error message: "..."
If missing: handleApiError() might not be working
```

**Step 3e: Check if state is being set**
```
Look for: [SignIn] Setting apiError state to: "..."
If missing: setApiError() is not being called
```

## Common Issues

### Issue 1: No Error Caught
**Log shows**: Only `[SignIn] Loading finished` but no error logs

**Cause**: Error might not be thrown, or login succeeded

**Fix**: Check if API is actually returning error

### Issue 2: Error Caught but Message is Empty
**Log shows**: `[SignIn] Final error message: ""`

**Cause**: handleApiError() returned empty string

**Fix**: Check if API response has message field

### Issue 3: Error Message Shows Wrong Text
**Log shows**: `[SignIn] Final error message: "errors.api.unknown"`

**Cause**: Translation key not converted to actual message

**Fix**: Check if i18n.t() is working correctly

### Issue 4: State Set but Error Not Displayed
**Log shows**: `[SignIn] Setting apiError state to: "..."`
But error text doesn't appear on screen

**Cause**: State update not triggering re-render

**Fix**: 
1. Check if `apiError` state variable is used in render
2. Check if component is being re-rendered
3. Check React DevTools for state updates

## Error Message Path

```
API Response
    ↓
authService.login() throws AxiosError
    ↓
AuthContext catches, translates, re-throws
    ↓
SignInScreen catches
    ↓
parseApiError() extracts { code, message, endpoint }
    ↓
handleApiError() formats message
    ↓
setApiError() updates state
    ↓
Component re-renders with error text
```

## What to Check in Code

### 1. SignInScreen.tsx
- Line 80: `const [apiError, setApiError] = useState('');`
- Line 113-129: Try-catch block
- Line 254-255: Error text display
- Line 463-474: apiErrorText styling

### 2. AuthContext.tsx
- Line 185: login() function
- Line 237-245: Error handling in catch block
- Line 239: throw error

### 3. apiErrorHandler.ts
- handleApiError() function returns formatted message
- parseApiError() extracts error from AxiosError

## Testing Checklist

- [ ] Console shows "[SignIn] Starting login with email"
- [ ] Console shows "[AuthContext] login() caught error"
- [ ] Console shows "[SignIn] Login error caught"
- [ ] Console shows "[SignIn] Final error message" with actual message
- [ ] Console shows "[SignIn] Setting apiError state to" with message
- [ ] Red error text appears above login button
- [ ] Error text matches the error message from console

## If Error Still Doesn't Show

1. **Check if component rendered**: Look for error text container styles in React DevTools
2. **Check if state updated**: Use React DevTools to inspect `apiError` state
3. **Check if CSS hidden**: Inspect element in DevTools to see if styles are applied
4. **Check if view scrolled**: Error might be above visible area - scroll up
5. **Reload app**: Hot reload might not update all code

## Next Steps

Once you see the console logs:
1. Share the console output
2. We can debug based on where the logs stop
3. Fix the specific issue
4. Error message will display correctly

