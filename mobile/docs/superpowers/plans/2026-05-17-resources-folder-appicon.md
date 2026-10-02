# Resources Folder & App Icon Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate all replaceable brand assets (icons, splash, fonts, store images) into a single `resources/` folder and update `scripts/apply-app-icons.js` to read from the new location.

**Architecture:** Create `mobile/resources/` with four subfolders (`appicon/`, `splash/`, `fonts/`, `store/`), move existing assets into them, then update the two path constants in `apply-app-icons.js`. The `rebrand.js` script does not reference icon paths and requires no changes.

**Tech Stack:** Node.js shell (`mv`, `mkdir`), existing `scripts/apply-app-icons.js`

---

### Task 1: Create the `resources/` directory tree

**Files:**

- Create: `resources/appicon/ios/AppIcon.appiconset/` (directory)
- Create: `resources/appicon/android/` (directory)
- Create: `resources/splash/` (directory)
- Create: `resources/fonts/` (directory)
- Create: `resources/store/` (directory)

- [ ] **Step 1: Create all subdirectories**

```bash
cd /Users/M324550/Documents/POC/merck-design-fusion/mobile
mkdir -p resources/appicon/ios/AppIcon.appiconset
mkdir -p resources/appicon/android
mkdir -p resources/splash
mkdir -p resources/fonts
mkdir -p resources/store
```

Expected: exits 0, no output.

- [ ] **Step 2: Verify directories exist**

```bash
ls resources/
ls resources/appicon/
ls resources/appicon/ios/
```

Expected output:

```
appicon  fonts  splash  store
android  ios
AppIcon.appiconset
```

- [ ] **Step 3: Commit**

```bash
git add resources/
git commit -m "chore: scaffold resources/ brand asset directory"
```

---

### Task 2: Move iOS app icons

**Files:**

- Move: `assets/AppIcons/Assets.xcassets/AppIcon.appiconset/` → `resources/appicon/ios/AppIcon.appiconset/`

- [ ] **Step 1: Move all iOS icon files**

```bash
cd /Users/M324550/Documents/POC/merck-design-fusion/mobile
mv assets/AppIcons/Assets.xcassets/AppIcon.appiconset/Contents.json resources/appicon/ios/AppIcon.appiconset/
mv assets/AppIcons/Assets.xcassets/AppIcon.appiconset/*.png resources/appicon/ios/AppIcon.appiconset/
```

Expected: exits 0, no output.

- [ ] **Step 2: Verify iOS icons are in place**

```bash
ls resources/appicon/ios/AppIcon.appiconset/ | wc -l
```

Expected: `20` (19 PNGs + Contents.json)

```bash
ls resources/appicon/ios/AppIcon.appiconset/
```

Expected to include: `Contents.json 20.png 29.png 40.png 50.png 57.png 58.png 60.png 72.png 76.png 80.png 87.png 100.png 114.png 120.png 144.png 152.png 167.png 180.png 1024.png`

- [ ] **Step 3: Clean up now-empty xcassets scaffold**

```bash
rm -rf assets/AppIcons/Assets.xcassets
```

- [ ] **Step 4: Commit**

```bash
git add resources/appicon/ios/
git add assets/AppIcons/
git commit -m "chore: move iOS app icons to resources/appicon/ios/"
```

---

### Task 3: Move Android app icons

**Files:**

- Move: `assets/AppIcons/android/mipmap-*/` → `resources/appicon/android/`

- [ ] **Step 1: Move all Android mipmap folders**

```bash
cd /Users/M324550/Documents/POC/merck-design-fusion/mobile
mv assets/AppIcons/android/mipmap-mdpi    resources/appicon/android/
mv assets/AppIcons/android/mipmap-hdpi    resources/appicon/android/
mv assets/AppIcons/android/mipmap-xhdpi   resources/appicon/android/
mv assets/AppIcons/android/mipmap-xxhdpi  resources/appicon/android/
mv assets/AppIcons/android/mipmap-xxxhdpi resources/appicon/android/
```

Expected: exits 0, no output.

- [ ] **Step 2: Verify Android icons**

```bash
ls resources/appicon/android/
```

Expected:

```
mipmap-hdpi  mipmap-mdpi  mipmap-xhdpi  mipmap-xxhdpi  mipmap-xxxhdpi
```

```bash
ls resources/appicon/android/mipmap-mdpi/
```

Expected: `ic_launcher.png`

- [ ] **Step 3: Clean up now-empty android folder and AppIcons root**

```bash
rm -rf assets/AppIcons/android
rm -rf assets/AppIcons
```

Verify `assets/AppIcons` is gone:

```bash
ls assets/AppIcons 2>&1
```

Expected: `ls: assets/AppIcons: No such file or directory`

- [ ] **Step 4: Commit**

```bash
git add resources/appicon/android/
git add assets/
git commit -m "chore: move Android app icons to resources/appicon/android/"
```

---

### Task 4: Move splash, fonts, and store assets

**Files:**

- Move: `assets/bootsplash/` contents → `resources/splash/`
- Move: `assets/fonts/` contents → `resources/fonts/`
- Move: `assets/store/` contents → `resources/store/`

- [ ] **Step 1: Move splash assets**

```bash
cd /Users/M324550/Documents/POC/merck-design-fusion/mobile
mv assets/bootsplash/logo.png        resources/splash/
mv assets/bootsplash/logo@1,5x.png  resources/splash/
mv assets/bootsplash/logo@2x.png    resources/splash/
mv assets/bootsplash/logo@3x.png    resources/splash/
mv assets/bootsplash/logo@4x.png    resources/splash/
mv assets/bootsplash/manifest.json  resources/splash/
```

- [ ] **Step 2: Move font assets**

```bash
mv assets/fonts/poppins.extralight.ttf  resources/fonts/
mv assets/fonts/poppins.light.ttf       resources/fonts/
mv assets/fonts/poppins.thin.ttf        resources/fonts/
mv assets/fonts/Urbanist-Light.ttf      resources/fonts/
mv assets/fonts/Urbanist-Regular.ttf    resources/fonts/
mv assets/fonts/Urbanist-Thin.ttf       resources/fonts/
```

- [ ] **Step 3: Move store assets**

```bash
mv assets/store/appstore.png   resources/store/
mv assets/store/playstore.png  resources/store/
```

- [ ] **Step 4: Remove now-empty source directories**

```bash
rm -rf assets/bootsplash
rm -rf assets/fonts
rm -rf assets/store
```

- [ ] **Step 5: Verify**

```bash
ls resources/splash/
ls resources/fonts/
ls resources/store/
```

Expected:

```
# splash/
logo.png  logo@1,5x.png  logo@2x.png  logo@3x.png  logo@4x.png  manifest.json

# fonts/
Urbanist-Light.ttf  Urbanist-Regular.ttf  Urbanist-Thin.ttf  poppins.extralight.ttf  poppins.light.ttf  poppins.thin.ttf

# store/
appstore.png  playstore.png
```

- [ ] **Step 6: Commit**

```bash
git add resources/splash/ resources/fonts/ resources/store/
git add assets/
git commit -m "chore: move splash, fonts, and store assets to resources/"
```

---

### Task 5: Update `scripts/apply-app-icons.js`

**Files:**

- Modify: `scripts/apply-app-icons.js` lines 91 and 135

Two changes:

1. **Line 91** — `parseArgs()` default path: `'assets/AppIcons'` → `'resources/appicon'`
2. **Line 135** — `applyIOS()` source subfolder: `'Assets.xcassets', 'AppIcon.appiconset'` → `'ios', 'AppIcon.appiconset'`

Also update the header comment block (lines 14–32) to reflect the new layout.

- [ ] **Step 1: Update the default source path in `parseArgs`**

In `scripts/apply-app-icons.js` at line 91, change:

```js
return sourceArg ? sourceArg.replace('--source=', '') : 'assets/AppIcons';
```

to:

```js
return sourceArg ? sourceArg.replace('--source=', '') : 'resources/appicon';
```

- [ ] **Step 2: Update the iOS source subfolder in `applyIOS`**

In `scripts/apply-app-icons.js` at line 135, change:

```js
const srcIconset = path.join(
  sourceDir,
  'Assets.xcassets',
  'AppIcon.appiconset',
);
```

to:

```js
const srcIconset = path.join(sourceDir, 'ios', 'AppIcon.appiconset');
```

- [ ] **Step 3: Update the header comment to show the new layout**

Replace the `─── Source directory layout` block in the file header (lines 14–32) with:

```js
 * ─── Source directory layout (default: resources/appicon) ───────────────────
 *
 *   resources/appicon/
 *   ├── android/
 *   │   ├── mipmap-mdpi/ic_launcher.png        (48×48)
 *   │   ├── mipmap-hdpi/ic_launcher.png        (72×72)
 *   │   ├── mipmap-xhdpi/ic_launcher.png       (96×96)
 *   │   ├── mipmap-xxhdpi/ic_launcher.png      (144×144)
 *   │   └── mipmap-xxxhdpi/ic_launcher.png     (192×192)
 *   └── ios/
 *       └── AppIcon.appiconset/
 *           ├── Contents.json
 *           ├── 20.png  29.png  40.png  50.png  57.png  58.png
 *           ├── 60.png  72.png  76.png  80.png  87.png  100.png
 *           ├── 114.png 120.png 144.png 152.png 167.png 180.png
 *           └── 1024.png
```

Also update the usage example comment on line 47 from:

```
 *        assets/ClientB/AppIcons/android/mipmap-mdpi/ic_launcher.png ...
 *        assets/ClientB/AppIcons/Assets.xcassets/AppIcon.appiconset/ ...
```

to:

```
 *        resources/appicon/android/mipmap-mdpi/ic_launcher.png ...
 *        resources/appicon/ios/AppIcon.appiconset/ ...
```

- [ ] **Step 4: Verify the script is syntactically valid**

```bash
node --check scripts/apply-app-icons.js
```

Expected: exits 0, no output.

- [ ] **Step 5: Commit**

```bash
git add scripts/apply-app-icons.js
git commit -m "feat: update apply-app-icons to read from resources/appicon/"
```

---

### Task 6: Add `resources/README.md`

**Files:**

- Create: `resources/README.md`

- [ ] **Step 1: Write the README**

Create `resources/README.md` with this content:

```markdown
# resources/

Brand assets that can be swapped per client or deployment. All files here are
**replaceable** — drop in new versions and run the apply script to push them
into the native iOS and Android projects.

## Subfolders

| Folder     | Contents                                                      | How to apply                                                              |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `appicon/` | App launcher icons for iOS and Android                        | `npm run apply-icons`                                                     |
| `splash/`  | Boot splash screen images and manifest                        | Re-run `react-native-bootsplash` generate command                         |
| `fonts/`   | Custom font files (TTF)                                       | Listed in `react-native.config.js`, re-link with `npx react-native-asset` |
| `store/`   | App Store and Play Store listing images (1024×1024 / 512×512) | Upload manually to store consoles                                         |

## `appicon/` layout
```

appicon/
├── ios/
│ └── AppIcon.appiconset/
│ ├── Contents.json
│ └── \*.png (19 sizes, see Contents.json for size map)
└── android/
├── mipmap-mdpi/ic_launcher.png (48×48)
├── mipmap-hdpi/ic_launcher.png (72×72)
├── mipmap-xhdpi/ic_launcher.png (96×96)
├── mipmap-xxhdpi/ic_launcher.png (144×144)
└── mipmap-xxxhdpi/ic_launcher.png (192×192)

```

To swap the icon:
1. Replace the PNG files above with your new icons (keep the same filenames)
2. Run `npm run apply-icons`
3. Rebuild the app (`npm run ios` / `npm run android`)

To use a custom source path: `npm run apply-icons -- --source=<path>`
```

- [ ] **Step 2: Commit**

```bash
git add resources/README.md
git commit -m "docs: add resources/README.md explaining brand asset folders"
```

---

### Task 7: Verify end-to-end

- [ ] **Step 1: Run the apply-icons script**

```bash
cd /Users/M324550/Documents/POC/merck-design-fusion/mobile
npm run apply-icons
```

Expected output (no errors):

```
apply-app-icons
  Source : resources/appicon

🤖  Android
  ✓  mipmap-mdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-hdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-xhdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-xxhdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-xxxhdpi/ic_launcher.png + ic_launcher_round.png

  10 files copied, 0 skipped

🍏  iOS
  ✓  Contents.json
  ✓  20.png
  ... (19 icons)

  19 icons copied, 0 skipped

🏪  Store assets
  ✓  playstore.png → assets/store/playstore.png
  ✓  appstore.png  → assets/store/appstore.png

Done! Rebuild the app to see the new icons.
```

- [ ] **Step 2: Verify iOS native directory**

```bash
ls ios/TodoAppRN/Images.xcassets/AppIcon.appiconset/ | wc -l
```

Expected: `20`

- [ ] **Step 3: Verify Android native directories**

```bash
for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  echo "mipmap-$d:"
  ls android/app/src/main/res/mipmap-$d/
done
```

Expected: each density shows `ic_launcher.png` and `ic_launcher_round.png`.

- [ ] **Step 4: Verify `--source` override still works**

```bash
npm run apply-icons -- --source=resources/appicon
```

Expected: same output as Step 1 — confirms the flag path still resolves correctly.

- [ ] **Step 5: Final commit (if any cleanup needed)**

```bash
git status
# If clean, nothing to do. If any stray files remain, stage and commit them.
```
