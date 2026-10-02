#!/usr/bin/env node
/**
 * rebrand-ios.js — iOS-only rebrand entry point.
 *
 *   yarn rebrand:ios [--dry-run] [--skip-icons] [--skip-splash] [--skip-firebase]
 *                    [--config path/to/rebrand.config.js]
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const { loadConfig, validateConfig, ROOT } = require('../core/config');
const { log } = require('../core/log');
const {
  readIosValues,
  setIosBundleId,
  setIosDisplayName,
  placeIosFirebaseConfig,
} = require('../core/native-ios');
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

  log.step('iOS — pre-flight');
  const current = readIosValues();
  log.info(`Bundle ID    : ${current.bundleId}`);
  log.info(`Display Name : ${current.displayName}`);
  log.info(`Version      : ${current.version} (${current.buildNumber})`);

  log.step('iOS — native edits');

  if (cfg.ios?.bundleId) {
    setIosBundleId(cfg.ios.bundleId, {
      updateTestTarget: cfg.ios.updateTestTarget ?? true,
      ...opts,
    });
  }

  if (cfg.appName) {
    setIosDisplayName(cfg.appName, opts);
  }

  log.step('iOS — Firebase');
  if (!args.skipFirebase && cfg.firebase?.ios) {
    const src = path.resolve(ROOT, cfg.firebase.ios);
    placeIosFirebaseConfig(src, opts);
  } else {
    log.info('Firebase placement skipped.');
  }

  // ── Icons ────────────────────────────────────────────────────────────────
  if (!args.skipIcons && cfg.assets?.icon) {
    await generateIcons(cfg.assets.icon, { platforms: ['ios'], ...opts });
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
      { platforms: ['ios'], ...opts },
    );
  } else if (args.skipSplash) {
    log.info('Splash generation skipped (--skip-splash).');
  } else {
    log.info('Splash generation skipped (no assets.splash in config).');
  }

  // ── pod install ──────────────────────────────────────────────────────────
  if (!args.dryRun) {
    log.step('iOS — pod install');
    try {
      log.info('Running pod install…');
      execSync('bundle exec pod install', {
        cwd: path.join(ROOT, 'ios'),
        stdio: 'inherit',
      });
    } catch {
      log.warn('pod install failed — run it manually: cd ios && bundle exec pod install');
    }
  }

  log.step('iOS — done');
  printChecklist(cfg, current);
}

function printChecklist(cfg, prev) {
  const { c } = require('../core/log');
  console.log(`\n${c.bold}Manual follow-ups:${c.reset}`);
  const items = [
    'Apple Developer portal: register the new bundle ID',
    'APNs key: update if using push notifications',
    'App Store Connect: create a new app record for this bundle ID',
    'Firebase Console: register iOS app, download fresh GoogleService-Info.plist',
    'Xcode: verify signing team / provisioning profile resolves for the new ID',
  ];
  if (cfg.ios?.bundleId === prev.bundleId) {
    console.log(`   ${c.grey}(bundle ID unchanged — portal steps may not be needed)${c.reset}`);
  }
  items.forEach((item, i) => console.log(`   ${c.grey}${i + 1}. ${item}${c.reset}`));
  console.log('');
}

main().catch(e => { log.error(e.message); process.exit(1); });
