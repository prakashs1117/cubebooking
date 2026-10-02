#!/usr/bin/env node
/**
 * bump.js — Orchestrator: bump version on both platforms in one command.
 *
 *   yarn bump [--major|--minor|--patch|--set X.Y.Z] [--build] [--dry-run]
 *
 * Version name: bumps package.json then syncs to both natives.
 * Build number: reads CURRENT_PROJECT_VERSION (iOS) and versionCode (Android),
 *   takes max(ios, android) + 1, and writes that same number to BOTH — so
 *   platforms never drift and the value only ever increases (required by
 *   App Store Connect and Play Console).
 */

'use strict';

const { parseArgs, bumpSemver, readPackageVersion, writePackageVersion } = require('./shared');
const { log, c } = require('../core/log');
const { readIosValues, setIosVersion } = require('../core/native-ios');
const { readAndroidValues, setAndroidVersion } = require('../core/native-android');

async function main() {
  log.planHeader();
  const args = parseArgs();
  if (args.dryRun) log.warn('DRY-RUN mode — no files will be written\n');

  const pkgVersion = readPackageVersion();
  const { version: iosVersion, buildNumber: iosBuild } = readIosValues();
  const { versionName: andVersion, versionCode: andBuild } = readAndroidValues();

  log.info('Current state:');
  console.log(`   package.json  version : ${c.yellow}${pkgVersion}${c.reset}`);
  console.log(`   iOS           version : ${c.yellow}${iosVersion}${c.reset}  build: ${c.yellow}${iosBuild}${c.reset}`);
  console.log(`   Android  versionName : ${c.yellow}${andVersion}${c.reset}  versionCode: ${c.yellow}${andBuild}${c.reset}`);
  console.log('');

  // ── Version name ─────────────────────────────────────────────────────────
  let newVersion = null;
  if (args.semverOp || args.set) {
    newVersion = args.set ?? bumpSemver(pkgVersion, args.semverOp);
    log.info(`Version name: ${pkgVersion} → ${newVersion}`);
    if (!args.dryRun) writePackageVersion(newVersion);
  }

  // ── Unified build number: max(ios, android) + 1 ──────────────────────────
  let newBuild = null;
  if (args.build) {
    const iosNum = Number(iosBuild);
    const andNum = Number(andBuild);

    if (!Number.isInteger(iosNum) || iosNum < 0) {
      throw new Error(`iOS CURRENT_PROJECT_VERSION "${iosBuild}" is not a valid non-negative integer.`);
    }
    if (!Number.isInteger(andNum) || andNum < 0) {
      throw new Error(`Android versionCode "${andBuild}" is not a valid non-negative integer.`);
    }

    newBuild = Math.max(iosNum, andNum) + 1;

    if (newBuild > 2_100_000_000) {
      throw new Error(`Build number ${newBuild} would overflow the Play Store limit (~2.1B).`);
    }

    log.info(`Build number: max(${iosBuild}, ${andBuild}) + 1 = ${newBuild}  (unified for both platforms)`);
  }

  if (newVersion === null && newBuild === null) {
    log.warn('Nothing to bump. Pass --major, --minor, --patch, --set X.Y.Z, or --build.');
    process.exit(0);
  }

  // ── Write ─────────────────────────────────────────────────────────────────
  log.step('iOS');
  setIosVersion(newVersion, newBuild, { dryRun: args.dryRun });

  log.step('Android');
  setAndroidVersion(newVersion, newBuild, { dryRun: args.dryRun });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('');
  if (args.dryRun) {
    log.warn('Dry-run complete — no files were modified.');
  } else {
    log.ok(`${c.bold}Version bump complete.${c.reset}`);
    console.log('');
    console.log(`   Version : ${c.yellow}${newVersion ?? pkgVersion}${c.reset}`);
    console.log(`   Build   : ${c.yellow}${newBuild ?? iosBuild}${c.reset}  (both platforms)`);
    console.log('');
    log.info('Next steps:');
    console.log(`   ${c.grey}1. Review git diff, then commit: git add -p && git commit -m "chore: bump version ${newVersion ?? pkgVersion} (${newBuild ?? iosBuild})"${c.reset}`);
    console.log(`   ${c.grey}2. iOS: cd ios && bundle exec pod install && npx react-native run-ios${c.reset}`);
    console.log(`   ${c.grey}3. Android: npx react-native run-android${c.reset}`);
    console.log('');
  }
}

main().catch(e => { log.error(e.message); process.exit(1); });
