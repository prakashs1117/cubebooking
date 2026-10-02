#!/usr/bin/env node
/**
 * rebrand-android.js — Android-only rebrand entry point.
 *
 *   yarn rebrand:android [--dry-run] [--skip-icons] [--skip-splash] [--skip-firebase]
 *                        [--config path/to/rebrand.config.js]
 */

'use strict';

const path = require('path');
const { loadConfig, validateConfig, ROOT } = require('../core/config');
const { log } = require('../core/log');
const {
  readAndroidValues,
  setAndroidApplicationId,
  setAndroidAppName,
  placeAndroidFirebaseConfig,
  renameAndroidPackage,
} = require('../core/native-android');
const { generateIcons, generateSplash } = require('../core/assets');

function parseArgs() {
  const args = process.argv.slice(2);
  const r = { dryRun: false, skipIcons: false, skipSplash: false, skipFirebase: false, configPath: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run')       r.dryRun = true;
    if (args[i] === '--skip-icons')    r.skipIcons = true;
    if (args[i] === '--skip-splash')   r.skipSplash = true;
    if (args[i] === '--skip-firebase') r.skipFirebase = true;
    if (args[i] === '--config')        r.configPath = args[++i];
  }
  return r;
}

async function main() {
  const args = parseArgs();
  const cfg = loadConfig(args.configPath);
  validateConfig(cfg);

  const opts = { dryRun: args.dryRun };
  if (args.dryRun) log.warn('DRY-RUN mode — no files will be written\n');

  log.step('Android — pre-flight');
  const current = readAndroidValues();
  log.info(`Application ID : ${current.applicationId}`);
  log.info(`App Name       : ${current.appName}`);
  log.info(`Version        : ${current.versionName} (${current.versionCode})`);

  log.step('Android — native edits');

  if (cfg.android?.applicationId) {
    setAndroidApplicationId(cfg.android.applicationId, {
      preserveDebugSuffix: cfg.android.preserveDebugSuffix ?? true,
      ...opts,
    });
  }

  if (cfg.appName) {
    setAndroidAppName(cfg.appName, opts);
  }

  if (cfg.android?.renamePackage) {
    renameAndroidPackage(cfg.android.oldPackage, cfg.android.newPackage, opts);
  }

  log.step('Android — Firebase');
  if (!args.skipFirebase && cfg.firebase?.android) {
    const src = path.resolve(ROOT, cfg.firebase.android);
    placeAndroidFirebaseConfig(src, opts);
  } else {
    log.info('Firebase placement skipped.');
  }

  // ── Icons ────────────────────────────────────────────────────────────────
  if (!args.skipIcons && cfg.assets?.icon) {
    await generateIcons(cfg.assets.icon, { platforms: ['android'], ...opts });
  } else if (args.skipIcons) {
    log.info('Icon generation skipped (--skip-icons).');
  } else {
    log.info('Icon generation skipped (no assets.icon in config).');
  }

  // ── Splash ───────────────────────────────────────────────────────────────
  if (!args.skipSplash && cfg.assets?.splash) {
    await generateSplash(
      cfg.assets.splash,
      cfg.assets.splashBackground,
      { platforms: ['android'], ...opts },
    );
  } else if (args.skipSplash) {
    log.info('Splash generation skipped (--skip-splash).');
  } else {
    log.info('Splash generation skipped (no assets.splash in config).');
  }

  log.step('Android — done');
  printChecklist(cfg, current);
}

function printChecklist(cfg, prev) {
  const { c } = require('../core/log');
  console.log(`\n${c.bold}Manual follow-ups:${c.reset}`);
  const items = [
    'Play Console: new package cannot be changed after first upload — confirm before publishing',
    'Firebase Console: register Android app, download fresh google-services.json',
    'Rebuild: npx react-native run-android  (or yarn generate-apk)',
  ];
  if (cfg.android?.applicationId === prev.applicationId) {
    console.log(`   ${c.grey}(applicationId unchanged — Play Console step may not apply)${c.reset}`);
  }
  items.forEach((item, i) => console.log(`   ${c.grey}${i + 1}. ${item}${c.reset}`));
  console.log('');
}

main().catch(e => { log.error(e.message); process.exit(1); });
