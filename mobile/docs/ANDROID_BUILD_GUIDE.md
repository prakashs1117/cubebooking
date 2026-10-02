# Android APK Build Guide

## Prerequisites

- Node.js (LTS)
- Java JDK 17
- Android Studio + Android SDK
- `ANDROID_HOME` environment variable set

---

## Keystore Setup (already done — do not repeat)

The release keystore is already in place:

| Item            | Value                         |
| --------------- | ----------------------------- |
| Keystore file   | `config/merck_ocb.keystore`   |
| Key alias       | `your_key_alias`              |
| Properties file | `android/keystore.properties` |

`android/keystore.properties` is gitignored. If it gets lost or you're on a new machine, recreate it:

```properties
storeFile=../../config/merck_ocb.keystore
storePassword=<password>
keyAlias=your_key_alias
keyPassword=<password>
```

> **Keep the keystore and passwords backed up securely.** Losing the keystore means you can never push updates to the same Play Store listing.

---

## Generate Release APK (for sharing / QA)

```bash
npm run generate-apk
```

Or manually:

```bash
cd android && ./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## Generate Release AAB (for Play Store upload)

Google Play requires AAB format instead of APK.

```bash
cd android && ./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Debug APK (quick install, no keystore needed)

```bash
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Clean Build (if build fails or cached state is stale)

```bash
npm run android-cache-clear
# or
cd android && ./gradlew clean
```

Then run the build again.

---

## Installing the APK on a Device

1. Transfer the APK to the device (email, Google Drive, USB, etc.)
2. On the Android device: **Settings → Security → Install from unknown sources** → enable
3. Open the APK file to install

---

## Common Issues

| Issue                             | Fix                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `SDK location not found`          | Set `ANDROID_HOME` or create `android/local.properties` with `sdk.dir=/path/to/sdk`              |
| `Could not find tools.jar`        | Use JDK 17, not JDK 21+                                                                          |
| `Keystore file not found`         | Check `android/keystore.properties` — `storeFile` path must point to `config/merck_ocb.keystore` |
| `Keystore password was incorrect` | Verify the password in `android/keystore.properties`                                             |
| `Gradle build failed`             | Run `./gradlew clean` then retry                                                                 |
| Build hangs / metro error         | Run `npx react-native start --reset-cache` in a separate terminal first                          |

---

## Relevant Files

| File                            | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `android/keystore.properties`   | Signing credentials (gitignored — never commit) |
| `config/merck_ocb.keystore`     | Release keystore binary                         |
| `android/app/build.gradle`      | Signing config wired to `keystore.properties`   |
| `package.json` → `generate-apk` | Shortcut script for `./gradlew assembleRelease` |
