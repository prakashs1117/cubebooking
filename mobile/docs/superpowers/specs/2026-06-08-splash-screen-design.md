# Splash Screen Redesign — Spec

**Date:** 2026-06-08  
**Status:** Approved  
**Author:** Brainstorming session

---

## Context

The React Native app (`react-native-mobileapp`) uses `react-native-bootsplash ^5.3.0` for its splash screen. Currently all native and JS-layer assets specify a **white (`#ffffff`) background**, which is inconsistent with the Merck brand and the existing Ionic app's purple splash. The fix brings the splash inline with the Merck brand: purple background + gold wave-M logomark, applied across all layers (native iOS, native Android, and the JS animated overlay).

The `rebrand.config.js` already contains a `splashBackground` value but it was never applied because `branding/splash.png` doesn't exist and `yarn rebrand` was never re-run. We bypass the rebrand pipeline entirely and edit native files directly, then update `rebrand.config.js` for future consistency.

---

## Design

### Visual

| Property | Value |
|---|---|
| Background color | `#5B1D8A` (Merck brand primary purple) |
| Logo mark | Merck wave-M, fill `#F5B700` (gold/amber) |
| Logo size | 120×120 dp (unchanged from current manifest) |
| Animation | Unchanged — spring-in → hold → pulse → shrink+fade (existing `AnimatedBootSplash.tsx`) |

### Rationale

- `#5B1D8A` is the canonical Merck brand primary purple, matching brand guidelines
- Gold wave-M on purple gives maximum brand recognition and premium feel
- Existing Reanimated animation is already polished — no change needed

---

## Implementation

### Approach: Direct native file edits + SVG re-rasterization

`branding/` is empty (only `firebase/`), so `yarn rebrand` cannot be run. We directly patch the 4 native color locations, regenerate logo PNGs from the existing SVG source, and update the JS overlay.

### Step 1 — Regenerate logo PNGs (gold wave-M)

Source SVG: `assets/bootsplash_logo.svg`  
Tool: `sharp` (already installed as a `react-native-bootsplash` transitive dep)

Patch SVG fill from `#D94A49` → `#F5B700`, then rasterize at:

**JS assets (`assets/bootsplash/` and `src/assets/bootsplash/`):**
| File | Size |
|---|---|
| `logo.png` (1×) | 120×120 (or proportional to 120dp height) |
| `logo@1,5x.png` | 1.5× |
| `logo@2x.png` | 2× |
| `logo@3x.png` | 3× |
| `logo@4x.png` | 4× |

**iOS native (`ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/`):**
| File | Size |
|---|---|
| `180.png` (1×) | 180px wide |
| `1024.png` (3×) | 1024px wide |

**Android native (`android/app/src/main/res/drawable-*/bootsplash_logo.png`):**
| Density | Square size (px) |
|---|---|
| mdpi | 288×288 |
| hdpi | 432×432 |
| xhdpi | 576×576 |
| xxhdpi | 864×864 |
| xxxhdpi | 1152×1152 |

Note: existing assets are square PNGs (transparent padding around wide wave-M); regenerate to same square dimensions.

### Step 2 — Update background color: Android

File: `android/app/src/main/res/values/colors.xml`  
Change: `bootsplash_background` from `#ffffff` → `#5B1D8A`

### Step 3 — Update background color: iOS storyboard

File: `ios/TodoAppRN/BootSplash.storyboard`  
Change: Named color `BootSplashBackground-87d228` RGB components from `(1, 1, 1)` → purple equivalent `(0.357, 0.114, 0.541)` (i.e. `#5B1D8A`)

### Step 4 — Update background color: iOS xcassets

File: `ios/TodoAppRN/Images.xcassets/BootSplashBackground-87d228.colorset/Contents.json`  
Change: RGB float values for all color space entries from white → `#5B1D8A` floats

### Step 5 — Update JS overlay

File: `src/components/splash/AnimatedBootSplash.tsx`  
Change: `styles.container.backgroundColor` from `'#FFFFFF'` → `'#5B1D8A'`

### Step 6 — Update manifests

Files: `assets/bootsplash/manifest.json`, `src/assets/bootsplash/manifest.json`  
Change: `background` from `"#ffffff"` → `"#5B1D8A"`

### Step 7 — Update rebrand config

File: `rebrand.config.js`  
Change: `splashBackground` from `'#4A1259'` → `'#5B1D8A'`

---

## Files Changed

| File | Change |
|---|---|
| `android/app/src/main/res/values/colors.xml` | `bootsplash_background` → `#5B1D8A` |
| `ios/TodoAppRN/BootSplash.storyboard` | Named color RGB → purple floats |
| `ios/TodoAppRN/Images.xcassets/BootSplashBackground-87d228.colorset/Contents.json` | Color floats → purple |
| `assets/bootsplash/logo.png` (+ @1.5x, @2x, @3x, @4x) | Regenerated gold wave-M |
| `src/assets/bootsplash/logo.png` (+ @2x, @3x) | Same |
| `ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/180.png` | Gold wave-M iOS 1× |
| `ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/1024.png` | Gold wave-M iOS 3× |
| `android/app/src/main/res/drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/bootsplash_logo.png` | Gold wave-M per density |
| `assets/bootsplash/manifest.json` | `background` → `#5B1D8A` |
| `src/assets/bootsplash/manifest.json` | Same |
| `src/components/splash/AnimatedBootSplash.tsx` | `backgroundColor` → `#5B1D8A` |
| `rebrand.config.js` | `splashBackground` → `#5B1D8A` |

---

## Verification

1. **Android**: `npm run android` — cold launch should show purple background + gold wave-M → animate out smoothly
2. **iOS**: `npm run ios` — same check (requires pod install if first run)
3. **Native frame test**: Kill app fully, relaunch — the very first frame (before JS loads) must also be purple, not white. This confirms the native Android/iOS assets are correctly updated, not just the JS overlay.
4. **Dark/light mode**: Splash should be the same purple in both modes (no theme dependency)

---

## Out of Scope

- Animation redesign (keeping existing spring/pulse/fade sequence)
- China (`merck_ZH`) or global (`merck`) brand variants — only the RN app's native/JS layers
- The Ionic/Angular app's `brandings/` directory — those are separate Capacitor assets
