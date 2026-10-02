'use strict';

/**
 * native-ios.js — Read and write iOS native files.
 *
 * Uses the `xcode` npm package to parse project.pbxproj safely (not regex).
 * Shared by both rebrand-ios.js and bump-ios.js so the brittle .pbxproj
 * parsing lives in exactly one place.
 */

const fs = require('fs');
const path = require('path');
const xcode = require('xcode');
const { log } = require('./log');
const { ROOT } = require('./config');

// ─── Paths ────────────────────────────────────────────────────────────────────
const IOS_DIR = path.join(ROOT, 'ios');

function findAppDir() {
  // The app folder is the first dir inside ios/ that contains Info.plist
  const entries = fs.readdirSync(IOS_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const candidate = path.join(IOS_DIR, e.name, 'Info.plist');
    if (fs.existsSync(candidate)) return path.join(IOS_DIR, e.name);
  }
  throw new Error('Cannot find iOS app directory (no Info.plist found under ios/).');
}

function findPbxproj() {
  const entries = fs.readdirSync(IOS_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.endsWith('.xcodeproj')) {
      return path.join(IOS_DIR, e.name, 'project.pbxproj');
    }
  }
  throw new Error('Cannot find *.xcodeproj under ios/.');
}

// ─── Read current iOS values ──────────────────────────────────────────────────

/**
 * Returns { bundleId, version, buildNumber, displayName, versionInPlist }
 * versionInPlist: true if CFBundleShortVersionString is a hardcoded value
 * (older RN projects), false if it references $(MARKETING_VERSION) (modern).
 */
function readIosValues() {
  const pbxprojPath = findPbxproj();
  const appDir = findAppDir();
  const plistPath = path.join(appDir, 'Info.plist');

  const proj = xcode.project(pbxprojPath);
  proj.parseSync();

  // Collect unique bundle IDs and versions across all build configs
  const configs = proj.pbxXCBuildConfigurationSection();
  let bundleId = '';
  let version = '';
  let buildNumber = '';

  for (const val of Object.values(configs)) {
    if (typeof val !== 'object' || !val.buildSettings) continue;
    const bs = val.buildSettings;
    if (bs.PRODUCT_BUNDLE_IDENTIFIER && !bundleId) {
      bundleId = bs.PRODUCT_BUNDLE_IDENTIFIER.replace(/"/g, '');
    }
    if (bs.MARKETING_VERSION && !version) {
      version = String(bs.MARKETING_VERSION).replace(/"/g, '');
    }
    if (bs.CURRENT_PROJECT_VERSION && !buildNumber) {
      buildNumber = String(bs.CURRENT_PROJECT_VERSION).replace(/"/g, '');
    }
  }

  // Display name from Info.plist
  const plist = fs.readFileSync(plistPath, 'utf8');
  const displayNameMatch = plist.match(
    /<key>CFBundleDisplayName<\/key>\s*<string>([^<]+)<\/string>/,
  );
  const displayName = displayNameMatch ? displayNameMatch[1] : '';

  // Detect whether version is stored in plist or pbxproj
  const versionInPlist = !/<key>CFBundleShortVersionString<\/key>\s*<string>\$\(MARKETING_VERSION\)<\/string>/.test(plist);

  return { bundleId, version, buildNumber, displayName, versionInPlist, pbxprojPath, plistPath };
}

// ─── Write iOS bundle ID ──────────────────────────────────────────────────────

/**
 * Set PRODUCT_BUNDLE_IDENTIFIER across all build configurations on:
 *   - the main app target
 *   - the Tests target (if updateTestTarget and one exists)
 *
 * Returns true if any change was written.
 */
function setIosBundleId(newBundleId, { updateTestTarget = false, dryRun = false } = {}) {
  const pbxprojPath = findPbxproj();
  const proj = xcode.project(pbxprojPath);
  proj.parseSync();

  const nativeTargets = proj.pbxNativeTargetSection();
  const configs = proj.pbxXCBuildConfigurationSection();

  // Collect config keys belonging to app target (productType = application)
  // and optionally test target (productType contains test)
  const targetConfigKeys = new Set();
  for (const [, target] of Object.entries(nativeTargets)) {
    if (typeof target !== 'object' || !target.productType) continue;
    const isApp = target.productType.includes('application');
    const isTest = target.productType.includes('unit-test') || target.productType.includes('ui-test');
    if (!isApp && !(updateTestTarget && isTest)) continue;

    const configListUuid = target.buildConfigurationList;
    const configList = proj.pbxXCConfigurationList()[configListUuid];
    if (!configList) continue;

    for (const entry of configList.buildConfigurations || []) {
      targetConfigKeys.add(entry.value || entry);
    }
  }

  let changed = false;
  for (const [key, cfg] of Object.entries(configs)) {
    if (typeof cfg !== 'object' || !cfg.buildSettings) continue;
    if (!targetConfigKeys.has(key) && targetConfigKeys.size > 0) continue;
    const current = (cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER || '').replace(/"/g, '');
    if (current && current !== newBundleId) {
      if (!dryRun) {
        cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = newBundleId;
      }
      changed = true;
      log.changed(`project.pbxproj [${cfg.name}] PRODUCT_BUNDLE_IDENTIFIER`, current, newBundleId);
    }
  }

  if (changed && !dryRun) {
    fs.writeFileSync(pbxprojPath, proj.writeSync());
  } else if (!changed) {
    log.skipped('project.pbxproj PRODUCT_BUNDLE_IDENTIFIER', newBundleId);
  }

  return changed;
}

// ─── Write iOS version + build number ────────────────────────────────────────

/**
 * Set MARKETING_VERSION and/or CURRENT_PROJECT_VERSION across all build configs.
 * Also updates CFBundleShortVersionString / CFBundleVersion in Info.plist if the
 * project uses the older hardcoded-plist model.
 *
 * Pass null for version or buildNumber to leave that field unchanged.
 */
function setIosVersion(newVersion, newBuildNumber, { dryRun = false } = {}) {
  const { pbxprojPath, plistPath, versionInPlist } = readIosValues();
  const proj = xcode.project(pbxprojPath);
  proj.parseSync();

  const configs = proj.pbxXCBuildConfigurationSection();
  let pbxChanged = false;

  for (const [, cfg] of Object.entries(configs)) {
    if (typeof cfg !== 'object' || !cfg.buildSettings) continue;
    const bs = cfg.buildSettings;

    if (newVersion !== null && newVersion !== undefined && bs.MARKETING_VERSION !== undefined) {
      const cur = String(bs.MARKETING_VERSION).replace(/"/g, '');
      if (cur !== newVersion) {
        if (!dryRun) bs.MARKETING_VERSION = newVersion;
        log.changed(`project.pbxproj [${cfg.name}] MARKETING_VERSION`, cur, newVersion);
        pbxChanged = true;
      }
    }

    if (newBuildNumber !== null && newBuildNumber !== undefined && bs.CURRENT_PROJECT_VERSION !== undefined) {
      const cur = String(bs.CURRENT_PROJECT_VERSION).replace(/"/g, '');
      if (cur !== String(newBuildNumber)) {
        if (!dryRun) bs.CURRENT_PROJECT_VERSION = newBuildNumber;
        log.changed(`project.pbxproj [${cfg.name}] CURRENT_PROJECT_VERSION`, cur, String(newBuildNumber));
        pbxChanged = true;
      }
    }
  }

  if (pbxChanged && !dryRun) {
    fs.writeFileSync(pbxprojPath, proj.writeSync());
  }

  // Older plist model: update CFBundleShortVersionString / CFBundleVersion directly
  if (versionInPlist && (newVersion || newBuildNumber)) {
    let plist = fs.readFileSync(plistPath, 'utf8');
    let plistChanged = false;
    if (newVersion) {
      const updated = plist.replace(
        /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*(<\/string>)/,
        `$1${newVersion}$2`,
      );
      if (updated !== plist) { plist = updated; plistChanged = true; }
    }
    if (newBuildNumber) {
      const updated = plist.replace(
        /(<key>CFBundleVersion<\/key>\s*<string>)[^<]*(<\/string>)/,
        `$1${newBuildNumber}$2`,
      );
      if (updated !== plist) { plist = updated; plistChanged = true; }
    }
    if (plistChanged && !dryRun) {
      fs.writeFileSync(plistPath, plist, 'utf8');
    }
  }

  return pbxChanged;
}

// ─── Write iOS display name ───────────────────────────────────────────────────

function setIosDisplayName(newName, { dryRun = false } = {}) {
  const appDir = findAppDir();
  const plistPath = path.join(appDir, 'Info.plist');
  let plist = fs.readFileSync(plistPath, 'utf8');

  const updated = plist.replace(
    /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
    `$1${newName}$2`,
  );

  if (updated === plist) {
    log.skipped('Info.plist CFBundleDisplayName', newName);
    return false;
  }

  log.changed('Info.plist CFBundleDisplayName', '', newName);
  if (!dryRun) fs.writeFileSync(plistPath, updated, 'utf8');
  return true;
}

// ─── Place Firebase config ────────────────────────────────────────────────────

function placeIosFirebaseConfig(sourcePath, { dryRun = false } = {}) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    log.warn(`iOS Firebase config not found at "${sourcePath}" — skipped.`);
    return false;
  }
  const appDir = findAppDir();
  const dest = path.join(appDir, 'GoogleService-Info.plist');
  log.info(`Placing GoogleService-Info.plist → ${path.relative(ROOT, dest)}`);
  if (!dryRun) fs.copyFileSync(sourcePath, dest);
  return true;
}

module.exports = {
  readIosValues,
  setIosBundleId,
  setIosVersion,
  setIosDisplayName,
  placeIosFirebaseConfig,
};
