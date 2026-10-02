#!/usr/bin/env node
/**
 * apply-app-icons.js
 *
 * Copies app icons from a source directory into the correct Android and iOS
 * native locations. Run once to swap the icon for any app, client, or brand.
 *
 * ─── Usage ────────────────────────────────────────────────────────────────
 *
 *   npm run apply-icons
 *   npm run apply-icons -- --source=assets/ClientB/AppIcons
 *   node scripts/apply-app-icons.js --source=assets/MyBrand/AppIcons
 *
 * ─── Source directory layout (default: assets/AppIcons) ──────────────────
 *
 *   assets/AppIcons/
 *   ├── android/
 *   │   ├── mipmap-mdpi/ic_launcher.png        (48×48)
 *   │   ├── mipmap-hdpi/ic_launcher.png        (72×72)
 *   │   ├── mipmap-xhdpi/ic_launcher.png       (96×96)
 *   │   ├── mipmap-xxhdpi/ic_launcher.png      (144×144)
 *   │   └── mipmap-xxxhdpi/ic_launcher.png     (192×192)
 *   ├── Assets.xcassets/
 *   │   └── AppIcon.appiconset/
 *   │       ├── Contents.json
 *   │       ├── 20.png  29.png  40.png  50.png  57.png  58.png
 *   │       ├── 60.png  72.png  76.png  80.png  87.png  100.png
 *   │       ├── 114.png 120.png 144.png 152.png 167.png 180.png
 *   │       └── 1024.png
 *   ├── playstore.png    (512×512 — Google Play Store listing)
 *   └── appstore.png     (1024×1024 — App Store listing)
 *
 * ─── Android targets ─────────────────────────────────────────────────────
 *
 *   android/app/src/main/res/mipmap-{density}/
 *     ic_launcher.png        (square launcher icon)
 *     ic_launcher_round.png  (circular launcher icon — same image)
 *
 * ─── iOS targets ─────────────────────────────────────────────────────────
 *
 *   ios/TodoAppRN/Images.xcassets/AppIcon.appiconset/
 *     *.png + Contents.json
 *
 * ─── Customising for a different app / client ────────────────────────────
 *
 *   1. Drop the new icons into a folder matching the layout above, e.g.:
 *        assets/ClientB/AppIcons/android/mipmap-mdpi/ic_launcher.png ...
 *        assets/ClientB/AppIcons/Assets.xcassets/AppIcon.appiconset/ ...
 *
 *   2. Run:
 *        npm run apply-icons -- --source=assets/ClientB/AppIcons
 *
 *   3. Rebuild the app.
 */

const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');

const ANDROID_DENSITIES = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];

// iOS icon filenames that will be copied (must exist in the appiconset source)
const IOS_ICON_SIZES = [
  '20.png',
  '29.png',
  '40.png',
  '50.png',
  '57.png',
  '58.png',
  '60.png',
  '72.png',
  '76.png',
  '80.png',
  '87.png',
  '100.png',
  '114.png',
  '120.png',
  '144.png',
  '152.png',
  '167.png',
  '180.png',
  '1024.png',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const log = {
  ok: msg => console.log(`  ${GREEN}✓${RESET}  ${msg}`),
  warn: msg => console.log(`  ${YELLOW}⚠${RESET}  ${msg}`),
  err: msg => console.error(`  ${RED}✗${RESET}  ${msg}`),
  head: msg => console.log(`\n${BOLD}${msg}${RESET}`),
};

function parseArgs() {
  const args = process.argv.slice(2);
  const sourceArg = args.find(a => a.startsWith('--source='));
  return sourceArg ? sourceArg.replace('--source=', '') : 'assets/AppIcons';
}

function copyFile(src, dst) {
  if (!fs.existsSync(src)) {
    log.warn(`Source not found, skipped: ${path.relative(ROOT, src)}`);
    return false;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return true;
}

// ─── Android ─────────────────────────────────────────────────────────────────

function applyAndroid(sourceDir) {
  log.head('🤖  Android');

  let copied = 0;
  let skipped = 0;

  for (const density of ANDROID_DENSITIES) {
    const src = path.join(
      sourceDir,
      'android',
      `mipmap-${density}`,
      'ic_launcher.png',
    );
    const dstDir = path.join(
      ROOT,
      'android',
      'app',
      'src',
      'main',
      'res',
      `mipmap-${density}`,
    );

    const square = copyFile(src, path.join(dstDir, 'ic_launcher.png'));
    const round = copyFile(src, path.join(dstDir, 'ic_launcher_round.png'));

    if (square && round) {
      log.ok(`mipmap-${density}/ic_launcher.png + ic_launcher_round.png`);
      copied += 2;
    } else {
      skipped++;
    }
  }

  console.log(`\n  ${copied} files copied, ${skipped} skipped`);
}

// ─── iOS ─────────────────────────────────────────────────────────────────────

function applyIOS(sourceDir) {
  log.head('🍏  iOS');

  const srcIconset = path.join(
    sourceDir,
    'Assets.xcassets',
    'AppIcon.appiconset',
  );
  const dstIconset = path.join(
    ROOT,
    'ios',
    'TodoAppRN',
    'Images.xcassets',
    'AppIcon.appiconset',
  );

  if (!fs.existsSync(srcIconset)) {
    log.err(`Source appiconset not found: ${srcIconset}`);
    return;
  }

  // Copy Contents.json
  const contentsSrc = path.join(srcIconset, 'Contents.json');
  if (copyFile(contentsSrc, path.join(dstIconset, 'Contents.json'))) {
    log.ok('Contents.json');
  }

  // Copy all declared icon PNGs
  let copied = 0;
  let skipped = 0;

  for (const filename of IOS_ICON_SIZES) {
    const src = path.join(srcIconset, filename);
    const dst = path.join(dstIconset, filename);
    if (copyFile(src, dst)) {
      log.ok(filename);
      copied++;
    } else {
      skipped++;
    }
  }

  console.log(`\n  ${copied} icons copied, ${skipped} skipped`);
}

// ─── Store assets (optional) ─────────────────────────────────────────────────

function applyStoreAssets(sourceDir) {
  const playstoreSrc = path.join(sourceDir, 'playstore.png');
  const appstoredSrc = path.join(sourceDir, 'appstore.png');

  if (fs.existsSync(playstoreSrc) || fs.existsSync(appstoredSrc)) {
    log.head('🏪  Store assets');
    const storeOut = path.join(ROOT, 'assets', 'store');
    fs.mkdirSync(storeOut, { recursive: true });

    if (copyFile(playstoreSrc, path.join(storeOut, 'playstore.png'))) {
      log.ok('playstore.png → assets/store/playstore.png');
    }
    if (copyFile(appstoredSrc, path.join(storeOut, 'appstore.png'))) {
      log.ok('appstore.png  → assets/store/appstore.png');
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const sourceRelative = parseArgs();
  const sourceDir = path.resolve(ROOT, sourceRelative);

  console.log(`\n${BOLD}apply-app-icons${RESET}`);
  console.log(`  Source : ${path.relative(ROOT, sourceDir)}`);

  if (!fs.existsSync(sourceDir)) {
    log.err(`Source directory not found: ${sourceDir}`);
    log.err(`Usage: npm run apply-icons -- --source=<path>`);
    process.exit(1);
  }

  applyAndroid(sourceDir);
  applyIOS(sourceDir);
  applyStoreAssets(sourceDir);

  console.log(
    `\n${GREEN}${BOLD}Done!${RESET} Rebuild the app to see the new icons.\n`,
  );
  console.log(
    `  Android: npm run android   (or cd android && ./gradlew assembleDebug)`,
  );
  console.log(`  iOS:     npm run ios\n`);
}

main();
