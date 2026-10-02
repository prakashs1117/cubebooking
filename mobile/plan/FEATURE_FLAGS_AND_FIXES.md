# Feature Flags and Font Fixes - Summary

## Changes Made

### 1. Feature Flags for Social Login

**File:** `config/eva/platformconfig.json`

Added three new feature flags to control social login providers:

```json
"features": {
  "LIVE": true,
  "DISCOVER": true,
  "FIRST_LAUNCH": true,
  "SOCIAL_LOGIN_GOOGLE": true,
  "SOCIAL_LOGIN_APPLE": true,
  "SOCIAL_LOGIN_FACEBOOK": false
}
```

**Configuration:**

- `SOCIAL_LOGIN_GOOGLE`: **Enabled** - Google sign-in will show
- `SOCIAL_LOGIN_APPLE`: **Enabled** - Apple sign-in will show
- `SOCIAL_LOGIN_FACEBOOK`: **Disabled** - Facebook sign-in will be hidden

### 2. Platform Config Utility

**File:** `src/utils/platformConfig.ts` (NEW)

Created utility functions to read and check feature flags:

```typescript
// Check if any feature is enabled
isFeatureEnabled('SOCIAL_LOGIN_GOOGLE');

// Check social login for specific provider
isSocialLoginEnabled('google'); // true
isSocialLoginEnabled('apple'); // true
isSocialLoginEnabled('facebook'); // false
```

### 3. Updated SignInScreen

**File:** `src/screens/SignInScreen.tsx`

**Changes:**

1. ✅ Added `isSocialLoginEnabled` import
2. ✅ Social login section now conditionally renders based on feature flags
3. ✅ Individual social buttons render only if their provider is enabled
4. ✅ Fixed "Don't have an account" text to use proper fontSize from font system
5. ✅ If all social logins are disabled, the entire section (divider + buttons) is hidden

### 4. Updated SignUpScreen

**File:** `src/screens/SignUpScreen.tsx`

**Changes:**

1. ✅ Added `isSocialLoginEnabled` import
2. ✅ Social login section now conditionally renders based on feature flags
3. ✅ Individual social buttons render only if their provider is enabled
4. ✅ Fixed "Already have an account" text to use proper fontSize from font system
5. ✅ If all social logins are disabled, the entire section (divider + buttons) is hidden

### 5. Password Visibility Icon Position

**File:** `src/components/common/CustomInput.tsx`

**Current Configuration:**
The password field already has the correct icon positioning:

- **Left Icon**: Lock icon (`leftIcon={<LockIcon />}`)
- **Input Field**: Password input in the middle
- **Right Icon**: Eye icon for show/hide (`rightIcon={visibility toggle}`)

The rendering order in CustomInput is:

```typescript
{leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
<TextInput style={[styles.input, inputStyle]} ... />
{rightIcon && <TouchableOpacity style={styles.rightIconContainer}>...</TouchableOpacity>}
```

This ensures the eye icon appears on the **RIGHT side** of the password field.

### 6. Input Placeholder Font

**Current Configuration:**
The input placeholder is already configured to use **Poppins-Light** font:

**File:** `src/utils/fonts/fontRegistry.ts` (Line 70)

```typescript
input: createFontConfig('Poppins', 'Light', 15, 20),
```

**File:** `src/components/common/CustomInput.tsx` (Lines 68-73)

```typescript
input: {
  flex: 1,
  fontFamily: getFontStyle('input').fontFamily,  // = 'poppins.light'
  fontSize: getFontStyle('input').fontSize,      // = 15
  color: theme.text.primary,
  height: '100%',
}
```

In React Native, the TextInput's `fontFamily` style automatically applies to:

- ✅ The input text (what user types)
- ✅ The placeholder text

Both use **Poppins-Light** font.

## How to Use Feature Flags

### Enable/Disable Social Login Providers

Edit `config/eva/platformconfig.json`:

```json
{
  "features": {
    "SOCIAL_LOGIN_GOOGLE": true, // Show Google button
    "SOCIAL_LOGIN_APPLE": false, // Hide Apple button
    "SOCIAL_LOGIN_FACEBOOK": true // Show Facebook button
  }
}
```

### In Code

```typescript
import { isSocialLoginEnabled } from '@utils/platformConfig';

// Check if Google login is enabled
if (isSocialLoginEnabled('google')) {
  // Show Google login button
}
```

## Testing

### 1. Rebuild the App

After making these changes, you **must** rebuild the app:

```bash
# For Android
npm run android

# For iOS
npm run ios
```

### 2. Verify Font Loading

If the placeholder font is not showing Poppins:

1. Check that Poppins font files are in `android/app/src/main/assets/fonts/`
2. Check that Poppins font files are in `ios/Fonts/`
3. Verify font is registered in `Info.plist` (iOS)
4. Clean build and reinstall:

   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   npm run android

   # iOS
   cd ios && pod install && cd ..
   npm run ios
   ```

### 3. Verify Icon Positions

The password field should show:

```
[🔒 Lock] [••••••••] [👁 Eye]
  LEFT      CENTER      RIGHT
```

### 4. Test Feature Flags

1. Set all social login flags to `false` in `platformconfig.json`
2. Rebuild app
3. Navigate to Sign In / Sign Up screens
4. Verify that "Or continue with" section is completely hidden
5. Set flags back to `true` and verify buttons appear

## Font Configuration Reference

| Element           | Font Family      | Font Size | Line Height |
| ----------------- | ---------------- | --------- | ----------- |
| Input Text        | Poppins-Light    | 15px      | 20px        |
| Input Placeholder | Poppins-Light    | 15px      | 20px        |
| Label             | Urbanist-Regular | 13px      | 16px        |
| Error             | Poppins-Light    | 11px      | 14px        |
| Footer Text       | Poppins-Light    | 14px      | 18px        |

## Files Modified

1. ✅ `config/eva/platformconfig.json` - Added social login feature flags
2. ✅ `src/utils/platformConfig.ts` - NEW utility for reading feature flags
3. ✅ `src/screens/SignInScreen.tsx` - Added conditional rendering for social login
4. ✅ `src/screens/SignUpScreen.tsx` - Added conditional rendering for social login
5. ✅ `src/components/common/CustomInput.tsx` - Icon positioning already correct

## Summary

- ✅ **Feature Flags**: Social login can be toggled via `platformconfig.json`
- ✅ **Icon Position**: Eye icon is on the RIGHT side of password field
- ✅ **Placeholder Font**: Already using Poppins-Light (verify after rebuild)
- ✅ **Footer Text Font**: Now uses proper fontSize from font system
- ✅ **Conditional Rendering**: Social login section hides when all providers disabled

**Next Steps:**

1. Rebuild the app completely
2. Verify all fonts are displaying correctly
3. Test enabling/disabling social login providers
4. If fonts still don't show correctly, check font file installation
