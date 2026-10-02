#!/usr/bin/env node
/**
 * bump-ios.js — iOS-only version bump.
 *
 *   yarn bump:ios [--major|--minor|--patch|--set X.Y.Z] [--build] [--dry-run]
 *
 * Version name source of truth: package.json.
 * Build number source of truth: project.pbxproj CURRENT_PROJECT_VERSION.
 *
 * --build alone: increments build number only (no version name change).
 * --minor/--patch/etc alone: bumps version name and syncs to iOS; build unchanged.
 * Combine both: new version name + new build number in one run.
 */

'use strict';

const { parseArgs, bumpSemver, readPackageVersion, writePackageVersion } = require('./shared');
const { log } = require('../core/log');
const { readIosValues, setIosVersion } = require('../core/native-ios');

async function main() {
  const args = parseArgs();
  if (args.dryRun) log.warn('DRY-RUN mode — no files will be written\n');

  const pkgVersion = readPackageVersion();
  const { version: iosVersion, buildNumber: iosBuild } = readIosValues();

  // ── Version name ─────────────────────────────────────────────────────────
  let newVersion = null;
  if (args.semverOp || args.set) {
    newVersion = args.set ?? bumpSemver(pkgVersion, args.semverOp);
    log.info(`Version name: ${pkgVersion} → ${newVersion}`);
    if (!args.dryRun) writePackageVersion(newVersion);
  }

  // ── Build number ─────────────────────────────────────────────────────────
  let newBuild = null;
  if (args.build) {
    // iOS-only bump: just increment the iOS build number
    newBuild = Number(iosBuild) + 1;
    log.info(`Build number (iOS): ${iosBuild} → ${newBuild}`);
  }

  if (newVersion === null && newBuild === null) {
    log.warn('Nothing to bump. Pass --major, --minor, --patch, --set X.Y.Z, or --build.');
    process.exit(0);
  }

  setIosVersion(newVersion, newBuild, { dryRun: args.dryRun });

  if (!args.dryRun) {
    log.ok(`iOS version bump complete.`);
    log.info(`  Version : ${newVersion ?? iosVersion}`);
    log.info(`  Build   : ${newBuild ?? iosBuild}`);
  }
}

main().catch(e => { log.error(e.message); process.exit(1); });
