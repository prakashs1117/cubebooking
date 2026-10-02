#!/usr/bin/env node
/**
 * bump-android.js — Android-only version bump.
 *
 *   yarn bump:android [--major|--minor|--patch|--set X.Y.Z] [--build] [--dry-run]
 *
 * Version name source of truth: package.json.
 * Build number source of truth: build.gradle versionCode.
 *
 * --build alone: increments versionCode only (no version name change).
 * --minor/--patch/etc alone: bumps versionName; versionCode unchanged.
 * Combine both: new versionName + incremented versionCode in one run.
 */

'use strict';

const { parseArgs, bumpSemver, readPackageVersion, writePackageVersion } = require('./shared');
const { log } = require('../core/log');
const { readAndroidValues, setAndroidVersion } = require('../core/native-android');

async function main() {
  const args = parseArgs();
  if (args.dryRun) log.warn('DRY-RUN mode — no files will be written\n');

  const pkgVersion = readPackageVersion();
  const { versionName, versionCode } = readAndroidValues();

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
    const cur = Number(versionCode);
    if (!Number.isInteger(cur) || cur < 0) {
      throw new Error(`versionCode "${versionCode}" is not a valid non-negative integer.`);
    }
    newBuild = cur + 1;
    if (newBuild > 2_100_000_000) {
      throw new Error(`versionCode ${newBuild} would overflow the Play Store limit (~2.1B).`);
    }
    log.info(`versionCode (Android): ${versionCode} → ${newBuild}`);
  }

  if (newVersion === null && newBuild === null) {
    log.warn('Nothing to bump. Pass --major, --minor, --patch, --set X.Y.Z, or --build.');
    process.exit(0);
  }

  setAndroidVersion(newVersion, newBuild, { dryRun: args.dryRun });

  if (!args.dryRun) {
    log.ok(`Android version bump complete.`);
    log.info(`  versionName : ${newVersion ?? versionName}`);
    log.info(`  versionCode : ${newBuild ?? versionCode}`);
  }
}

main().catch(e => { log.error(e.message); process.exit(1); });
