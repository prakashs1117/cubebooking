# App Rebranding Guide

> Change app name, bundle ID, and version number across iOS and Android in one command.

---

## Table of Contents

1. [Overview](#1-overview)
2. [What Gets Changed](#2-what-gets-changed)
3. [Quick Start](#3-quick-start)
4. [Interactive Mode](#4-interactive-mode)
5. [Flag Mode](#5-flag-mode)
6. [Dry-Run Mode](#6-dry-run-mode)
7. [Field Reference](#7-field-reference)
8. [After Running the Script](#8-after-running-the-script)
9. [Firebase Bundle ID Change](#9-firebase-bundle-id-change)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Overview

The `rebrand.js` script in `scripts/` patches every file in the project that holds the app name, bundle ID, or version number. One command replaces all of them consistently — no manual hunting across Xcode, Gradle, and plists.

**Script location:** `scripts/rebrand.js`

---

## 2. What Gets Changed

The script touches exactly these files and fields:

| File                                          | Field(s) Changed                                                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `android/app/build.gradle`                    | `applicationId`, `versionName`, `versionCode`                                                              |
| `android/app/src/main/res/values/strings.xml` | `app_name` (launcher display name)                                                                         |
| `android/app/google-services.json`            | `package_name`                                                                                             |
| `ios/TodoAppRN/Info.plist`                    | `CFBundleDisplayName`                                                                                      |
| `ios/TodoAppRN.xcodeproj/project.pbxproj`     | `PRODUCT_BUNDLE_IDENTIFIER`, `MARKETING_VERSION`, `CURRENT_PROJECT_VERSION` (both Debug & Release targets) |
| `ios/GoogleService-Info.plist`                | `BUNDLE_ID`                                                                                                |
| `package.json`                                | `name`, `version`                                                                                          |

Nothing else is touched. Source code, navigation, assets, and Firebase project config are left as-is.

---

## 3. Quick Start

```bash
# Interactive — prompts for each value
npm run rebrand

# One-liner with all values
npm run rebrand -- \
  --app-name    "My App Name"       \
  --bundle-id   "com.company.myapp" \
  --version     "2.0.0"             \
  --build-number 10

# Preview changes without writing anything
npm run rebrand:dry
```

---

## 4. Interactive Mode

Run with no flags and the script will prompt you for each value. The current project value is shown in brackets — press **Enter** to keep it unchanged.

```
npm run rebrand
```

Example session:

```
╔══════════════════════════════════════╗
║       RN App Rebrand Wizard          ║
╚══════════════════════════════════════╝

ℹ  Detected current values:
   App Name    : TodoAppRN
   Bundle ID   : com.merck.ocb
   Version     : 1.0
   Build Number: 1

Current values shown in brackets. Press Enter to keep them.

  App Name        [TodoAppRN]: Pharma Connect
  Bundle ID       [com.merck.ocb]: com.merck.pharmaconnect
  Version         [1.0]: 2.0.0
  Build Number    [1]: 10

Changes to apply:
   App Name     : TodoAppRN  →  Pharma Connect
   Bundle ID    : com.merck.ocb  →  com.merck.pharmaconnect
   Version      : 1.0  →  2.0.0
   Build Number : 1  →  10

  Proceed? (y/N): y
```

You will always see a summary and be asked to confirm before anything is written.

---

## 5. Flag Mode

Pass any combination of flags to skip the prompts entirely. Omit any flag to leave that value unchanged.

```bash
# Change only the version and build number (keep name and bundle ID)
npm run rebrand -- --version "1.5.0" --build-number 5

# Change only the app display name
npm run rebrand -- --app-name "Pharma Connect"

# Change everything
npm run rebrand -- \
  --app-name    "Pharma Connect"      \
  --bundle-id   "com.merck.pharma"    \
  --version     "3.0.0"               \
  --build-number 20
```

Flag mode does **not** ask for confirmation — it applies changes immediately. Run `--dry-run` first if you want to preview.

---

## 6. Dry-Run Mode

Add `--dry-run` to preview every change without writing a single file. Safe to run at any time.

```bash
# Preview only — nothing is modified
npm run rebrand:dry

# Preview with specific values
npm run rebrand -- \
  --app-name "Test Build" \
  --bundle-id "com.merck.test" \
  --dry-run
```

The output shows exactly which file, which field, and what the old/new value would be:

```
▶  Android
   build.gradle  applicationId
     − com.merck.ocb
     + com.merck.pharmaconnect
   ...

⚠  Dry-run complete — no files were modified
```

---

## 7. Field Reference

### App Name — `--app-name`

The visible name shown on the device home screen and in app stores.

- Spaces are allowed: `"Pharma Connect"` is valid
- For `package.json` the name is auto-converted to no-spaces format (`PharmaConnect`)
- Updates both the Android launcher label and iOS display name

### Bundle ID — `--bundle-id`

The unique identifier used by the App Store, Play Store, Firebase, and push notifications.

**Format rules:**

- Reverse-domain notation: `com.company.appname`
- Lowercase letters, numbers, and dots only
- Minimum two segments: `com.myapp` ✓ — `myapp` ✗
- No hyphens or underscores

```bash
# Valid examples
--bundle-id "com.merck.pharmaconnect"
--bundle-id "com.acme.events"

# Invalid — will error
--bundle-id "MyApp"                  # no dots
--bundle-id "com.my-app"             # hyphen not allowed
--bundle-id "Com.Merck.App"          # uppercase not allowed
```

### Version — `--version`

The marketing version shown to users in app stores.

- Must be three-part semver: `MAJOR.MINOR.PATCH`
- Examples: `1.0.0`, `2.3.1`, `10.0.0`

### Build Number — `--build-number`

An integer that increments with each submitted build. App stores require this to be higher than the previous submission.

- Must be a positive integer: `1`, `42`, `100`
- Maps to `versionCode` on Android and `CURRENT_PROJECT_VERSION` on iOS

---

## 8. After Running the Script

### Android

```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..
npm run android
```

Or to generate a release APK:

```bash
npm run generate-apk
```

### iOS

After changing bundle ID you **must** re-run CocoaPods before building:

```bash
bundle exec pod install
npm run ios
```

If Xcode is open, close it and reopen the workspace (`ios/TodoAppRN.xcworkspace`) after pod install.

---

## 9. Firebase Bundle ID Change

If you changed the **bundle ID** to one registered under a different Firebase project, the existing `google-services.json` and `GoogleService-Info.plist` will be pointing to the wrong project. The script updates the bundle ID field inside those files but cannot change the Firebase project credentials.

**Steps to fix:**

1. Open the [Firebase Console](https://console.firebase.google.com)
2. Select (or create) the correct project
3. Go to **Project Settings → Your apps**
4. Download the fresh `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
5. Replace the files:
   ```
   android/app/google-services.json
   ios/GoogleService-Info.plist
   ```

If you are only incrementing a version number or renaming the display name (same bundle ID, same Firebase project), no Firebase action is needed.

---

## 10. Troubleshooting

### "Bundle ID is invalid"

The bundle ID format check failed. Use lowercase reverse-domain format with no hyphens: `com.company.app`.

### "Version must be semver format"

Version must be exactly `X.Y.Z` with three numeric segments. `1.0` is not accepted — use `1.0.0`.

### "Build number must be a positive integer"

Build number must be a whole number ≥ 1. Do not use `1.0` or a string.

### iOS build still shows old name after script ran

Xcode caches derived data. Clean the build folder in Xcode (**Product → Clean Build Folder**, ⇧⌘K) then rebuild.

### Android launcher still shows old name

Uninstall the app from the device/emulator first, then re-run `npm run android`. The launcher name is cached by the OS.

### Script says "Nothing to change"

The values you passed are identical to what is already in the project files. Double-check the current values shown in the output.

### I only want to update one platform

The script updates both platforms together to keep them in sync. If you genuinely need to change only one, edit the relevant file directly:

- Android name: `android/app/src/main/res/values/strings.xml`
- iOS name: `ios/TodoAppRN/Info.plist` → `CFBundleDisplayName`
- Android bundle ID: `android/app/build.gradle` → `applicationId`
- iOS bundle ID: `ios/TodoAppRN.xcodeproj/project.pbxproj` → `PRODUCT_BUNDLE_IDENTIFIER`

---

_Script source: `scripts/rebrand.js`_
