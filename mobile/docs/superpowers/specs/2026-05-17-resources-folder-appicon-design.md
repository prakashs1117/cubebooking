# Resources Folder & App Icon Script Design

**Date:** 2026-05-17  
**Status:** Approved

---

## Context

The mobile project currently stores brand assets (app icons, splash, fonts, store images) scattered across `assets/AppIcons/`, `assets/bootsplash/`, `assets/fonts/`, and `assets/store/`. A script (`scripts/apply-app-icons.js`) copies icons from `assets/AppIcons/` into the native iOS and Android directories.

The goal is to consolidate all replaceable brand assets into a single, predictable `resources/` folder — making it easy for designers and developers to swap an entire brand set without knowing project internals. The app icon script is updated to read from the new location.

---

## Target Structure

```
mobile/resources/
├── appicon/
│   ├── ios/
│   │   └── AppIcon.appiconset/
│   │       ├── Contents.json
│   │       ├── 20.png
│   │       ├── 29.png
│   │       ├── 40.png
│   │       ├── 50.png
│   │       ├── 57.png
│   │       ├── 58.png
│   │       ├── 60.png
│   │       ├── 72.png
│   │       ├── 76.png
│   │       ├── 80.png
│   │       ├── 87.png
│   │       ├── 100.png
│   │       ├── 114.png
│   │       ├── 120.png
│   │       ├── 144.png
│   │       ├── 152.png
│   │       ├── 167.png
│   │       ├── 180.png
│   │       └── 1024.png
│   └── android/
│       ├── mipmap-mdpi/ic_launcher.png
│       ├── mipmap-hdpi/ic_launcher.png
│       ├── mipmap-xhdpi/ic_launcher.png
│       ├── mipmap-xxhdpi/ic_launcher.png
│       └── mipmap-xxxhdpi/ic_launcher.png
├── splash/
│   ├── logo.png  (+ all resolution variants)
│   └── manifest.json
├── fonts/
│   └── (custom font files)
├── store/
│   ├── appstore.png
│   └── playstore.png
└── README.md
```

---

## What Moves

| From (current)                                        | To (new)                                    |
| ----------------------------------------------------- | ------------------------------------------- |
| `assets/AppIcons/Assets.xcassets/AppIcon.appiconset/` | `resources/appicon/ios/AppIcon.appiconset/` |
| `assets/AppIcons/android/mipmap-*/`                   | `resources/appicon/android/mipmap-*/`       |
| `assets/bootsplash/`                                  | `resources/splash/`                         |
| `assets/fonts/`                                       | `resources/fonts/`                          |
| `assets/store/`                                       | `resources/store/`                          |

`assets/AppIcons/` is deleted after migration. Other contents of `assets/` (e.g., SVG files referenced in code) stay in place.

---

## Script Changes

### `scripts/apply-app-icons.js`

Two path constants change:

- **Default source root:** `assets/AppIcons` → `resources/appicon`
- **iOS source subfolder:** `Assets.xcassets/AppIcon.appiconset/` → `ios/AppIcon.appiconset/`

The `--source=<path>` CLI flag continues to work as an override.

Copy behavior (unchanged):

- iOS: all PNGs + `Contents.json` → `ios/TodoAppRN/Images.xcassets/AppIcon.appiconset/`
- Android: `mipmap-{density}/ic_launcher.png` → `android/app/src/main/res/mipmap-{density}/ic_launcher.png` AND `ic_launcher_round.png` (same file for both)
- Store images: `resources/store/appstore.png` / `playstore.png` → `assets/store/` (if present)

### `scripts/rebrand.js`

Any hardcoded reference to `assets/AppIcons` is updated to `resources/appicon`.

### `package.json`

No changes needed — `npm run apply-icons` command stays the same.

---

## `resources/README.md`

A brief README is added to `resources/` explaining each subfolder so designers know what goes where:

- `appicon/` — App launcher icons. `ios/` for iOS, `android/` for Android. Run `npm run apply-icons` after replacing.
- `splash/` — Boot splash screen assets.
- `fonts/` — Custom font files.
- `store/` — App Store and Play Store listing images.

---

## Migration Steps (Ordered)

1. `mkdir -p resources/appicon/ios resources/appicon/android resources/splash resources/fonts resources/store`
2. Move iOS icons: `assets/AppIcons/Assets.xcassets/AppIcon.appiconset/` → `resources/appicon/ios/AppIcon.appiconset/`
3. Move Android icons: `assets/AppIcons/android/mipmap-*/` → `resources/appicon/android/`
4. Move splash assets: `assets/bootsplash/` contents → `resources/splash/`
5. Move fonts: `assets/fonts/` contents → `resources/fonts/`
6. Move store images: `assets/store/` contents → `resources/store/`
7. Delete `assets/AppIcons/`
8. Update `scripts/apply-app-icons.js` default paths
9. Update `scripts/rebrand.js` path reference
10. Add `resources/README.md`
11. Commit changes

---

## Verification

After migration:

1. Run `npm run apply-icons` — must exit 0 with no errors
2. Verify `ios/TodoAppRN/Images.xcassets/AppIcon.appiconset/` contains all 19 PNGs + `Contents.json`
3. Verify `android/app/src/main/res/mipmap-*/ic_launcher.png` and `ic_launcher_round.png` are present
4. Build iOS: `npm run ios` — confirm icon appears on simulator
5. Build Android: `npm run android` — confirm icon appears on emulator

---

## Files Modified

| File                         | Change                                                    |
| ---------------------------- | --------------------------------------------------------- |
| `scripts/apply-app-icons.js` | Update default source path and iOS subfolder path         |
| `scripts/rebrand.js`         | Update `assets/AppIcons` reference to `resources/appicon` |
| `resources/` (new)           | New folder with all brand assets                          |
| `resources/README.md`        | New file explaining the folder structure                  |
| `assets/AppIcons/`           | Deleted after migration                                   |
| `assets/bootsplash/`         | Deleted after migration (contents moved)                  |
| `assets/fonts/`              | Deleted after migration (contents moved)                  |
| `assets/store/`              | Deleted after migration (contents moved)                  |
