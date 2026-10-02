'use strict';

/**
 * native-android.js — Read and write Android native files.
 *
 * Handles build.gradle (Groovy), strings.xml (all localized variants),
 * google-services.json, and the optional full package rename.
 * Shared by rebrand-android.js and bump-android.js.
 */

const fs = require('fs');
const path = require('path');
const { log } = require('./log');
const { ROOT } = require('./config');

// ─── Paths ────────────────────────────────────────────────────────────────────
const ANDROID_DIR = path.join(ROOT, 'android');
const APP_GRADLE = path.join(ANDROID_DIR, 'app', 'build.gradle');
const MAIN_STRINGS = path.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
const GOOGLE_SERVICES = path.join(ANDROID_DIR, 'app', 'google-services.json');
const RES_DIR = path.join(ANDROID_DIR, 'app', 'src', 'main', 'res');

// ─── Read current Android values ──────────────────────────────────────────────

function readAndroidValues() {
  const gradle = fs.readFileSync(APP_GRADLE, 'utf8');
  const strings = fs.readFileSync(MAIN_STRINGS, 'utf8');

  const applicationId = (gradle.match(/applicationId\s+"([^"]+)"/) || [])[1] || '';
  const versionName = (gradle.match(/versionName\s+"([^"]+)"/) || [])[1] || '';
  const versionCode = (gradle.match(/versionCode\s+(\d+)/) || [])[1] || '1';
  const appName = (strings.match(/<string name="app_name">([^<]+)<\/string>/) || [])[1] || '';
  const debugSuffix = (gradle.match(/applicationIdSuffix\s+"([^"]+)"/) || [])[1] || '';

  return { applicationId, versionName, versionCode, appName, debugSuffix };
}

// ─── Write Android applicationId ─────────────────────────────────────────────

/**
 * Update applicationId in build.gradle.
 * When preserveDebugSuffix is true, leaves applicationIdSuffix lines untouched.
 */
function setAndroidApplicationId(newId, { preserveDebugSuffix = true, dryRun = false } = {}) {
  let gradle = fs.readFileSync(APP_GRADLE, 'utf8');
  const current = (gradle.match(/applicationId\s+"([^"]+)"/) || [])[1] || '';

  if (current === newId) {
    log.skipped('build.gradle applicationId', newId);
    return false;
  }

  const updated = gradle.replace(/applicationId\s+"[^"]+"/, `applicationId "${newId}"`);
  log.changed('build.gradle applicationId', current, newId);
  if (!dryRun) fs.writeFileSync(APP_GRADLE, updated, 'utf8');

  if (preserveDebugSuffix) {
    const suffix = (updated.match(/applicationIdSuffix\s+"([^"]+)"/) || [])[1];
    if (suffix) log.info(`preserveDebugSuffix: applicationIdSuffix "${suffix}" retained.`);
  }

  return true;
}

// ─── Write Android version ────────────────────────────────────────────────────

/**
 * Set versionName and/or versionCode in build.gradle.
 * Pass null to leave a field unchanged.
 */
function setAndroidVersion(newVersionName, newVersionCode, { dryRun = false } = {}) {
  let gradle = fs.readFileSync(APP_GRADLE, 'utf8');
  let changed = false;

  if (newVersionName !== null && newVersionName !== undefined) {
    const cur = (gradle.match(/versionName\s+"([^"]+)"/) || [])[1] || '';
    if (cur !== newVersionName) {
      gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${newVersionName}"`);
      log.changed('build.gradle versionName', cur, newVersionName);
      changed = true;
    }
  }

  if (newVersionCode !== null && newVersionCode !== undefined) {
    const cur = (gradle.match(/versionCode\s+(\d+)/) || [])[1] || '';
    const next = String(newVersionCode);
    if (cur !== next) {
      gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${next}`);
      log.changed('build.gradle versionCode', cur, next);
      changed = true;
    }
  }

  if (changed && !dryRun) fs.writeFileSync(APP_GRADLE, gradle, 'utf8');
  if (!changed) log.skipped('build.gradle version', `${newVersionName} (${newVersionCode})`);
  return changed;
}

// ─── Write Android app name (all localized strings.xml) ───────────────────────

/**
 * Update app_name in strings.xml for every locale (values/, values-fr/, values-ar/, …).
 */
function setAndroidAppName(newName, { dryRun = false } = {}) {
  // Collect all values*/ directories that have a strings.xml
  const stringsFiles = [MAIN_STRINGS];
  if (fs.existsSync(RES_DIR)) {
    for (const entry of fs.readdirSync(RES_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith('values-')) continue;
      const candidate = path.join(RES_DIR, entry.name, 'strings.xml');
      if (fs.existsSync(candidate)) stringsFiles.push(candidate);
    }
  }

  let anyChanged = false;
  for (const filePath of stringsFiles) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const updated = raw.replace(
      /<string name="app_name">[^<]*<\/string>/,
      `<string name="app_name">${newName}</string>`,
    );
    if (updated !== raw) {
      log.changed(path.relative(ROOT, filePath) + ' app_name', '', newName);
      if (!dryRun) fs.writeFileSync(filePath, updated, 'utf8');
      anyChanged = true;
    }
  }

  if (!anyChanged) log.skipped('strings.xml app_name', newName);
  return anyChanged;
}

// ─── Place Firebase config ────────────────────────────────────────────────────

function placeAndroidFirebaseConfig(sourcePath, { dryRun = false } = {}) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    log.warn(`Android Firebase config not found at "${sourcePath}" — skipped.`);
    return false;
  }
  const dest = GOOGLE_SERVICES;
  log.info(`Placing google-services.json → ${path.relative(ROOT, dest)}`);
  if (!dryRun) fs.copyFileSync(sourcePath, dest);

  // Warn if the package name inside the file doesn't match the current applicationId
  try {
    const json = JSON.parse(fs.readFileSync(dryRun ? sourcePath : dest, 'utf8'));
    for (const client of json.client || []) {
      const pkg = client?.client_info?.android_client_info?.package_name;
      const { applicationId } = readAndroidValues();
      if (pkg && pkg !== applicationId) {
        log.warn(
          `google-services.json package_name "${pkg}" does not match applicationId "${applicationId}". ` +
          'Download a fresh config from the Firebase Console after registration.',
        );
      }
    }
  } catch { /* ignore parse errors */ }

  return true;
}

// ─── Optional full package rename ────────────────────────────────────────────

/**
 * Full Java/Kotlin package rename — only runs when renamePackage: true in config.
 * Moves source directories and rewrites package declarations in .kt/.java files.
 */
function renameAndroidPackage(oldPkg, newPkg, { dryRun = false } = {}) {
  if (!oldPkg || !newPkg || oldPkg === newPkg) return;

  log.step('Android package rename (renamePackage: true)');

  const srcBase = path.join(ANDROID_DIR, 'app', 'src', 'main', 'java');
  const oldDir = path.join(srcBase, ...oldPkg.split('.'));
  const newDir = path.join(srcBase, ...newPkg.split('.'));

  // Update namespace in build.gradle
  let gradle = fs.readFileSync(APP_GRADLE, 'utf8');
  const nsUpdated = gradle.replace(
    /namespace\s+"[^"]+"/,
    `namespace "${newPkg}"`,
  );
  if (nsUpdated !== gradle) {
    log.changed('build.gradle namespace', oldPkg, newPkg);
    if (!dryRun) fs.writeFileSync(APP_GRADLE, nsUpdated, 'utf8');
  }

  if (!fs.existsSync(oldDir)) {
    log.warn(`Source dir ${oldDir} not found — skipping directory move.`);
    return;
  }

  // Move source directory
  const newDirParent = path.dirname(newDir);
  if (!dryRun) fs.mkdirSync(newDirParent, { recursive: true });
  log.info(`Moving ${path.relative(ROOT, oldDir)} → ${path.relative(ROOT, newDir)}`);
  if (!dryRun) fs.renameSync(oldDir, newDir);

  // Rewrite package declarations in all .kt and .java files
  const files = getAllSourceFiles(newDirParent, ['.kt', '.java']);
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const updated = raw
      .replace(new RegExp(`package\\s+${escapeRegex(oldPkg)}`, 'g'), `package ${newPkg}`)
      .replace(new RegExp(`import\\s+${escapeRegex(oldPkg)}\\.`, 'g'), `import ${newPkg}.`);
    if (updated !== raw) {
      if (!dryRun) fs.writeFileSync(file, updated, 'utf8');
      log.info(`Updated package declarations in ${path.relative(ROOT, file)}`);
    }
  }
}

function getAllSourceFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllSourceFiles(full, exts));
    else if (exts.some(e => entry.name.endsWith(e))) results.push(full);
  }
  return results;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  readAndroidValues,
  setAndroidApplicationId,
  setAndroidVersion,
  setAndroidAppName,
  placeAndroidFirebaseConfig,
  renameAndroidPackage,
};
