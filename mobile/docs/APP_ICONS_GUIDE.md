# App Icons Guide

### Customizable App Icons for React Native — Android & iOS

> **Use this guide whenever you need to swap app icons for a different client, brand, or app
> variant.** A single script replaces all Android density icons and iOS xcassets icons in one run.

---

## Table of Contents

1. [Quick start](#1-quick-start)
2. [Folder layout](#2-folder-layout)
3. [What the script does](#3-what-the-script-does)
4. [Changing icons for a different client or brand](#4-changing-icons-for-a-different-client-or-brand)
5. [Android icon density reference](#5-android-icon-density-reference)
6. [iOS icon size reference](#6-ios-icon-size-reference)
7. [Generating icons from a single high-res source](#7-generating-icons-from-a-single-high-res-source)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Quick start

```bash
# Replace all icons from the default source (assets/AppIcons)
npm run apply-icons

# Replace icons from a custom source directory
npm run apply-icons -- --source=assets/ClientB/AppIcons

# Then rebuild the app
npm run android
npm run ios
```

---

## 2. Folder layout

### Default source directory: `assets/AppIcons/`

```
assets/AppIcons/
├── android/
│   ├── mipmap-mdpi/
│   │   └── ic_launcher.png          (48×48)
│   ├── mipmap-hdpi/
│   │   └── ic_launcher.png          (72×72)
│   ├── mipmap-xhdpi/
│   │   └── ic_launcher.png          (96×96)
│   ├── mipmap-xxhdpi/
│   │   └── ic_launcher.png          (144×144)
│   └── mipmap-xxxhdpi/
│       └── ic_launcher.png          (192×192)
├── Assets.xcassets/
│   └── AppIcon.appiconset/
│       ├── Contents.json            (required — declares all sizes to Xcode)
│       ├── 20.png    29.png    40.png    50.png    57.png
│       ├── 58.png    60.png    72.png    76.png    80.png
│       ├── 87.png    100.png   114.png   120.png   144.png
│       ├── 152.png   167.png   180.png
│       └── 1024.png             (App Store listing)
├── playstore.png                    (512×512 — optional Google Play listing)
└── appstore.png                     (1024×1024 — optional App Store listing)
```

### Where icons are copied to

| Platform                | Destination                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| Android (all densities) | `android/app/src/main/res/mipmap-{density}/ic_launcher.png`       |
| Android (round icon)    | `android/app/src/main/res/mipmap-{density}/ic_launcher_round.png` |
| iOS xcassets            | `ios/TodoAppRN/Images.xcassets/AppIcon.appiconset/`               |
| Play Store listing      | `assets/store/playstore.png`                                      |
| App Store listing       | `assets/store/appstore.png`                                       |

---

## 3. What the script does

`scripts/apply-app-icons.js` performs three sequential operations:

1. **Android** — For each of the 5 densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`):

   - Reads `<source>/android/mipmap-<density>/ic_launcher.png`
   - Copies it to both `ic_launcher.png` **and** `ic_launcher_round.png` (same image)
   - Missing source files are skipped with a warning — the build is not blocked

2. **iOS** — Copies `Contents.json` + all 19 declared PNG sizes to the Xcode appiconset directory

3. **Store assets** (optional) — If `playstore.png` or `appstore.png` exist in the source, copies them to `assets/store/`

Terminal output uses colour-coded results:

- `✓ green` — file copied successfully
- `⚠ yellow` — source file not found, skipped
- `✗ red` — source directory missing (fatal)

---

## 4. Changing icons for a different client or brand

### Step 1 — Prepare the icons

Create a folder matching the layout in section 2. Example for a client named "AcmeCorp":

```
assets/AcmeCorp/AppIcons/
├── android/
│   ├── mipmap-mdpi/ic_launcher.png
│   ├── mipmap-hdpi/ic_launcher.png
│   ├── mipmap-xhdpi/ic_launcher.png
│   ├── mipmap-xxhdpi/ic_launcher.png
│   └── mipmap-xxxhdpi/ic_launcher.png
└── Assets.xcassets/
    └── AppIcon.appiconset/
        ├── Contents.json
        └── *.png  (all sizes listed in Contents.json)
```

### Step 2 — Run the script

```bash
npm run apply-icons -- --source=assets/AcmeCorp/AppIcons
```

### Step 3 — Rebuild the app

```bash
# Android
cd android && ./gradlew clean && cd ..
npm run android

# iOS
cd ios && bundle exec pod install && cd ..
npm run ios
```

No native code changes are needed — only the image files are swapped.

---

## 5. Android icon density reference

| Density folder   | Icon size  | Use case                         |
| ---------------- | ---------- | -------------------------------- |
| `mipmap-mdpi`    | 48×48 px   | Low-density screens              |
| `mipmap-hdpi`    | 72×72 px   | Medium-density screens           |
| `mipmap-xhdpi`   | 96×96 px   | High-density screens             |
| `mipmap-xxhdpi`  | 144×144 px | Extra-high-density screens       |
| `mipmap-xxxhdpi` | 192×192 px | Extra-extra-high-density screens |

Both `ic_launcher.png` (square) and `ic_launcher_round.png` (circular crop) reference the same
source image — Android applies a circular mask automatically on supported launchers.

---

## 6. iOS icon size reference

All sizes are declared in `Assets.xcassets/AppIcon.appiconset/Contents.json`. Xcode reads
this file to determine which PNG to use for each context (iPhone, iPad, App Store).

| Filename   | Size (px) | Context                   |
| ---------- | --------- | ------------------------- |
| `20.png`   | 20×20     | iPad notifications        |
| `29.png`   | 29×29     | iPhone settings           |
| `40.png`   | 40×40     | iPhone/iPad notifications |
| `58.png`   | 58×58     | iPhone settings @2x       |
| `60.png`   | 60×60     | iPhone home screen        |
| `76.png`   | 76×76     | iPad home screen          |
| `80.png`   | 80×80     | iPhone/iPad spotlight @2x |
| `87.png`   | 87×87     | iPhone settings @3x       |
| `120.png`  | 120×120   | iPhone home screen @2x    |
| `152.png`  | 152×152   | iPad home screen @2x      |
| `167.png`  | 167×167   | iPad Pro home screen      |
| `180.png`  | 180×180   | iPhone home screen @3x    |
| `1024.png` | 1024×1024 | App Store listing         |

---

## 7. Generating icons from a single high-res source

If you only have one master icon (e.g. a 1024×1024 PNG or an SVG), use a tool to
auto-generate all required sizes before running the script.

### Option A — Online generators

- [appicon.co](https://www.appicon.co/) — paste 1024×1024, download zip with all sizes for
  both platforms in the correct folder structure
- [makeappicon.com](https://makeappicon.com/)

### Option B — ImageMagick (local)

```bash
# Install
brew install imagemagick

# Generate all Android densities from a 1024x1024 master
for size in 48 72 96 144 192; do
  density=$(echo "mdpi hdpi xhdpi xxhdpi xxxhdpi" | cut -d' ' -f$(echo "48 72 96 144 192" | tr ' ' '\n' | grep -n $size | cut -d: -f1))
  convert master.png -resize ${size}x${size} "assets/AppIcons/android/mipmap-${density}/ic_launcher.png"
done
```

### Option C — Sketch / Figma / Illustrator export

1. Create a 1024×1024 artboard with your icon
2. Export to all required PNG sizes
3. Name files according to the layouts in sections 5 and 6
4. Drop into `assets/AppIcons/` folder structure

---

## 8. Troubleshooting

| Problem                                                          | Cause                             | Fix                                                                                           |
| ---------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `Source directory not found`                                     | `--source` path doesn't exist     | Check the path; it's relative to the project root                                             |
| `Source not found, skipped: android/mipmap-mdpi/ic_launcher.png` | Missing density variant in source | Add the missing PNG for that density                                                          |
| Android icon unchanged after rebuild                             | Gradle cache                      | Run `npm run clear_build && npm run clean_gradle`                                             |
| iOS icon unchanged after rebuild                                 | Derived data cache                | In Xcode: Product → Clean Build Folder, then rebuild                                          |
| Round icon is square on Android                                  | Expected — script uses same PNG   | The launcher applies the circular mask; this is correct                                       |
| `Contents.json` missing                                          | Forgot to include it in source    | Copy `Contents.json` from `assets/AppIcons/Assets.xcassets/AppIcon.appiconset/` as a template |

---

_Last updated: 2026-03-20 | Script: `scripts/apply-app-icons.js`_
