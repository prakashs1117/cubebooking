# Firebase Temporarily Disabled

## Overview

Firebase functionality has been temporarily disabled throughout the codebase. All Firebase packages have been removed from `package.json`. The code is structured to allow easy re-enablement when Firebase packages are reinstalled.

## Changes Made

### 1. **JavaScript/TypeScript Services** (Disabled - All No-ops)

- **`src/services/pushNotificationService.ts`**

  - Firebase messaging import commented out
  - All functions return no-ops or empty cleanup functions
  - Wrapped in comments for future re-enablement

- **`src/services/analyticsService.ts`**

  - Firebase analytics import commented out
  - `safe()` wrapper now a no-op
  - All analytics calls are silently skipped

- **`src/services/crashlyticsService.ts`**
  - Firebase crashlytics import commented out
  - `safe()` wrapper now a no-op
  - All crashlytics calls are silently skipped

### 2. **Android Configuration** (Disabled)

- **`android/build.gradle`**

  - Google Services classpath commented out
  - Firebase Crashlytics gradle plugin commented out

- **`android/app/build.gradle`**
  - `com.google.gms.google-services` plugin commented out
  - `com.google.firebase.crashlytics` plugin commented out

### 3. **iOS Configuration** (Already clean)

- `ios/Podfile` - No changes needed (pods already removed)
- Firebase packages removed from `Podfile.lock`

### 4. **Removed NPM Packages**

- `@react-native-firebase/firestore`
- `@react-native-firebase/analytics`
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/crashlytics`
- `@react-native-firebase/messaging`

## Re-Enabling Firebase

To re-enable Firebase in the future:

### 1. **Reinstall Packages**

```bash
npm install @react-native-firebase/app@latest
npm install @react-native-firebase/analytics@latest
npm install @react-native-firebase/crashlytics@latest
npm install @react-native-firebase/messaging@latest
npm install @react-native-firebase/auth@latest
```

### 2. **Uncomment TypeScript Services**

Search for `Firebase disabled - uncomment when Firebase packages are installed` and uncomment the corresponding code blocks in:

- `src/services/pushNotificationService.ts`
- `src/services/analyticsService.ts`
- `src/services/crashlyticsService.ts`

### 3. **Re-enable Android Configuration**

Uncomment the Firebase classpath dependencies in:

- `android/build.gradle` (Google Services, Firebase Crashlytics)
- `android/app/build.gradle` (Google Services and Crashlytics plugins)

### 4. **Reinstall iOS Pods**

```bash
cd ios
pod install --repo-update
```

### 5. **Configure Firebase**

- Add `google-services.json` to `android/app/`
- Add `GoogleService-Info.plist` to `ios/`

## Impact

✅ **Safe to Build & Run**: All Firebase functionality is safely disabled with no-ops
✅ **No Runtime Errors**: Calls to analytics and crashlytics are silently ignored
✅ **Clean Re-enablement**: Original code structure preserved in comments
✅ **No App Crashes**: App runs normally without Firebase services

## Feature Flags

The following app still respects feature flags:

- Push notifications are gated by `push_notifications` feature flag
- Analytics is gated by `analytics.enabled` config flag
- Crashlytics is gated by `performance.enableCrashReporting` config flag

When Firebase is re-enabled, these flags will control the services as intended.
