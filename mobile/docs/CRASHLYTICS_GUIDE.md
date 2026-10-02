# Firebase Crashlytics Integration Guide

## Overview

This app uses `@react-native-firebase/crashlytics` for crash reporting. All
crash reporting is gated behind the `performance.enableCrashReporting` flag in
`src/config/appConfig.json`. The integration consists of:

| Layer       | File                                               | Purpose                              |
| ----------- | -------------------------------------------------- | ------------------------------------ |
| Service     | `src/services/crashlyticsService.ts`               | Safe wrapper around the Firebase SDK |
| Entry point | `index.js`                                         | Global JS error handler              |
| Android     | `android/build.gradle`, `android/app/build.gradle` | Crashlytics Gradle plugin            |

---

## Enable / Disable

Open `src/config/appConfig.json` and set:

```json
{
  "performance": {
    "enableCrashReporting": true
  }
}
```

Set to `false` to silence all Crashlytics calls (no-op at runtime). Useful for
local development to avoid polluting the Crashlytics dashboard.

---

## Using the Service

```ts
import { crashlytics } from '@services/crashlyticsService';
```

### Record a non-fatal error

```ts
try {
  await someRiskyOperation();
} catch (error) {
  crashlytics.recordError(error as Error, 'someRiskyOperation');
}
```

### Add breadcrumb logs

Logs appear alongside crash reports in the Firebase console, in the order they
were called before the crash.

```ts
crashlytics.log('User navigated to CheckoutScreen');
crashlytics.log('Payment form submitted');
```

### Identify the user

Call after a successful login so that crashes can be correlated to a specific
user. Call with an empty string on logout.

```ts
// After login
crashlytics.setUserId(user.id);

// After logout
crashlytics.setUserId('');
```

### Attach custom attributes

Useful for capturing app state at the time of a crash.

```ts
crashlytics.setAttribute('theme', 'dark');
crashlytics.setAttribute('language', 'fr');
crashlytics.setAttribute('onboarding_complete', true);

// Or all at once
crashlytics.setAttributes({
  screen: 'EventDetailScreen',
  event_slug: 'annual-summit-2026',
});
```

---

## How Unhandled Errors Are Captured

`index.js` installs a global JS error handler before the app mounts:

```js
const defaultHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  crashlytics.recordError(error, isFatal ? 'fatal' : 'non-fatal');
  defaultHandler(error, isFatal);
});
```

This catches any unhandled JS exception (including Promise rejections that
bubble up) and forwards them to Crashlytics before delegating to the default
React Native handler (which shows the red screen in development).

---

## Setup & First-Time Build

### iOS

After installing the package, run:

```bash
bundle exec pod install
cd ios && xcodebuild clean  # optional, if you hit linking errors
```

Then rebuild:

```bash
npm run ios
```

### Android

The Gradle plugin is already applied. Just rebuild:

```bash
npm run android
# or for a release build:
npm run generate-apk
```

---

## Testing Crashlytics

### 1. Verify the dashboard is receiving events

In the Firebase console, navigate to **Crashlytics** and check the
**Open issues** tab after triggering a test crash. It can take a few minutes
for events to appear.

### 2. Trigger a test non-fatal error

Add this temporarily to any screen's `useEffect` or a button handler:

```ts
import { crashlytics } from '@services/crashlyticsService';

crashlytics.log('Test error triggered');
crashlytics.recordError(new Error('Test non-fatal error'));
```

### 3. Trigger a test fatal crash (Android only in release)

Crashlytics only captures native fatal crashes in **release** builds on
Android (debug builds use a different crash handler). To test:

```bash
npm run generate-apk
# install the APK, then trigger the crash
```

On iOS, fatal crashes are captured in both debug and release builds via the
native crash handler.

### 4. Verify crash-free users metric

After a clean session (no crashes/errors recorded), re-check the Firebase
console — the crash-free users percentage should remain at 100 %.

---

## Checklist Before Release

- [ ] `performance.enableCrashReporting` is `true` in production config
- [ ] `crashlytics.setUserId()` is called after login
- [ ] `crashlytics.setUserId('')` is called after logout
- [ ] Key screens/flows add `crashlytics.log()` breadcrumbs
- [ ] Test non-fatal error appears in Firebase console
- [ ] No Crashlytics calls in hot paths (the service is no-op when disabled, but keep imports clean)

---

## Troubleshooting

### Events not appearing in Firebase console

- Make sure `enableCrashReporting: true` in config.
- Crashlytics batches events and uploads on next app launch — force-close and
  reopen the app after triggering a test error.
- On Android, confirm `apply plugin: "com.google.firebase.crashlytics"` is
  present at the bottom of `android/app/build.gradle`.
- On iOS, confirm `pod install` was run after adding the package.

### `@react-native-firebase/crashlytics` module not found

Run `bundle exec pod install` (iOS) or rebuild the Android project after
installing the npm package — native modules require a full rebuild.

### Crashes not reported in debug mode (Android)

This is expected. The Crashlytics native crash handler is only active in
release builds on Android. Use `crashlytics.recordError()` for manual
non-fatal reporting in debug.
