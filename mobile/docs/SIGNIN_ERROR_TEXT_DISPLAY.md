# Sign In Error Message Display

## Change Summary

Updated the Sign In screens to display API error messages as text above the login button instead of using a modal dialog.

## What Changed

### Error Display Method
- **Before**: Error modal (bottom sheet) with icon and two buttons
- **After**: Error text banner directly above the login button

### User Experience Improvement

**Before:**
```
┌─────────────────────────────────┐
│ ✗ Error 403                     │
│                                 │
│ Your account has been disabled  │
│                                 │
│ Error Code: 403 (Forbidden)     │
│                                 │
│         [ OK ]                  │
└─────────────────────────────────┘
(User has to tap OK to dismiss)
```

**After:**
```
┌─────────────────────────────────┐
│ Your account has been disabled  │ ← Light red background
│                                 │   Visible immediately
│ Login Button                    │   No interaction needed
│                                 │
└─────────────────────────────────┘
```

## Files Modified

1. **`src/screens/SignInScreen.tsx`**
   - Replaced modal state with `apiError` text state
   - Updated `handleSignIn()` to set error text instead of modal
   - Added error text display above login button
   - Added `apiErrorText` style (red background, centered text)
   - Removed `AppModal` and `ModalConfig` imports

2. **`src/screens/SignInScreen.tablet.tsx`**
   - Same changes as phone version for consistency
   - Tablet layout maintains same error display approach

## Implementation Details

### Error State
```typescript
// Before
const [modal, setModal] = useState<ModalConfig | null>(null);

// After
const [apiError, setApiError] = useState('');
```

### Error Handling
```typescript
try {
  await login({ email, password });
} catch (error) {
  const errorMessage = handleApiError(error);
  setApiError(errorMessage || t('errors.api.unknown'));
}
```

### Error Display
```typescript
{apiError ? (
  <Text style={styles.apiErrorText}>{apiError}</Text>
) : null}
```

### Error Text Styling
```typescript
apiErrorText: {
  fontFamily: getFontStyle('body').fontFamily,
  fontSize: 14,
  color: theme.text.error,        // Red text color
  marginBottom: 16,
  marginTop: 12,
  padding: 12,
  borderRadius: 8,
  backgroundColor: isDark 
    ? 'rgba(220, 54, 54, 0.1)'    // Dark mode: light red
    : 'rgba(220, 54, 54, 0.08)',  // Light mode: very light red
  textAlign: 'center',
  lineHeight: 20,
}
```

## Error Messages Displayed

All error scenarios from the API are now displayed as text:

| Status | Error Message Example |
|--------|----------------------|
| 403 | "Your account has been disabled" |
| 401 | "Invalid email or password" |
| 404 | "No account found with this email address" |
| 400 | "Invalid request. Please check your input and try again." |
| Network | "Network error. Please check your internet connection." |
| Timeout | "Request timed out. Please try again." |

## Benefits

✅ **Faster Feedback** - Users see error immediately, no modal dismiss needed
✅ **Better UX** - Non-intrusive, doesn't block the form
✅ **Accessibility** - Text-based error is screen-reader friendly
✅ **Simpler Code** - No modal state management needed
✅ **Consistent** - Matches pattern used elsewhere in the app
✅ **Mobile Friendly** - Error visible in form context, not covering content

## Error Flow

```
User enters credentials and taps "Log In"
    ↓
handleSignIn() validates form
    ↓
login() calls API
    ↓
API returns error (e.g., 403 with empty body)
    ↓
Error caught in try-catch
    ↓
handleApiError() extracts and formats message
    ↓
setApiError() updates state
    ↓
Error text renders above login button
    ↓
User reads error message
    ↓
User can:
  - Try again with different credentials
  - Tap "Forgot password"
  - Contact support
```

## Test Coverage

All existing tests still pass:
- ✅ 28 API error handler tests passing
- ✅ No changes to error extraction logic
- ✅ Error messages formatted the same way
- ✅ Only display method changed (modal → text)

## Debugging

Error messages are still logged to console for troubleshooting:

```javascript
console.error('[SignIn] Login error:', error);
console.error('[SignIn] Parsed error:', { parsedError, errorMessage });
```

Check browser/device console to see full error details if needed.

## Related Files

- `src/utils/apiErrorHandler.ts` - Error message extraction and formatting (no changes)
- `src/localization/translations/en.json` - Error message translations
- `src/context/AuthContext.tsx` - Login API call (no changes)

## Backward Compatibility

✅ No breaking changes
✅ Same error messages displayed
✅ Same error detection logic
✅ Only UI presentation changed
