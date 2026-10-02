# Android Build & Branding Setup

## Summary

Configured the Android build pipeline to always include the latest JS bundle, updated app branding assets, fixed the system navigation bar color, and resolved dark mode icon color issues across several screens.

---

## Changes

### 1. APK Build Script Fix (`package.json`)

**Problem:** Running `npm run generate-apk` produced an APK without the latest code changes because the JS bundle was not being regenerated before the Gradle build.

**Fix:** Updated `generate-apk` to run `bundle-android` first:

```json
"generate-apk": "npm run bundle-android && cd android && ./gradlew assembleRelease"
```

**Usage:**

```bash
npm run generate-apk
```

This now bundles all latest JS/TS → `android/app/src/main/assets/index.android.bundle`, then assembles the release APK at `android/app/build/outputs/apk/release/app-release.apk`.

---

### 2. Splash Screen (`react-native-bootsplash`)

Generated new splash screen assets from `android/splash.png` (512×512 PNG) using:

```bash
npx react-native-bootsplash generate \
  --platforms android \
  --background "#ffffff" \
  --logo-width 120 \
  android/splash.png
```

Files updated:

- `android/app/src/main/res/drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/bootsplash_logo.png`
- `assets/bootsplash/logo.png` + `logo@{1.5x,2x,3x,4x}.png`
- `assets/bootsplash/manifest.json`

---

### 3. App Launcher Icons

Replaced `ic_launcher.png` and `ic_launcher_round.png` across all mipmap densities:

- `android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/`

---

### 4. Android Navigation Bar Color (`styles.xml`)

**Problem:** A white strip was visible below the purple tab bar on Android — the system navigation bar defaulted to white.

**Fix:** Added `navigationBarColor` to `AppTheme` in `android/app/src/main/res/values/styles.xml`:

```xml
<item name="android:navigationBarColor">#3D1A8E</item>
```

This matches the brand purple tab bar so the bottom of the screen appears seamless.

---

### 5. `.gitignore` Updates

Added rules to prevent build artifacts from being committed:

```
# Android bundle artifacts
android/app/src/main/assets/index.android.bundle
android/app/src/main/assets/index.android.map

# Android assets copied from node_modules and src during bundle-android
android/app/src/main/res/drawable-*/node_modules_*
android/app/src/main/res/drawable-*/src_assets_*
```

---

### 6. Dark Mode Icon Color Fixes

Fixed hardcoded `BaseColors.merckPurple` icon/text colors that were invisible in dark mode. Pattern applied: `isDark ? BaseColors.white : BaseColors.merckPurple`.

Files fixed:

- `src/components/events/EventListItem.tsx` — calendar icon
- `src/components/events/UpcomingEventsCarousel.tsx` — calendar icon
- `src/screens/ArticleDetailScreen.tsx` — FavouriteStatusCard label/chevron, QuickLinkButton icons, material badge text
- `src/screens/MoreListScreen.tsx` — added `paddingTop: 10` to root container

---

### 7. UI Cleanup

- `src/screens/FavoritesScreen.tsx` — removed `RecentSearchesStrip` section
- `src/components/common/SearchTags.tsx` — removed "Clear All" button from recent searches header

---

## Commits

| Hash       | Message                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| `c571ebe2` | chore: update Android branding, fix APK build script, and clean up gitignore |
| `e389f7c8` | fix: dark mode icon colors and UI cleanup across screens                     |
