# Splash Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the React Native app splash screen from white background to Merck brand purple (`#5B1D8A`) with a gold wave-M logo (`#F5B700`), applied across native iOS, native Android, and the JS animated overlay.

**Architecture:** The implementation spans three independent layers that can be updated in parallel:
1. **Logo regeneration** — Create gold wave-M PNG assets from the existing SVG source at all required densities (JS, iOS, Android)
2. **Native color updates** — Patch the 4 native color locations (Android XML, iOS storyboard, iOS xcassets, JS overlay)
3. **Config updates** — Update manifest.json files and rebrand.config.js for consistency

**Tech Stack:** `sharp` (SVG → PNG rasterization, already installed), React Native native assets, Xcode storyboard/xcassets, Android drawable resources, Reanimated (no changes needed).

---

## File Structure

**Asset layers:**
- `assets/bootsplash/` — JS layer (1×, 1.5×, 2×, 3×, 4× PNGs)
- `src/assets/bootsplash/` — JS layer copy (1×, 2×, 3× PNGs)
- `android/app/src/main/res/drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/` — Android native (all densities)
- `ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/` — iOS native (1×, 3× PNGs)
- `ios/TodoAppRN/BootSplash.storyboard` — iOS native UI definition
- `src/components/splash/AnimatedBootSplash.tsx` — JS animated overlay

**Config files:**
- `assets/bootsplash/manifest.json` — JS manifest (background color + logo size)
- `src/assets/bootsplash/manifest.json` — JS manifest copy
- `android/app/src/main/res/values/colors.xml` — Android color definitions
- `ios/TodoAppRN/Images.xcassets/BootSplashBackground-87d228.colorset/Contents.json` — iOS color definitions
- `rebrand.config.js` — Build config (single source of truth for future rebranding)

---

## Task 1: Generate gold wave-M logo PNGs from SVG

**Files:**
- Source: `assets/bootsplash_logo.svg`
- Create/overwrite: 
  - `assets/bootsplash/logo.png`, `@1,5x.png`, `@2x.png`, `@3x.png`, `@4x.png`
  - `src/assets/bootsplash/logo.png`, `@2x.png`, `@3x.png`
  - `android/app/src/main/res/drawable-mdpi/bootsplash_logo.png`
  - `android/app/src/main/res/drawable-hdpi/bootsplash_logo.png`
  - `android/app/src/main/res/drawable-xhdpi/bootsplash_logo.png`
  - `android/app/src/main/res/drawable-xxhdpi/bootsplash_logo.png`
  - `android/app/src/main/res/drawable-xxxhdpi/bootsplash_logo.png`
  - `ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/180.png`
  - `ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/1024.png`

- [ ] **Step 1: Create a Node script to generate all logo variants**

Create a new file at the project root: `scripts/generate-splash-logo.js`

```javascript
#!/usr/bin/env node
/**
 * Generate gold wave-M splash logo PNGs at all required densities.
 * 
 * Source: assets/bootsplash_logo.svg (fill color patched from red to gold)
 * Output: JS, Android, iOS assets at correct pixel sizes
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const svg2png = require('sharp'); // sharp handles SVG natively

const ROOT = path.join(__dirname, '..');
const SVG_SOURCE = path.join(ROOT, 'assets', 'bootsplash_logo.svg');

// Gold color for Merck brand
const GOLD_HEX = '#F5B700';

// Define all output targets: [outputPath, widthPx, heightPx, description]
const outputs = [
  // JS assets (assets/bootsplash/ — these are the primary active assets)
  [path.join(ROOT, 'assets/bootsplash/logo.png'), 120, 120, 'JS 1x'],
  [path.join(ROOT, 'assets/bootsplash/logo@1,5x.png'), 180, 180, 'JS 1.5x'],
  [path.join(ROOT, 'assets/bootsplash/logo@2x.png'), 240, 240, 'JS 2x'],
  [path.join(ROOT, 'assets/bootsplash/logo@3x.png'), 360, 360, 'JS 3x'],
  [path.join(ROOT, 'assets/bootsplash/logo@4x.png'), 480, 480, 'JS 4x'],

  // JS assets (src/assets/bootsplash/ — backup/legacy location)
  [path.join(ROOT, 'src/assets/bootsplash/logo.png'), 120, 120, 'JS legacy 1x'],
  [path.join(ROOT, 'src/assets/bootsplash/logo@2x.png'), 240, 240, 'JS legacy 2x'],
  [path.join(ROOT, 'src/assets/bootsplash/logo@3x.png'), 360, 360, 'JS legacy 3x'],

  // Android native (square assets)
  [path.join(ROOT, 'android/app/src/main/res/drawable-mdpi/bootsplash_logo.png'), 288, 288, 'Android mdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-hdpi/bootsplash_logo.png'), 432, 432, 'Android hdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-xhdpi/bootsplash_logo.png'), 576, 576, 'Android xhdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-xxhdpi/bootsplash_logo.png'), 864, 864, 'Android xxhdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-xxxhdpi/bootsplash_logo.png'), 1152, 1152, 'Android xxxhdpi'],

  // iOS native
  [path.join(ROOT, 'ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/180.png'), 180, 180, 'iOS 1x'],
  [path.join(ROOT, 'ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/1024.png'), 1024, 1024, 'iOS 3x'],
];

async function generateLogos() {
  try {
    // Read SVG source
    let svgContent = fs.readFileSync(SVG_SOURCE, 'utf8');

    // Patch fill color: red (#D94A49) → gold (#F5B700)
    svgContent = svgContent.replace(/#D94A49/g, GOLD_HEX);

    console.log('✓ SVG patched: red → gold');

    // Generate all PNG outputs
    for (const [outPath, w, h, desc] of outputs) {
      // Ensure output directory exists
      const dir = path.dirname(outPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Rasterize SVG to PNG
      await sharp(Buffer.from(svgContent), { density: 150 })
        .png()
        .resize(w, h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(outPath);

      console.log(`✓ Generated: ${desc} (${w}×${h}) → ${outPath}`);
    }

    console.log('\n✅ All logo assets generated successfully');
  } catch (error) {
    console.error('❌ Error generating logos:', error);
    process.exit(1);
  }
}

generateLogos();
```

- [ ] **Step 2: Add npm script to package.json**

Open `package.json` and add to the `"scripts"` section:

```json
"generate-splash-logo": "node scripts/generate-splash-logo.js"
```

- [ ] **Step 3: Run the logo generation script**

```bash
npm run generate-splash-logo
```

Expected output:
```
✓ SVG patched: red → gold
✓ Generated: JS 1x (120×120) → assets/bootsplash/logo.png
✓ Generated: JS 1.5x (180×180) → assets/bootsplash/logo@1,5x.png
...
✅ All logo assets generated successfully
```

Verify all output files exist:

```bash
# JS assets
ls -la assets/bootsplash/logo*.png src/assets/bootsplash/logo*.png

# Android assets
ls -la android/app/src/main/res/drawable-*/bootsplash_logo.png

# iOS assets
ls -la ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/*.png
```

- [ ] **Step 4: Commit logo generation script and assets**

```bash
git add scripts/generate-splash-logo.js package.json
git add assets/bootsplash/logo*.png src/assets/bootsplash/logo*.png
git add android/app/src/main/res/drawable-*/bootsplash_logo.png
git add ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/*.png
git commit -m "feat(splash): generate gold wave-M logos at all densities

- SVG source patched from red to gold (#F5B700)
- Generated for JS (1x–4x), Android (mdpi–xxxhdpi), iOS (1x, 3x)
- Maintains square pixel dimensions matching existing assets
"
```

---

## Task 2: Update Android background color

**Files:**
- Modify: `android/app/src/main/res/values/colors.xml`

- [ ] **Step 1: Read the current Android colors file**

```bash
cat android/app/src/main/res/values/colors.xml
```

Expected content (includes the white bootsplash_background):
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="white">#FFFFFF</color>
    <color name="bootsplash_background">#ffffff</color>
</resources>
```

- [ ] **Step 2: Update bootsplash_background to purple**

Replace `#ffffff` with `#5B1D8A` in the `bootsplash_background` color entry:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="white">#FFFFFF</color>
    <color name="bootsplash_background">#5B1D8A</color>
</resources>
```

- [ ] **Step 3: Verify the change**

```bash
grep bootsplash_background android/app/src/main/res/values/colors.xml
```

Expected: `<color name="bootsplash_background">#5B1D8A</color>`

- [ ] **Step 4: Commit**

```bash
git add android/app/src/main/res/values/colors.xml
git commit -m "feat(splash): update Android background to purple (#5B1D8A)"
```

---

## Task 3: Update iOS storyboard background color

**Files:**
- Modify: `ios/TodoAppRN/BootSplash.storyboard` (XML file)

- [ ] **Step 1: Examine the storyboard structure**

```bash
grep -A 5 "BootSplashBackground" ios/TodoAppRN/BootSplash.storyboard | head -20
```

Look for a named color definition with RGB values `red="1"` `green="1"` `blue="1"`.

- [ ] **Step 2: Identify the exact lines to change**

The storyboard contains color definitions in XML. Find the line with the named color `BootSplashBackground-87d228` and its RGB node. The current values are:

```xml
<color red="1" green="1" blue="1" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
```

This represents `#FFFFFF`. We need to change it to purple `#5B1D8A`:
- Red: 91/255 = 0.357
- Green: 29/255 = 0.114
- Blue: 138/255 = 0.541

- [ ] **Step 3: Update the storyboard**

Use a text editor or `sed` to replace the RGB values:

```bash
# Backup first
cp ios/TodoAppRN/BootSplash.storyboard ios/TodoAppRN/BootSplash.storyboard.bak

# Replace the color values
# Find the specific RGB line for BootSplashBackground and replace
sed -i '' 's/red="1" green="1" blue="1"/red="0.357" green="0.114" blue="0.541"/g' ios/TodoAppRN/BootSplash.storyboard
```

Or manually edit the file: open in Xcode or a text editor and locate the `BootSplashBackground-87d228` color entry, then update its RGB component from `(1, 1, 1)` to `(0.357, 0.114, 0.541)`.

- [ ] **Step 4: Verify the change**

```bash
grep -A 2 "BootSplashBackground" ios/TodoAppRN/BootSplash.storyboard | grep -E 'red|green|blue'
```

Expected output should show:
```
red="0.357" green="0.114" blue="0.541"
```

- [ ] **Step 5: Commit**

```bash
git add ios/TodoAppRN/BootSplash.storyboard
git commit -m "feat(splash): update iOS storyboard background to purple (#5B1D8A)"
```

---

## Task 4: Update iOS xcassets background color

**Files:**
- Modify: `ios/TodoAppRN/Images.xcassets/BootSplashBackground-87d228.colorset/Contents.json`

- [ ] **Step 1: Read the current xcassets Contents.json**

```bash
cat ios/TodoAppRN/Images.xcassets/BootSplashBackground-87d228.colorset/Contents.json
```

Expected structure:
```json
{
  "colors" : [
    {
      "color" : {
        "color-space" : "srgb",
        "components" : {
          "alpha" : "1.000",
          "blue" : "1.000",
          "green" : "1.000",
          "red" : "1.000"
        }
      },
      "idiom" : "universal"
    },
    {
      "appearances" : [...],
      "color" : {
        "color-space" : "srgb",
        "components" : {
          "alpha" : "1.000",
          "blue" : "1.000",
          "green" : "1.000",
          "red" : "1.000"
        }
      },
      "idiom" : "universal"
    }
  ],
  "info" : {...},
  "properties" : {...}
}
```

- [ ] **Step 2: Update all RGB values to purple**

Replace all instances of `"1.000"` for red/green/blue with the purple equivalents:
- red: `"0.357"`
- green: `"0.114"`
- blue: `"0.541"`

The file likely has two color entries (one for light mode, one for dark mode). Update both.

Complete file after changes:

```json
{
  "colors" : [
    {
      "color" : {
        "color-space" : "srgb",
        "components" : {
          "alpha" : "1.000",
          "blue" : "0.541",
          "green" : "0.114",
          "red" : "0.357"
        }
      },
      "idiom" : "universal"
    },
    {
      "appearances" : [
        {
          "appearance" : "luminosity",
          "value" : "dark"
        }
      ],
      "color" : {
        "color-space" : "srgb",
        "components" : {
          "alpha" : "1.000",
          "blue" : "0.541",
          "green" : "0.114",
          "red" : "0.357"
        }
      },
      "idiom" : "universal"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  },
  "properties" : {
    "localizable" : true
  }
}
```

- [ ] **Step 3: Verify the change**

```bash
cat ios/TodoAppRN/Images.xcassets/BootSplashBackground-87d228.colorset/Contents.json | grep -E '"red"|"green"|"blue"'
```

Expected: All RGB values should be `0.357`, `0.114`, `0.541`.

- [ ] **Step 4: Commit**

```bash
git add ios/TodoAppRN/Images.xcassets/BootSplashBackground-87d228.colorset/Contents.json
git commit -m "feat(splash): update iOS xcassets background color to purple (#5B1D8A)"
```

---

## Task 5: Update JS animated splash overlay background

**Files:**
- Modify: `src/components/splash/AnimatedBootSplash.tsx:113`

- [ ] **Step 1: Read the current component**

Open the file and find the `styles.container.backgroundColor` property:

```bash
sed -n '107,120p' src/components/splash/AnimatedBootSplash.tsx
```

Current state:
```typescript
const styles = StyleSheet.create({
  container: {
    // ...
    backgroundColor: '#FFFFFF',
  },
  // ...
});
```

- [ ] **Step 2: Update the background color to purple**

Replace `'#FFFFFF'` with `'#5B1D8A'`:

```typescript
const styles = StyleSheet.create({
  container: {
    // Ensure it sits on top of everything — zIndex handled by absolute fill
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B1D8A',
  },
  logo: {
    // Explicit size from manifest keeps it pixel-perfect on all densities
    width: manifest.logo.width,
    height: manifest.logo.height,
  },
});
```

- [ ] **Step 3: Verify the syntax**

```bash
npm run lint -- src/components/splash/AnimatedBootSplash.tsx
```

Expected: No linting errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/splash/AnimatedBootSplash.tsx
git commit -m "feat(splash): update JS overlay background to purple (#5B1D8A)"
```

---

## Task 6: Update manifest.json files

**Files:**
- Modify: `assets/bootsplash/manifest.json`
- Modify: `src/assets/bootsplash/manifest.json`

- [ ] **Step 1: Update assets/bootsplash/manifest.json**

Current:
```json
{
  "background": "#ffffff",
  "logo": {
    "width": 120,
    "height": 120
  }
}
```

Change `background` to purple:
```json
{
  "background": "#5B1D8A",
  "logo": {
    "width": 120,
    "height": 120
  }
}
```

- [ ] **Step 2: Update src/assets/bootsplash/manifest.json (same change)**

```json
{
  "background": "#5B1D8A",
  "logo": {
    "width": 120,
    "height": 120
  }
}
```

- [ ] **Step 3: Verify both files**

```bash
cat assets/bootsplash/manifest.json src/assets/bootsplash/manifest.json
```

Both should show `"background": "#5B1D8A"`.

- [ ] **Step 4: Commit**

```bash
git add assets/bootsplash/manifest.json src/assets/bootsplash/manifest.json
git commit -m "feat(splash): update manifest background color to purple (#5B1D8A)"
```

---

## Task 7: Update rebrand.config.js

**Files:**
- Modify: `rebrand.config.js`

- [ ] **Step 1: Read the current rebrand config**

```bash
cat rebrand.config.js | grep -A 5 "assets:"
```

Current state includes:
```javascript
assets: {
  icon: 'branding/icon.png',
  splash: 'branding/splash.png',
  splashBackground: '#4A1259',
},
```

- [ ] **Step 2: Update splashBackground to the new purple**

Change `'#4A1259'` to `'#5B1D8A'`:

```javascript
assets: {
  // Source icon: >= 1024x1024 px, square, no alpha (iOS rejects alpha).
  // Place your master PNG here before running rebrand.
  icon: 'branding/icon.png',
  // Source splash image for react-native-bootsplash
  splash: 'branding/splash.png',
  splashBackground: '#5B1D8A',
},
```

- [ ] **Step 3: Verify the change**

```bash
grep splashBackground rebrand.config.js
```

Expected: `splashBackground: '#5B1D8A',`

- [ ] **Step 4: Commit**

```bash
git add rebrand.config.js
git commit -m "feat(splash): update rebrand config splash background to purple (#5B1D8A)"
```

---

## Task 8: Verify the splash screen on Android

**Files:** None modified in this task — verification only.

- [ ] **Step 1: Clean and rebuild Android**

```bash
npm run android-cache-clear
npm run android
```

This will compile the Android app and launch it on a connected device or emulator.

- [ ] **Step 2: Observe the native splash frame**

When the app first launches, before any JS code runs, you should see:
- Purple background `#5B1D8A`
- Gold wave-M logo centered

- [ ] **Step 3: Observe the animated overlay**

The animated splash overlay (which mirrors the native frame) should appear with:
- Same purple background
- Same gold wave-M logo
- Spring-in animation, pulse, then fade out

- [ ] **Step 4: Kill and relaunch to verify native frame consistency**

Press `Ctrl+Shift+R` in the emulator or kill the app on device and relaunch. The very first frame (before JS loads) should still be purple with the gold logo, not white.

- [ ] **Step 5: Document the result**

Take a screenshot or note: "Android splash verified — native frame + overlay both show purple background with gold wave-M"

---

## Task 9: Verify the splash screen on iOS

**Files:** None modified in this task — verification only.

- [ ] **Step 1: Ensure iOS dependencies are installed**

```bash
cd ios
bundle exec pod install
cd ..
```

- [ ] **Step 2: Build and run on iOS**

```bash
npm run ios
```

This will build the iOS app and launch it on a connected iPhone simulator or device.

- [ ] **Step 3: Observe the native splash frame**

When the app first launches, before any JS code runs, you should see:
- Purple background `#5B1D8A`
- Gold wave-M logo centered

- [ ] **Step 4: Observe the animated overlay**

The animated splash overlay should appear with:
- Same purple background
- Same gold wave-M logo
- Spring-in animation, pulse, then fade out

- [ ] **Step 5: Kill and relaunch to verify native frame consistency**

Force-close the app and relaunch. The very first frame should still be purple with the gold logo, not white.

- [ ] **Step 6: Test dark/light mode consistency**

If the iOS simulator has a dark mode setting, toggle it and verify the splash remains purple in both modes (it should not respond to theme changes — the color is hardcoded in the storyboard and xcassets).

- [ ] **Step 7: Document the result**

Note: "iOS splash verified — native frame + overlay both show purple background with gold wave-M in both light and dark modes"

---

## Task 10: Final verification and integration

**Files:** None modified — final checks.

- [ ] **Step 1: Verify all assets are tracked by git**

```bash
git status
```

Should show all new logo PNG files as "new file" changes, and all modified config files as "modified". No untracked PNGs should appear.

- [ ] **Step 2: Run linting**

```bash
npm run lint
```

Expected: No errors related to the splash screen changes (the changes are config + assets only, minimal code changes).

- [ ] **Step 3: Run tests (if any splash tests exist)**

```bash
npm test -- --testPathPattern=splash
```

If no splash-specific tests exist, this may return 0 tests. That's fine — the verification is manual (cold launch checks above).

- [ ] **Step 4: Create a summary commit if needed**

If you want a clean final state, optionally create a "wrap-up" commit:

```bash
git log --oneline | head -7
```

The last 7 commits should show:
```
feat(splash): update rebrand config splash background to purple (#5B1D8A)
feat(splash): update manifest background color to purple (#5B1D8A)
feat(splash): update JS overlay background to purple (#5B1D8A)
feat(splash): update iOS xcassets background color to purple (#5B1D8A)
feat(splash): update iOS storyboard background to purple (#5B1D8A)
feat(splash): update Android background to purple (#5B1D8A)
feat(splash): generate gold wave-M logos at all densities
```

All commits are independent and in logical order. No additional wrap-up commit is needed.

- [ ] **Step 5: Verify the implementation against the spec**

Go through the spec requirements one by one:
- ✓ Background is `#5B1D8A` (purple) in all 4 layers (Android XML, iOS storyboard, iOS xcassets, JS overlay)
- ✓ Logo is `#F5B700` (gold wave-M) at all required densities (JS 1–4×, Android mdpi–xxxhdpi, iOS 1× & 3×)
- ✓ Animation is unchanged (existing spring/pulse/fade still plays)
- ✓ Manifests updated to reflect new purple background
- ✓ rebrand.config.js updated for consistency
- ✓ Native launch frame is purple (confirmed in Tasks 8 & 9)

---

## Self-Review Against Spec

**Spec coverage:**
- ✓ Step 1 (Logo regeneration) → Task 1
- ✓ Step 2 (Android background) → Task 2
- ✓ Step 3 (iOS storyboard) → Task 3
- ✓ Step 4 (iOS xcassets) → Task 4
- ✓ Step 5 (JS overlay) → Task 5
- ✓ Step 6 (Manifests) → Task 6
- ✓ Step 7 (rebrand.config.js) → Task 7
- ✓ Verification section → Tasks 8, 9, 10

No gaps.

**Placeholder scan:** All steps contain exact file paths, exact code changes, exact commands with expected output. No "TBD", "implement later", or "add appropriate error handling" patterns. No unspecified functions or types.

**Type/name consistency:** Color constants consistently use `#5B1D8A` and `#F5B700`. RGB floats consistently use `0.357`, `0.114`, `0.541` for purple. Filename patterns consistent across Android (drawable-*), iOS (imageset), and JS (logo, logo@Nx.png).

**No issues found.** Plan is ready.
