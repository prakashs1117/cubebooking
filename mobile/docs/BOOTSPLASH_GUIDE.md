# Bootsplash Guide

### react-native-bootsplash v7 · Animated Splash Screen · iOS & Android

> **Use this guide when setting up or modifying the splash screen** for a fresh project or
> after replacing the `android/` folder. Covers native setup, the animated JS component,
> and the bootsplash generator workflow.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Package installation](#2-package-installation)
3. [Generating native assets](#3-generating-native-assets)
4. [Android native setup](#4-android-native-setup)
5. [iOS native setup](#5-ios-native-setup)
6. [Animated splash component](#6-animated-splash-component)
7. [App.tsx integration](#7-apptsx-integration)
8. [Generator asset paths](#8-generator-asset-paths)
9. [Customising the animation](#9-customising-the-animation)
10. [Common errors & fixes](#10-common-errors--fixes)

---

## 1. Overview

`react-native-bootsplash` v7 provides a native splash screen that is shown before the JS
bundle loads, then hidden via a JS-controlled animation.

Key architecture:

- The **native** splash screen (BootTheme / BootSplash storyboard) shows immediately on launch
- The JS `useHideAnimation()` hook receives a callback (`animate`) when it's ready to hide
- The `animate` callback triggers your custom Reanimated animation
- After the animation, `onAnimationEnd` is called to unmount the overlay component in React

This project uses a **custom animated overlay** (`AnimatedBootSplash.tsx`) that shows the
Merck M logo with a spring entrance + pulse + fade-out sequence.

---

## 2. Package installation

```bash
yarn add react-native-bootsplash
# or
npm install react-native-bootsplash

# iOS — reinstall pods after adding the package
cd ios && bundle exec pod install && cd ..
```

**Generator** (to produce native assets from an SVG/PNG logo):

```bash
npx react-native-bootsplash generate \
  --platforms=android,ios \
  --background=#ffffff \
  --logo-width=185 \
  assets/bootsplash_logo.svg
```

> **Note:** `--logo-width` must be ≤ 192 for Android (192dp is the max drawable size).
> The generator rounds to even numbers — use 184 or 185 to stay safe.

---

## 3. Generating native assets

Run the generator from the project root:

```bash
npx react-native-bootsplash generate \
  --platforms=android,ios \
  --background=#ffffff \
  --logo-width=185 \
  assets/bootsplash_logo.svg
```

**Generated output:**

```
android/app/src/main/res/
  drawable/bootsplash_logo.xml           (vector drawable)
  drawable-mdpi/bootsplash_logo.png
  drawable-hdpi/bootsplash_logo.png
  drawable-xhdpi/bootsplash_logo.png
  drawable-xxhdpi/bootsplash_logo.png
  drawable-xxxhdpi/bootsplash_logo.png
  values/colors.xml                      (adds bootsplash_background color)
  values/styles.xml                      (adds BootTheme style)

ios/TodoAppRN/
  BootSplash.storyboard
  Images.xcassets/BootSplashLogo.imageset/
    Contents.json
    bootsplash_logo.png
    bootsplash_logo@2x.png
    bootsplash_logo@3x.png

assets/bootsplash/
  manifest.json
  logo.png
  logo@2x.png
  logo@3x.png
```

The generator also writes to `assets/bootsplash/`. You must **copy these to `src/assets/bootsplash/`**
because the `@assets` babel alias resolves to `./src/assets/`:

```bash
mkdir -p src/assets/bootsplash
cp assets/bootsplash/manifest.json src/assets/bootsplash/
cp assets/bootsplash/logo*.png src/assets/bootsplash/
```

---

## 4. Android native setup

### 4.1 styles.xml

The generator creates `android/app/src/main/res/values/styles.xml` with:

```xml
<style name="BootTheme" parent="Theme.BootSplash">
    <item name="bootSplashBackground">@color/bootsplash_background</item>
    <item name="bootSplashLogo">@drawable/bootsplash_logo</item>
    <item name="postBootSplashTheme">@style/AppTheme</item>
</style>
```

### 4.2 colors.xml

The generator appends `bootsplash_background` to `colors.xml`. Minimum required content:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="white">#FFFFFF</color>
    <color name="bootsplash_background">#ffffff</color>
</resources>
```

### 4.3 AndroidManifest.xml — BootTheme on `<activity>`

The `BootTheme` must go on `<activity>`, **not** `<application>`:

```xml
<application
  android:theme="@style/AppTheme">   <!-- AppTheme on application -->

  <activity
    android:name=".MainActivity"
    android:theme="@style/BootTheme">  <!-- BootTheme on activity -->
```

The `postBootSplashTheme` attribute in `BootTheme` switches the activity theme to `AppTheme`
automatically once the splash transitions out.

### 4.4 No Java/Kotlin changes needed

`react-native-bootsplash` v7 is fully auto-linked. There are no changes to `MainActivity.kt`
or `MainApplication.kt`.

---

## 5. iOS native setup

### 5.1 AppDelegate.swift

With RN 0.83.1's new `RCTReactNativeFactory` pattern, add the bootsplash init call
**after** `factory.startReactNative()`:

```swift
import UIKit
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash   // ← ADD THIS IMPORT

@main
class AppDelegate: RCTAppDelegate {

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.automaticallyLoadReactNativeWindow = false
    let factory = RCTReactNativeFactory(configuration: .init(self))
    factory.configuration.reactNativeWindowMaker = defaultReactNativeWindowMaker(forFactory:)
    factory.startReactNative(withFactory: factory, launchOptions: launchOptions)

    // ← ADD THIS after startReactNative
    RNBootSplash.initWithStoryboard(
      "BootSplash",
      rootView: window?.rootViewController?.view
    )

    return true
  }
}
```

**Why `window?.rootViewController?.view`?**

In the new factory pattern there is no direct `rootView` reference. After `startReactNative()`
the window and its root view controller are set up, so `window?.rootViewController?.view`
gives the correct `UIView?` reference. `RNBootSplash.initWithStoryboard` accepts `UIView? _Nullable`.

### 5.2 Xcode project — add BootSplash.storyboard

The generator creates `ios/TodoAppRN/BootSplash.storyboard`. You need to add it to
the Xcode project target manually (or it will be excluded from the build):

1. Open `ios/TodoAppRN.xcworkspace` in Xcode
2. Right-click the `TodoAppRN` group in the Project Navigator
3. Choose **Add Files to "TodoAppRN"…**
4. Select `BootSplash.storyboard`
5. Make sure **Add to targets: TodoAppRN** is checked
6. Click **Add**

---

## 6. Animated splash component

**File:** `src/components/splash/AnimatedBootSplash.tsx`

```typescript
import React, { useCallback } from 'react';
import Animated, {
  runOnJS,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import BootSplash from 'react-native-bootsplash';

// Paths must point to src/assets/bootsplash/ (not assets/bootsplash/)
const manifest = require('@assets/bootsplash/manifest.json');
const logoSrc = require('@assets/bootsplash/logo.png');

interface Props {
  onAnimationEnd: () => void;
}

export default function AnimatedBootSplash({ onAnimationEnd }: Props) {
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);

  const runExitAnimation = useCallback(() => {
    // Phase 1 — entrance spring (logo fades + scales in)
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    logoOpacity.value = withTiming(1, { duration: 300 });

    // Phase 2 — pulse + scale down (starts after 400 ms hold)
    logoScale.value = withDelay(
      400,
      withSequence(
        withTiming(1.08, { duration: 150 }),
        withTiming(0.6, { duration: 500 }),
      ),
    );

    // Phase 3 — fade out logo + container
    logoOpacity.value = withDelay(550, withTiming(0, { duration: 500 }));
    containerOpacity.value = withDelay(
      600,
      withTiming(0, { duration: 500 }, () => {
        runOnJS(onAnimationEnd)();
      }),
    );
  }, [containerOpacity, logoScale, logoOpacity, onAnimationEnd]);

  const { container, logo } = BootSplash.useHideAnimation({
    manifest,
    logo: logoSrc,
    ready: true,
    animate: runExitAnimation,
  });

  return (
    <Animated.View
      {...container}
      style={[container.style, { opacity: containerOpacity }]}
    >
      <Animated.Image
        {...logo}
        style={[
          logo.style,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
        fadeDuration={0}
      />
    </Animated.View>
  );
}
```

### Animation sequence

| Time (ms) | Event                                         |
| --------- | --------------------------------------------- |
| 0         | Component mounts; `animate` callback fires    |
| 0–300     | Logo fades in + springs from 0.85 → 1.0 scale |
| 0–400     | Hold at full scale                            |
| 400–550   | Pulse: scale 1.0 → 1.08                       |
| 550–1050  | Scale 1.08 → 0.6 (exit shrink)                |
| 550–1050  | Logo opacity 1 → 0                            |
| 600–1100  | Container opacity 1 → 0                       |
| ~1100     | `onAnimationEnd` fires; component unmounts    |

---

## 7. App.tsx integration

```typescript
import AnimatedBootSplash from '@components/splash/AnimatedBootSplash';

function App() {
  const [splashVisible, setSplashVisible] = useState(true);

  const handleSplashAnimationEnd = useCallback(() => {
    setSplashVisible(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* ... all other providers ... */}
      <Toast config={toastConfig} />
      {splashVisible && (
        <AnimatedBootSplash onAnimationEnd={handleSplashAnimationEnd} />
      )}
    </QueryClientProvider>
  );
}
```

**Key points:**

- `AnimatedBootSplash` is rendered **outside** all navigation/theme providers at the very end of
  the render tree — this ensures it sits on top of everything
- It is wrapped in a conditional (`splashVisible`) so it unmounts completely after the animation,
  freeing the memory for logo images and shared values
- Do **not** call `BootSplash.hide()` directly anywhere — `useHideAnimation` manages the native
  hide internally when `ready: true`

---

## 8. Generator asset paths

The generator places JS assets in `assets/bootsplash/` (project root level).
The `@assets` Babel alias resolves to `src/assets/`. You must copy the assets:

```bash
# After running the generator:
mkdir -p src/assets/bootsplash
cp assets/bootsplash/manifest.json src/assets/bootsplash/
cp assets/bootsplash/logo.png      src/assets/bootsplash/
cp assets/bootsplash/logo@2x.png   src/assets/bootsplash/
cp assets/bootsplash/logo@3x.png   src/assets/bootsplash/
```

Or add `assets/bootsplash/` to Metro's `watchFolders` in `metro.config.js` as an alternative.

---

## 9. Customising the animation

### Change logo size

Re-run the generator with a different `--logo-width`. Max for Android is 192dp.
Re-copy assets to `src/assets/bootsplash/` after regenerating.

### Change background colour

```bash
npx react-native-bootsplash generate \
  --background=#1a1a2e \
  --logo-width=185 \
  assets/bootsplash_logo.svg
```

Then update `colors.xml` → `bootsplash_background` to match.

### Faster / slower animation

Edit the `duration` and `withDelay` values in `AnimatedBootSplash.tsx`.
The numbers in section 6's animation table show which values control each phase.

### Different logo source

Replace `assets/bootsplash_logo.svg` with your new SVG and re-run the generator.
Keep the filename the same or update the `require()` paths in `AnimatedBootSplash.tsx`.

---

## 10. Common errors & fixes

| Error                                             | Cause                                                         | Fix                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `⚠ Logo size exceeding 192×192dp`                 | `--logo-width` > 192                                          | Use `--logo-width=185` or smaller                                    |
| `None of these files exist: manifest.json`        | Assets in `assets/` not copied to `src/assets/`               | Copy to `src/assets/bootsplash/` (see section 8)                     |
| White screen flicker before splash                | BootTheme on `<application>` instead of `<activity>`          | Move `android:theme="@style/BootTheme"` to `<activity>` block        |
| iOS splash not showing                            | `BootSplash.storyboard` not added to Xcode target             | Add file to target in Xcode (see section 5.2)                        |
| `RNBootSplash: initWithStoryboard was not called` | Missing `RNBootSplash.initWithStoryboard(...)` in AppDelegate | Add the call after `factory.startReactNative(...)`                   |
| Splash hides immediately, no animation            | `ready: true` passed before component is ready                | Component always passes `ready: true`; check `animate` callback runs |
| `Cannot read property 'useHideAnimation'`         | Package not installed or Metro cache stale                    | `npm install && npm run nps_start`                                   |

---

_Last updated: 2026-03-20 | react-native-bootsplash v7 | RN 0.83.1 | New Architecture_
