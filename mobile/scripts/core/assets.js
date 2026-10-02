'use strict';

/**
 * assets.js — Icon and splash generation.
 *
 * Icons: uses `sharp` (already installed by react-native-bootsplash) to resize
 *   a single 1024×1024 source PNG into all required Android mipmap + iOS
 *   AppIcon.appiconset densities.
 *
 * Splash: shells out to `react-native generate-bootsplash` which is registered
 *   as a CLI command by react-native-bootsplash via react-native.config.js.
 *
 * Both operations are guarded by --skip-icons / --skip-splash flags and will
 * warn gracefully when source files are missing rather than hard-failing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { log } = require('./log');
const { ROOT } = require('./config');

// ─── Android icon density matrix ─────────────────────────────────────────────
const ANDROID_ICON_SIZES = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// iOS AppIcon.appiconset sizes (all sizes the App Store and iOS itself use)
const IOS_ICON_SIZES = [
  { name: '20.png',   size: 20  },
  { name: '29.png',   size: 29  },
  { name: '40.png',   size: 40  },
  { name: '58.png',   size: 58  },
  { name: '60.png',   size: 60  },
  { name: '76.png',   size: 76  },
  { name: '80.png',   size: 80  },
  { name: '87.png',   size: 87  },
  { name: '120.png',  size: 120 },
  { name: '152.png',  size: 152 },
  { name: '167.png',  size: 167 },
  { name: '180.png',  size: 180 },
  { name: '1024.png', size: 1024 },
];

// iOS AppIcon Contents.json — tells Xcode which file maps to which idiom/scale
const IOS_CONTENTS_JSON = {
  images: [
    { idiom: 'iphone', scale: '2x', size: '20x20',   filename: '40.png'  },
    { idiom: 'iphone', scale: '3x', size: '20x20',   filename: '60.png'  },
    { idiom: 'iphone', scale: '2x', size: '29x29',   filename: '58.png'  },
    { idiom: 'iphone', scale: '3x', size: '29x29',   filename: '87.png'  },
    { idiom: 'iphone', scale: '2x', size: '40x40',   filename: '80.png'  },
    { idiom: 'iphone', scale: '3x', size: '40x40',   filename: '120.png' },
    { idiom: 'iphone', scale: '2x', size: '60x60',   filename: '120.png' },
    { idiom: 'iphone', scale: '3x', size: '60x60',   filename: '180.png' },
    { idiom: 'ipad',   scale: '1x', size: '20x20',   filename: '20.png'  },
    { idiom: 'ipad',   scale: '2x', size: '20x20',   filename: '40.png'  },
    { idiom: 'ipad',   scale: '1x', size: '29x29',   filename: '29.png'  },
    { idiom: 'ipad',   scale: '2x', size: '29x29',   filename: '58.png'  },
    { idiom: 'ipad',   scale: '1x', size: '40x40',   filename: '40.png'  },
    { idiom: 'ipad',   scale: '2x', size: '40x40',   filename: '80.png'  },
    { idiom: 'ipad',   scale: '1x', size: '76x76',   filename: '76.png'  },
    { idiom: 'ipad',   scale: '2x', size: '76x76',   filename: '152.png' },
    { idiom: 'ipad',   scale: '2x', size: '83.5x83.5', filename: '167.png' },
    { idiom: 'ios-marketing', scale: '1x', size: '1024x1024', filename: '1024.png' },
  ],
  info: { version: 1, author: 'xcode' },
};

// ─── Validation ───────────────────────────────────────────────────────────────

async function validateIconSource(iconPath) {
  let sharp;
  try { sharp = require('sharp'); } catch {
    throw new Error('sharp is not installed. Run: npm install sharp');
  }

  const resolved = path.resolve(ROOT, iconPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Icon source not found: ${resolved}`);
  }

  const meta = await sharp(resolved).metadata();
  if (meta.width !== meta.height) {
    throw new Error(`Icon must be square. Got ${meta.width}×${meta.height}.`);
  }
  if (meta.width < 1024) {
    log.warn(`Icon is ${meta.width}×${meta.width} — recommend >= 1024×1024 for best quality.`);
  }
  if (meta.hasAlpha) {
    log.warn('Icon has an alpha channel. iOS will reject it on App Store upload. Flatten against a background colour before submitting.');
  }
  return { sharp, resolved };
}

// ─── Icon generation ──────────────────────────────────────────────────────────

async function generateIcons(iconPath, { platforms = ['ios', 'android'], dryRun = false } = {}) {
  log.step('Assets — icon generation');

  let sharpLib, resolved;
  try {
    ({ sharp: sharpLib, resolved } = await validateIconSource(iconPath));
  } catch (e) {
    log.warn(`Icon generation skipped: ${e.message}`);
    return;
  }

  if (platforms.includes('android')) {
    await generateAndroidIcons(sharpLib, resolved, dryRun);
  }
  if (platforms.includes('ios')) {
    await generateIosIcons(sharpLib, resolved, dryRun);
  }
}

async function generateAndroidIcons(sharp, srcPath, dryRun) {
  const resDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');
  log.info('Generating Android icons…');

  for (const { dir, size } of ANDROID_ICON_SIZES) {
    const outDir = path.join(resDir, dir);
    if (!fs.existsSync(outDir)) {
      log.warn(`  ${dir}/ not found — skipped.`);
      continue;
    }
    const launcher = path.join(outDir, 'ic_launcher.png');
    const launcherRound = path.join(outDir, 'ic_launcher_round.png');
    if (!dryRun) {
      await sharp(srcPath).resize(size, size).toFile(launcher);
      await sharp(srcPath).resize(size, size).toFile(launcherRound);
    }
    log.info(`  ${dir} → ${size}×${size}px`);
  }
}

async function generateIosIcons(sharp, srcPath, dryRun) {
  // Find the AppIcon.appiconset directory
  const iosDir = path.join(ROOT, 'ios');
  let appiconDir = null;
  for (const entry of fs.readdirSync(iosDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(iosDir, entry.name, 'Images.xcassets', 'AppIcon.appiconset');
    if (fs.existsSync(candidate)) { appiconDir = candidate; break; }
  }

  if (!appiconDir) {
    log.warn('iOS AppIcon.appiconset not found — iOS icon generation skipped.');
    return;
  }

  log.info('Generating iOS icons…');
  for (const { name, size } of IOS_ICON_SIZES) {
    const out = path.join(appiconDir, name);
    if (!dryRun) {
      await sharp(srcPath).resize(size, size).toFile(out);
    }
    log.info(`  ${name} → ${size}×${size}px`);
  }

  // Write Contents.json
  if (!dryRun) {
    fs.writeFileSync(
      path.join(appiconDir, 'Contents.json'),
      JSON.stringify(IOS_CONTENTS_JSON, null, 2) + '\n',
      'utf8',
    );
  }
  log.info('  Contents.json updated');
}

// ─── Splash generation ────────────────────────────────────────────────────────

async function generateSplash(splashPath, backgroundColor, { platforms = ['ios', 'android'], dryRun = false } = {}) {
  log.step('Assets — splash generation');

  const resolved = path.resolve(ROOT, splashPath);
  if (!fs.existsSync(resolved)) {
    log.warn(`Splash source not found at "${resolved}" — skipped.`);
    return;
  }

  if (dryRun) {
    log.warn('Splash generation skipped in dry-run mode (shells out to react-native generate-bootsplash).');
    return;
  }

  const platformArg = platforms.join(',');
  const bgArg = backgroundColor || '#ffffff';

  // react-native-bootsplash registers `generate-bootsplash` as a RN CLI command
  const cmd = [
    `node node_modules/.bin/react-native`,
    `generate-bootsplash`,
    JSON.stringify(resolved),
    `--platforms ${platformArg}`,
    `--background ${bgArg}`,
    `--logo-width 100`,
  ].join(' ');

  log.info(`Running: ${cmd}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    log.ok('Splash generated.');
  } catch (e) {
    log.warn('Splash generation failed — run manually:');
    log.warn(`  npx react-native generate-bootsplash ${resolved} --background ${bgArg}`);
  }
}

module.exports = { generateIcons, generateSplash };
