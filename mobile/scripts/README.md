# Scripts Directory

This directory contains utility scripts for the project.

## Available Scripts

### `convert-svg-icons.js`

Automatically converts SVG files to React Native TypeScript components.

**Purpose:**

- Converts `.svg` files to `.tsx` React Native components
- Adds proper TypeScript interfaces with customizable props
- Updates the icon index file with new exports
- Makes icons mobile-friendly (24x24 default size)

**Usage:**

```bash
# Method 1: Direct execution
node scripts/convert-svg-icons.js

# Method 2: NPM script (recommended)
npm run convert-icons
```

**Workflow:**

1. Place your `.svg` files in `src/assets/svg-broken-icons/`
2. Run the script
3. Icons are automatically converted and exported
4. Use them in your code immediately

**Features:**

✅ Scans for new SVG files automatically
✅ Converts SVG attributes to React Native props
✅ Replaces hardcoded colors with dynamic color prop
✅ Generates TypeScript interfaces
✅ Updates index.ts with new exports
✅ Reports success/failure for each conversion
✅ Sorts exports alphabetically

**Example Output:**

```
🔍 Scanning for SVG files...

Found 3 new SVG files to convert

✅ Converted: heart-svgrepo-com.svg -> heart-svgrepo-com.tsx
   Export as: HeartIcon
✅ Converted: star-svgrepo-com.svg -> star-svgrepo-com.tsx
   Export as: StarIcon
✅ Converted: home-icon-svgrepo-com.svg -> home-icon-svgrepo-com.tsx
   Export as: HomeIcon

==================================================
✨ Conversion complete!
✅ Success: 3 files
❌ Errors: 0 files
📝 Updated index.ts with 3 new exports
==================================================
```

**Script Logic:**

1. Scans `src/assets/svg-broken-icons/` for `.svg` files
2. Checks if corresponding `.tsx` file exists
3. Parses SVG content (paths, circles, rects)
4. Converts attributes (stroke-width → strokeWidth)
5. Replaces hardcoded colors with `{color}` prop
6. Generates TypeScript component with interface
7. Creates `.tsx` file with proper formatting
8. Updates `index.ts` with new exports
9. Sorts all exports alphabetically

**Naming Conventions:**

| Original SVG Filename           | TSX Filename                    | Export Name       |
| ------------------------------- | ------------------------------- | ----------------- |
| `bell-svgrepo-com.svg`          | `bell-svgrepo-com.tsx`          | `BellIcon`        |
| `home-icon-svgrepo-com.svg`     | `home-icon-svgrepo-com.tsx`     | `HomeIcon`        |
| `map-point-add-svgrepo-com.svg` | `map-point-add-svgrepo-com.tsx` | `MapPointAddIcon` |

**Requirements:**

- Node.js (any recent version)
- SVG files must be valid XML
- SVG should use `stroke` or `fill` attributes for colors

**Error Handling:**

The script handles:

- Missing SVG directory
- Invalid SVG files
- Parse errors
- File write errors

**See Also:**

- Full documentation: `docs/HOW_TO_ADD_NEW_ICONS.md`
- Quick start guide: `QUICK_START_ICONS.md`
- Icon gallery: Open app → Icons tab

---

### `apply-app-icons.js`

Replaces all app icons for Android and iOS from a source directory. Designed to make it
trivial to swap icons across different clients, brands, or app variants with a single command.

**Usage:**

```bash
# Apply icons from the default source (assets/AppIcons)
npm run apply-icons

# Apply icons from a custom path
npm run apply-icons -- --source=assets/ClientB/AppIcons
npm run apply-icons -- --source=assets/AcmeCorp/AppIcons
```

**What it does:**

- Copies `ic_launcher.png` **and** `ic_launcher_round.png` for all 5 Android densities
  (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`)
- Copies `Contents.json` + 19 PNG sizes to the iOS Xcode appiconset
- Optionally copies `playstore.png` and `appstore.png` to `assets/store/`
- Missing source files are skipped with a warning — the build is never blocked

**Source directory layout required:**

```
<source>/
├── android/
│   ├── mipmap-mdpi/ic_launcher.png      (48×48)
│   ├── mipmap-hdpi/ic_launcher.png      (72×72)
│   ├── mipmap-xhdpi/ic_launcher.png     (96×96)
│   ├── mipmap-xxhdpi/ic_launcher.png    (144×144)
│   └── mipmap-xxxhdpi/ic_launcher.png   (192×192)
├── Assets.xcassets/
│   └── AppIcon.appiconset/
│       ├── Contents.json
│       └── *.png  (all sizes listed in Contents.json)
├── playstore.png    (optional — 512×512)
└── appstore.png     (optional — 1024×1024)
```

**Example output:**

```
apply-app-icons
  Source : assets/AppIcons

🤖  Android
  ✓  mipmap-mdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-hdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-xhdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-xxhdpi/ic_launcher.png + ic_launcher_round.png
  ✓  mipmap-xxxhdpi/ic_launcher.png + ic_launcher_round.png

  10 files copied, 0 skipped

🍏  iOS
  ✓  Contents.json
  ✓  20.png ... 1024.png

  19 icons copied, 0 skipped

✅ Done! Rebuild the app to see the new icons.
```

**See Also:**

- Full guide: `docs/APP_ICONS_GUIDE.md`

---

## Adding New Scripts

When adding new scripts to this directory:

1. Create the script file with `.js` extension
2. Add shebang at the top: `#!/usr/bin/env node`
3. Make it executable: `chmod +x scripts/your-script.js`
4. Add to `package.json` scripts section
5. Document it in this README

**Template:**

```javascript
#!/usr/bin/env node

/**
 * Script Name
 *
 * Description of what the script does
 *
 * Usage:
 *   node scripts/your-script.js
 */

// Your code here
```

---

## Rebrand & Version Bump Toolkit

> Full reference: see [`rebrand.config.js`](../rebrand.config.js) (config) and [`branding/README.md`](../branding/README.md) (asset requirements).

### Directory layout

```
scripts/
  rebrand/
    index.js            # orchestrator: runs ios + android in sequence
    rebrand-ios.js      # iOS-only entry point
    rebrand-android.js  # Android-only entry point
  version/
    bump.js             # orchestrator: bump both platforms
    bump-ios.js         # iOS-only version bump
    bump-android.js     # Android-only version bump
  core/
    config.js           # load + validate rebrand.config.js
    assets.js           # icon + splash generation (sharp + bootsplash)
    native-ios.js       # read/write pbxproj + Info.plist via xcode package
    native-android.js   # read/write build.gradle + all strings.xml locales
    log.js              # shared colour logging
```

### Rebrand

Edit `rebrand.config.js` at the repo root, then:

```bash
yarn rebrand:dry                   # preview all changes — no writes
yarn rebrand                       # both platforms
yarn rebrand:ios                   # iOS only
yarn rebrand:android               # Android only
yarn rebrand --skip-icons          # skip icon generation
yarn rebrand --skip-splash         # skip splash generation
yarn rebrand --skip-firebase       # skip Firebase config placement
```

**Pre-flight guards:**
- Aborts if the git working tree is dirty (fully reversible via `git revert`). `--dry-run` bypasses this.
- Warns if `branding/icon.png` / `branding/splash.png` are absent — skips gracefully rather than failing.
- Warns if the Firebase config's bundle ID doesn't match the new applicationId.

**What gets updated per platform:**

| | iOS | Android |
|---|---|---|
| Bundle / App ID | `project.pbxproj` (all build configs, test target optional) | `build.gradle` applicationId |
| Display name | `Info.plist` CFBundleDisplayName | `res/values/strings.xml` + every `values-*/strings.xml` |
| Firebase config | `ios/<App>/GoogleService-Info.plist` | `android/app/google-services.json` |
| App icon | All `AppIcon.appiconset` sizes + `Contents.json` | All `mipmap-*` densities (launcher + round) |
| Splash | `react-native generate-bootsplash` | `react-native generate-bootsplash` |
| Post-step | `bundle exec pod install` | — |

**Manual follow-ups after a bundle ID change** (script prints these):
1. Apple Developer portal — register new bundle ID; APNs key if using push
2. App Store Connect — create a new app record
3. Firebase Console — register iOS + Android apps, download fresh config files
4. Play Console — package name cannot be changed after first upload
5. Xcode — verify signing team / provisioning profile

### Version bump

`package.json` is the single source of truth for the version name. Build numbers live in the native files.

```bash
yarn bump --minor --build          # new version name + new build (release)
yarn bump --build                  # build number only (TestFlight / internal rebuild)
yarn bump --patch                  # version name only
yarn bump --set 2.4.1              # explicit version name
yarn bump --dry-run --minor --build  # preview without writing

yarn bump:ios --patch              # iOS only
yarn bump:android --build          # Android only
```

**Unified build number strategy** (`yarn bump --build`):
Reads `CURRENT_PROJECT_VERSION` (iOS) and `versionCode` (Android), takes `max(ios, android) + 1`, and writes that value to **both**. Prevents platform drift and guarantees the value only ever increases — required by App Store Connect and the Play Console.

**Last Updated:** 2026-05-31
