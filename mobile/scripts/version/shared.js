'use strict';

/**
 * shared.js — Utilities shared by all three bump scripts.
 *
 * Arg parsing, semver bumping, and package.json read/write live here so
 * every entry point (bump.js, bump-ios.js, bump-android.js) behaves identically.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PKG_PATH = path.join(ROOT, 'package.json');

// ─── Arg parser ───────────────────────────────────────────────────────────────

/**
 * Returns:
 *   { dryRun, build, semverOp: 'major'|'minor'|'patch'|null, set: string|null }
 *
 * semverOp and set are mutually exclusive; set takes precedence.
 */
function parseArgs() {
  const argv = process.argv.slice(2);
  const result = { dryRun: false, build: false, semverOp: null, set: null };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') result.dryRun = true;
    else if (a === '--build') result.build = true;
    else if (a === '--major') result.semverOp = 'major';
    else if (a === '--minor') result.semverOp = 'minor';
    else if (a === '--patch') result.semverOp = 'patch';
    else if (a === '--set') {
      const v = argv[++i];
      if (!v || !/^\d+\.\d+\.\d+$/.test(v)) {
        throw new Error(`--set requires a semver value, e.g. --set 2.4.1. Got: ${v}`);
      }
      result.set = v;
    }
  }

  if (result.set) result.semverOp = null; // --set overrides semver flags
  return result;
}

// ─── Semver bump ──────────────────────────────────────────────────────────────

/**
 * Increment a semver string by one segment.
 * Major resets minor+patch; minor resets patch.
 */
function bumpSemver(current, op) {
  if (!/^\d+\.\d+\.\d+$/.test(current)) {
    // package.json may have a short version like "1.0" — pad it
    const parts = current.split('.').map(Number);
    while (parts.length < 3) parts.push(0);
    current = parts.join('.');
  }

  let [major, minor, patch] = current.split('.').map(Number);

  switch (op) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: throw new Error(`Unknown semver op "${op}". Use --major, --minor, or --patch.`);
  }
}

// ─── package.json read/write ──────────────────────────────────────────────────

function readPackageVersion() {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  return pkg.version || '0.0.0';
}

function writePackageVersion(newVersion) {
  const raw = fs.readFileSync(PKG_PATH, 'utf8');
  const updated = raw.replace(/"version"\s*:\s*"[^"]+"/, `"version": "${newVersion}"`);
  if (updated === raw) return; // already matches
  fs.writeFileSync(PKG_PATH, updated, 'utf8');
}

module.exports = { parseArgs, bumpSemver, readPackageVersion, writePackageVersion };
