# Android Native Setup Guide

### React Native 0.83.1 · New Architecture · Firebase · Fresh android/ folder

> **Use this guide whenever you replace or scaffold a fresh `android/` folder**
> for any React Native 0.83.1 project. Every section maps to a concrete file change.

---

## Table of Contents

1. [When you need this guide](#1-when-you-need-this-guide)
2. [Prerequisites & package requirements](#2-prerequisites--package-requirements)
3. [Phase 0 — Project-level build.gradle](#3-phase-0--project-level-buildgradle)
4. [Phase 1 — App-level build.gradle](#4-phase-1--app-level-buildgradle)
5. [Phase 2 — gradle.properties](#5-phase-2--gradleproperties)
6. [Phase 3 — AndroidManifest.xml](#6-phase-3--androidmanifestxml)
7. [Phase 4 — Kotlin native files](#7-phase-4--kotlin-native-files)
8. [Phase 5 — Firebase google-services.json](#8-phase-5--firebase-google-servicesjson)
9. [Phase 6 — colors.xml](#9-phase-6--colorsxml)
10. [Common build errors & fixes](#10-common-build-errors--fixes)
11. [Build & verify checklist](#11-build--verify-checklist)
12. [Network debugging on Android emulator](#12-network-debugging-on-android-emulator)
13. [Key decisions explained](#13-key-decisions-explained)

---

## 1. When you need this guide

- You replaced `android/` with a fresh RN-generated folder
- You scaffolded a new RN 0.83+ project and need Firebase + third-party libs
- The existing `android/` folder has a broken Gradle or compilation error you can't fix

---

## 2. Prerequisites & package requirements

These packages require native Android changes. Auto-linked ones need no extra code
but require minSdk ≥ 24 and New Architecture enabled.

| Package                                     | What it needs                                               |
| ------------------------------------------- | ----------------------------------------------------------- |
| `@react-native-firebase/app`                | Google Services classpath + plugin + `google-services.json` |
| `@react-native-firebase/auth`               | Auto-linked via Firebase app                                |
| `@react-native-firebase/firestore`          | Auto-linked via Firebase app                                |
| `@react-native-firebase/messaging`          | FCM service in manifest + POST_NOTIFICATIONS                |
| `@react-native-async-storage/async-storage` | `AsyncStorage_db_size_in_MB` in gradle.properties           |
| `@react-native-community/netinfo`           | `ACCESS_NETWORK_STATE` permission                           |
| `react-native-screens`                      | `super.onCreate(null)` in MainActivity                      |
| `react-native-reanimated`                   | Plugin last in babel.config.js                              |
| `react-native-bootsplash`                   | BootTheme in AndroidManifest + drawable assets              |
| All others                                  | Fully auto-linked — no extra changes                        |

---

## 3. Phase 0 — Project-level build.gradle

**File:** `android/build.gradle`

```groovy
buildscript {
    ext {
        buildToolsVersion = "36.0.0"
        minSdkVersion = 24          // MUST be 24 for Firebase
        compileSdkVersion = 36
        targetSdkVersion = 36
        ndkVersion = "27.1.12297006"
        kotlinVersion = "2.1.20"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
        classpath("com.google.gms:google-services:4.4.2")   // ← ADD THIS
    }
}

apply plugin: "com.facebook.react.rootproject"
```

**Why:** The Google Services classpath is required for the `google-services` plugin
in `app/build.gradle` to process `google-services.json` and wire Firebase SDK init.

---

## 4. Phase 1 — App-level build.gradle

**File:** `android/app/build.gradle`

```groovy
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
// NOTE: do NOT apply google-services here at the top — it must go at the BOTTOM

react {
    autolinkLibrariesWithApp()
}

def enableProguardInReleaseBuilds = false
def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.yourapp"       // code namespace — can differ from applicationId
    defaultConfig {
        applicationId "com.your.firebase.package"  // must match google-services.json
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        multiDexEnabled true                          // ← required for Firebase
        manifestPlaceholders = [usesCleartextTraffic: "true"]  // ← for HTTP dev API
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug { signingConfig signingConfigs.debug }
        release {
            signingConfig signingConfigs.debug   // replace with release keystore for production
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    implementation("androidx.multidex:multidex:2.0.1")   // ← required by multiDexEnabled

    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}

// MUST be last — Google Services plugin reads google-services.json
apply plugin: "com.google.gms.google-services"
```

### Critical notes

| Setting                                                        | Why                                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `namespace` vs `applicationId`                                 | `namespace` = Kotlin package prefix for `R` class. `applicationId` = Play Store / Firebase app ID. They can be different. |
| `multiDexEnabled true`                                         | Firebase + other libraries exceed Android's 64K method limit. Without this, the app crashes at launch.                    |
| `apply plugin: "com.google.gms.google-services"` at **bottom** | Google's requirement — it must process after the `android {}` block is evaluated.                                         |
| `manifestPlaceholders`                                         | Resolves `${usesCleartextTraffic}` in AndroidManifest. Without it, Android silently blocks all HTTP requests.             |

---

## 5. Phase 2 — gradle.properties

**File:** `android/gradle.properties`

Add these if missing:

```properties
# New Architecture — required for Reanimated 4 + Worklets
newArchEnabled=true

# Hermes JS engine
hermesEnabled=true

# AsyncStorage SQLite DB size (default is too small for large datasets)
AsyncStorage_db_size_in_MB=6

# Edge-to-edge (disable unless you explicitly handle system bar insets)
edgeToEdgeEnabled=false
```

---

## 6. Phase 3 — AndroidManifest.xml

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Core network permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Firebase Cloud Messaging -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme"
      android:usesCleartextTraffic="${usesCleartextTraffic}"
      android:supportsRtl="true">

      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true"
        android:theme="@style/BootTheme">   <!-- BootSplash theme on activity, not application -->
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>

      <!-- Firebase Messaging Service -->
      <service
        android:name="io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService"
        android:exported="false">
        <intent-filter>
          <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
      </service>

      <meta-data
        android:name="com.google.firebase.messaging.default_notification_icon"
        android:resource="@mipmap/ic_launcher" />
      <meta-data
        android:name="com.google.firebase.messaging.default_notification_color"
        android:resource="@color/white" />

    </application>
</manifest>
```

### Manifest checklist

- `android:theme="@style/BootTheme"` goes on the **`<activity>`**, not `<application>` — the app theme stays `AppTheme`
- `${usesCleartextTraffic}` is injected from `manifestPlaceholders` in `build.gradle`
- `POST_NOTIFICATIONS` is required for Android 13+ push notifications

---

## 7. Phase 4 — Kotlin native files

### MainActivity.kt

**File:** `android/app/src/main/java/com/<package>/MainActivity.kt`

```kotlin
package com.yourapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    // MUST match AppRegistry.registerComponent name in index.js / app.json
    override fun getMainComponentName(): String = "YourAppName"

    override fun onCreate(savedInstanceState: Bundle?) {
        // Pass null — prevents react-native-screens crash on fragment state restoration
        super.onCreate(null)
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
```

**Critical:** `getMainComponentName()` must return the **exact same string** as the
first argument to `AppRegistry.registerComponent()` in `index.js`.

```js
// index.js
import { name as appName } from './app.json';
AppRegistry.registerComponent(appName, () => App);

// app.json
{ "name": "YourAppName" }   // ← must match getMainComponentName()
```

### MainApplication.kt

**File:** `android/app/src/main/java/com/<package>/MainApplication.kt`

For **RN 0.83.1** (new API — use this, not the older `DefaultReactNativeHost` pattern):

```kotlin
package com.yourapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages.apply {
                // Manual packages (rarely needed with auto-linking)
                // add(MyCustomPackage())
            },
        )
    }

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)   // handles SoLoader + New Arch init
    }
}
```

> **Note:** `loadReactNative` is the RN 0.83.1 replacement for the older
> `SoLoader.init()` + `DefaultNewArchitectureEntryPoint.load()` pattern.
> Do NOT mix them.

---

## 8. Phase 5 — Firebase google-services.json

```bash
# Project stores the config in config/eva/ — copy it with this script
npm run copy-firebase-android-files
```

Verify the file is at **exactly this path** — not root, not android/:

```
android/app/google-services.json   ✓
android/google-services.json       ✗
google-services.json               ✗
```

The `applicationId` in `build.gradle` must match `package_name` in `google-services.json`:

```bash
# Quick check — prints the package name from the json
node -e "const d=require('./android/app/google-services.json'); d.client.forEach(c=>console.log(c.client_info.android_client_info.package_name))"
```

---

## 9. Phase 6 — colors.xml

**File:** `android/app/src/main/res/values/colors.xml`

The fresh android folder may delete this. Recreate it — at minimum it needs `white`
(referenced by FCM notification color meta-data) and bootsplash color:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="white">#FFFFFF</color>
    <color name="bootsplash_background">#ffffff</color>
</resources>
```

`bootsplash_background` is added automatically when you run the bootsplash generator.
If not using bootsplash yet, just keep `white`.

---

## 10. Common build errors & fixes

| Error                                                    | Root Cause                                                           | Fix                                                                            |
| -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `No matching client found for package name 'com.xxx'`    | `applicationId` in build.gradle doesn't match `google-services.json` | Check actual package name: `node -e "..."` (see Phase 5)                       |
| `google-services.json file is missing`                   | File in wrong directory                                              | Run `npm run copy-firebase-android-files`                                      |
| `Cannot fit requested classes in a single dex file`      | 64K method limit hit                                                 | Add `multiDexEnabled true` + `multidex` dependency                             |
| `Invariant Violation: "appname" has not been registered` | `getMainComponentName()` ≠ `AppRegistry.registerComponent` name      | Match the string in `MainActivity.kt` to `app.json` name                       |
| `AxiosError: Network Error` on emulator                  | `localhost` used in API URL                                          | Change to `10.0.2.2` (emulator's alias for host machine)                       |
| `AxiosError: Network Error` (HTTP blocked)               | `usesCleartextTraffic` unresolved                                    | Add `manifestPlaceholders = [usesCleartextTraffic: "true"]` to `defaultConfig` |
| `SplashScreen.show() not found`                          | Old react-native-splash-screen removed                               | Use react-native-bootsplash instead                                            |
| Reanimated worklet crash                                 | Plugin not last in babel                                             | Move `react-native-reanimated/plugin` to last position in `plugins[]`          |
| `Task :app:processDebugGoogleServices FAILED`            | google-services.json wrong path                                      | Must be at `android/app/google-services.json`                                  |

---

## 11. Build & verify checklist

```bash
# 1. Copy Firebase config
npm run copy-firebase-android-files

# 2. Clean everything
npm run clear_build && npm run clean_gradle

# 3. Reset Metro cache
npm run nps_start     # Ctrl+C once it starts

# 4. Debug build (reveals all errors before device test)
cd android && ./gradlew assembleDebug

# 5. Run on device/emulator
npm run android
```

---

## 12. Network debugging on Android emulator

| Target                             | Address                                    |
| ---------------------------------- | ------------------------------------------ |
| Android emulator → host machine    | `10.0.2.2`                                 |
| Android emulator → itself          | `localhost` / `127.0.0.1`                  |
| Physical device → host (same WiFi) | host machine's LAN IP (e.g. `192.168.1.x`) |

**Update `.env` for emulator:**

```
API_BASE_URL=http://10.0.2.2:3000/api/v1
```

**For physical device**, find your Mac's IP:

```bash
ipconfig getifaddr en0
```

Then use that IP in `.env`. Metro bundler also needs to be reachable:

```bash
adb reverse tcp:8081 tcp:8081   # if USB-connected
```

---

## 13. Key decisions explained

### Why `namespace` ≠ `applicationId`

`namespace` determines the Java/Kotlin package for generated `R` and `BuildConfig`
classes. `applicationId` is the unique Play Store / Firebase app identifier.

Keeping `namespace = "com.todoapp"` (matching the Kotlin files) while setting
`applicationId = "com.merck.ocb"` (matching Firebase) avoids renaming all Kotlin
source files while still connecting to the correct Firebase project.

### Why `super.onCreate(null)`

`react-native-screens` uses Android Fragments internally. If the OS restores a
saved Fragment state (e.g. after memory kill), it can crash on cold launch when
`savedInstanceState` is non-null. Passing `null` skips state restoration and
prevents the crash. This is the official react-native-screens recommendation.

### Why `react-native-splash-screen` was removed

`react-native-splash-screen` v3.x patches `AppCompatActivity` in a way that is
incompatible with React Native New Architecture (Fabric). It causes crashes with
`newArchEnabled=true`. Use `react-native-bootsplash` instead — see
[BOOTSPLASH_GUIDE.md](./BOOTSPLASH_GUIDE.md).

### Why `apply plugin: "com.google.gms.google-services"` is at the bottom

Google's Gradle plugin reads the `android {}` block to determine which build
variants exist. If it runs before the block is parsed, it fails. Placing the
`apply plugin` statement at the end of `build.gradle` guarantees correct ordering.

---

_Last updated: 2026-03-20 | RN 0.83.1 | New Architecture_
