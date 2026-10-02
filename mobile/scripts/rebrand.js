#!/usr/bin/env node
/**
 * rebrand.js — Change app name, bundle ID, and version across iOS + Android in one pass.
 *
 * Reads defaults from rebrand.config.js at the repo root. CLI flags override config values.
 *
 * Config-driven (uses rebrand.config.js):
 *   node scripts/rebrand.js
 *
 * Flag mode (override config values):
 *   node scripts/rebrand.js \
 *     --app-name    "Pharma Connect"   \
 *     --bundle-id   "com.merck.pharmaconnect" \
 *     --version     "2.0.0"            \
 *     --build-number 10
 *
 * Dry-run (preview changes without writing):
 *   node scripts/rebrand.js --dry-run
 *
 * Any flag can be omitted to keep the value from rebrand.config.js or the current project state.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// ─── Colour helpers ───────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  grey: '\x1b[90m',
};
const log = {
  info: m => console.log(`${c.cyan}ℹ${c.reset}  ${m}`),
  ok: m => console.log(`${c.green}✔${c.reset}  ${m}`),
  warn: m => console.log(`${c.yellow}⚠${c.reset}  ${m}`),
  error: m => console.log(`${c.red}✖${c.reset}  ${m}`),
  step: m => console.log(`\n${c.bold}${c.blue}▶  ${m}${c.reset}`),
  changed: (f, a, b) =>
    console.log(
      `   ${c.grey}${f}${c.reset}\n     ${c.red}− ${a}${c.reset}\n     ${c.green}+ ${b}${c.reset}`,
    ),
  skipped: (f, v) =>
    console.log(`   ${c.grey}${f} — unchanged (${v})${c.reset}`),
  header: () => {
    console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════╗`);
    console.log(`║       RN App Rebrand Wizard          ║`);
    console.log(`╚══════════════════════════════════════╝${c.reset}\n`);
  },
};

// ─── Load rebrand.config.js (optional — falls back gracefully) ────────────────
function loadConfig() {
  const configPath = path.resolve(__dirname, '..', 'rebrand.config.js');
  if (!fs.existsSync(configPath)) return {};
  try {
    return require(configPath);
  } catch (e) {
    log.warn(`Could not load rebrand.config.js: ${e.message}`);
    return {};
  }
}

// ─── Git dirty-tree guard ─────────────────────────────────────────────────────
function assertCleanWorkingTree(dryRun) {
  if (dryRun) return; // dry-run never writes, so dirty tree is fine
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim().length > 0) {
      log.error('Working tree is dirty. Commit or stash your changes first.');
      log.error('This ensures the rebrand is fully reversible via git.');
      console.log('');
      console.log(status.trim().split('\n').map(l => `   ${l}`).join('\n'));
      console.log('');
      log.info('Tip: run with --dry-run to preview changes without this check.');
      process.exit(1);
    }
  } catch {
    log.warn('Could not check git status — proceeding without dirty-tree guard.');
  }
}

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');

const FILES = {
  packageJson: path.join(ROOT, 'package.json'),
  androidGradle: path.join(ROOT, 'android/app/build.gradle'),
  androidStrings: path.join(
    ROOT,
    'android/app/src/main/res/values/strings.xml',
  ),
  androidGoogleServices: path.join(ROOT, 'android/app/google-services.json'),
  iosPlist: path.join(ROOT, 'ios/TodoAppRN/Info.plist'),
  iosPbxproj: path.join(ROOT, 'ios/TodoAppRN.xcodeproj/project.pbxproj'),
  iosGoogleService: path.join(ROOT, 'ios/GoogleService-Info.plist'),
};

// ─── Read current values from project files ───────────────────────────────────
function readCurrentValues() {
  const pkg = JSON.parse(fs.readFileSync(FILES.packageJson, 'utf8'));
  const gradle = fs.readFileSync(FILES.androidGradle, 'utf8');
  const pbxproj = fs.readFileSync(FILES.iosPbxproj, 'utf8');
  const plist = fs.readFileSync(FILES.iosPlist, 'utf8');
  const strings = fs.readFileSync(FILES.androidStrings, 'utf8');

  const androidBundleId =
    (gradle.match(/applicationId\s+"([^"]+)"/) || [])[1] || '';
  const androidVersion =
    (gradle.match(/versionName\s+"([^"]+)"/) || [])[1] || '';
  const androidBuildNum = (gradle.match(/versionCode\s+(\d+)/) || [])[1] || '1';
  const iosBundleId =
    (pbxproj.match(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;]+);/) ||
      [])[1]?.trim() || '';
  const iosVersion =
    (pbxproj.match(/MARKETING_VERSION\s*=\s*([^;]+);/) || [])[1]?.trim() || '';
  const iosBuildNum =
    (pbxproj.match(/CURRENT_PROJECT_VERSION\s*=\s*([^;]+);/) ||
      [])[1]?.trim() || '1';
  const iosDisplayName =
    (plist.match(
      /<key>CFBundleDisplayName<\/key>\s*<string>([^<]+)<\/string>/,
    ) || [])[1] || '';
  const androidAppName =
    (strings.match(/<string name="app_name">([^<]+)<\/string>/) || [])[1] || '';

  return {
    appName: iosDisplayName || androidAppName || pkg.name,
    bundleId: iosBundleId || androidBundleId || '',
    version: iosVersion || androidVersion || pkg.version || '1.0.0',
    buildNumber: iosBuildNum || androidBuildNum || '1',
  };
}

// ─── Validation helpers ───────────────────────────────────────────────────────
const BUNDLE_ID_RE = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){1,}$/;
const VERSION_RE = /^\d+\.\d+\.\d+$/;

function validateBundleId(id) {
  if (!BUNDLE_ID_RE.test(id)) {
    throw new Error(
      `Bundle ID "${id}" is invalid. Use reverse-domain format, e.g. com.company.app`,
    );
  }
}
function validateVersion(v) {
  if (!VERSION_RE.test(v)) {
    throw new Error(`Version "${v}" must be semver format, e.g. 1.2.3`);
  }
}
function validateBuildNumber(n) {
  if (!/^\d+$/.test(n) || parseInt(n, 10) < 1) {
    throw new Error(`Build number "${n}" must be a positive integer`);
  }
}

// ─── CLI arg parser ───────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { dryRun: false };
  for (let i = 0; i < args.length; i++) {
    const k = args[i];
    const v = args[i + 1];
    if (k === '--dry-run') {
      result.dryRun = true;
    }
    if (k === '--app-name') {
      result.appName = v;
      i++;
    }
    if (k === '--bundle-id') {
      result.bundleId = v;
      i++;
    }
    if (k === '--version') {
      result.version = v;
      i++;
    }
    if (k === '--build-number') {
      result.buildNumber = v;
      i++;
    }
  }
  return result;
}

// ─── Interactive prompt helper ────────────────────────────────────────────────
function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function gatherInputs(current, preArgs) {
  const inputs = {};
  const hasSomeFlags =
    preArgs.appName ||
    preArgs.bundleId ||
    preArgs.version ||
    preArgs.buildNumber;

  if (hasSomeFlags) {
    // Non-interactive: use flags, fall back to current values
    inputs.appName = preArgs.appName || current.appName;
    inputs.bundleId = preArgs.bundleId || current.bundleId;
    inputs.version = preArgs.version || current.version;
    inputs.buildNumber = preArgs.buildNumber || current.buildNumber;
    return inputs;
  }

  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    `${c.dim}Current values shown in brackets. Press Enter to keep them.${c.reset}\n`,
  );

  const rawName = await prompt(
    rl,
    `  App Name        [${c.yellow}${current.appName}${c.reset}]: `,
  );
  const rawId = await prompt(
    rl,
    `  Bundle ID       [${c.yellow}${current.bundleId}${c.reset}]: `,
  );
  const rawVer = await prompt(
    rl,
    `  Version         [${c.yellow}${current.version}${c.reset}]: `,
  );
  const rawBuild = await prompt(
    rl,
    `  Build Number    [${c.yellow}${current.buildNumber}${c.reset}]: `,
  );

  rl.close();

  inputs.appName = rawName.trim() || current.appName;
  inputs.bundleId = rawId.trim() || current.bundleId;
  inputs.version = rawVer.trim() || current.version;
  inputs.buildNumber = rawBuild.trim() || current.buildNumber;

  return inputs;
}

// ─── File patcher helpers ─────────────────────────────────────────────────────
function patchFile(filePath, patcher, dryRun) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = patcher(original);
  if (original === updated) return false;
  if (!dryRun) fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

// Replace every occurrence of a regex with a replacement
function replaceAll(content, regex, replacement) {
  return content.replace(new RegExp(regex, 'g'), replacement);
}

// ─── Individual file patchers ─────────────────────────────────────────────────
function patchPackageJson({ appName, version }, dryRun, cur) {
  const shortName = appName.replace(/\s+/g, ''); // "Pharma Connect" → "PharmaConnect"
  const changed = patchFile(
    FILES.packageJson,
    raw => {
      let out = raw;
      out = out.replace(/"name"\s*:\s*"[^"]+"/, `"name": "${shortName}"`);
      out = out.replace(/"version"\s*:\s*"[^"]+"/, `"version": "${version}"`);
      return out;
    },
    dryRun,
  );

  if (changed) {
    log.changed('package.json  name', cur.appName, shortName);
    log.changed('package.json  version', cur.version, version);
  } else {
    log.skipped('package.json', `${shortName} / ${version}`);
  }
}

function patchAndroidGradle({ bundleId, version, buildNumber }, dryRun, cur) {
  const changed = patchFile(
    FILES.androidGradle,
    raw => {
      let out = raw;
      out = out.replace(
        /applicationId\s+"[^"]+"/,
        `applicationId "${bundleId}"`,
      );
      out = out.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`);
      out = out.replace(/versionCode\s+\d+/, `versionCode ${buildNumber}`);
      return out;
    },
    dryRun,
  );

  if (changed) {
    log.changed('build.gradle  applicationId', cur.bundleId, bundleId);
    log.changed('build.gradle  versionName', cur.version, version);
    log.changed('build.gradle  versionCode', cur.buildNumber, buildNumber);
  } else {
    log.skipped('build.gradle', `${bundleId} / ${version} (${buildNumber})`);
  }
}

function patchAndroidStrings({ appName }, dryRun, cur) {
  const changed = patchFile(
    FILES.androidStrings,
    raw =>
      raw.replace(
        /<string name="app_name">[^<]*<\/string>/,
        `<string name="app_name">${appName}</string>`,
      ),
    dryRun,
  );

  if (changed) log.changed('strings.xml  app_name', cur.appName, appName);
  else log.skipped('strings.xml', appName);
}

function patchAndroidGoogleServices({ bundleId }, dryRun, cur) {
  if (!fs.existsSync(FILES.androidGoogleServices)) {
    log.warn('android/app/google-services.json not found — skipped');
    return;
  }
  const changed = patchFile(
    FILES.androidGoogleServices,
    raw => {
      const json = JSON.parse(raw);
      for (const client of json.client || []) {
        if (client?.client_info?.android_client_info?.package_name) {
          client.client_info.android_client_info.package_name = bundleId;
        }
      }
      return JSON.stringify(json, null, 2) + '\n';
    },
    dryRun,
  );

  if (changed) {
    log.changed('google-services.json  package_name', cur.bundleId, bundleId);
    log.warn(
      'google-services.json updated — re-download from Firebase Console if this is a new project',
    );
  } else {
    log.skipped('google-services.json', bundleId);
  }
}

function patchIosPlist({ appName }, dryRun, cur) {
  const changed = patchFile(
    FILES.iosPlist,
    raw =>
      raw.replace(
        /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
        `$1${appName}$2`,
      ),
    dryRun,
  );

  if (changed)
    log.changed('Info.plist  CFBundleDisplayName', cur.appName, appName);
  else log.skipped('Info.plist', appName);
}

function patchIosPbxproj({ bundleId, version, buildNumber }, dryRun, cur) {
  const changed = patchFile(
    FILES.iosPbxproj,
    raw => {
      let out = raw;
      // Replace all occurrences (Debug + Release blocks both have these keys)
      out = replaceAll(
        out,
        'PRODUCT_BUNDLE_IDENTIFIER\\s*=\\s*[^;]+;',
        `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`,
      );
      out = replaceAll(
        out,
        'MARKETING_VERSION\\s*=\\s*[^;]+;',
        `MARKETING_VERSION = ${version};`,
      );
      out = replaceAll(
        out,
        'CURRENT_PROJECT_VERSION\\s*=\\s*[^;]+;',
        `CURRENT_PROJECT_VERSION = ${buildNumber};`,
      );
      return out;
    },
    dryRun,
  );

  if (changed) {
    log.changed(
      'project.pbxproj  PRODUCT_BUNDLE_IDENTIFIER',
      cur.bundleId,
      bundleId,
    );
    log.changed('project.pbxproj  MARKETING_VERSION', cur.version, version);
    log.changed(
      'project.pbxproj  CURRENT_PROJECT_VERSION',
      cur.buildNumber,
      buildNumber,
    );
  } else {
    log.skipped('project.pbxproj', `${bundleId} / ${version} (${buildNumber})`);
  }
}

function patchIosGoogleServiceInfo({ bundleId }, dryRun, cur) {
  if (!fs.existsSync(FILES.iosGoogleService)) {
    log.warn('ios/GoogleService-Info.plist not found — skipped');
    return;
  }
  const changed = patchFile(
    FILES.iosGoogleService,
    raw =>
      raw.replace(
        /(<key>BUNDLE_ID<\/key>\s*<string>)[^<]*(<\/string>)/,
        `$1${bundleId}$2`,
      ),
    dryRun,
  );

  if (changed) {
    log.changed('GoogleService-Info.plist  BUNDLE_ID', cur.bundleId, bundleId);
    log.warn(
      'GoogleService-Info.plist updated — re-download from Firebase Console if this is a new project',
    );
  } else {
    log.skipped('GoogleService-Info.plist', bundleId);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log.header();

  const preArgs = parseArgs();
  assertCleanWorkingTree(preArgs.dryRun);

  // Merge: config file → project state → CLI flags (highest priority)
  const cfg = loadConfig();
  const cfgDefaults = {
    appName: cfg.appName,
    bundleId: cfg.ios?.bundleId || cfg.android?.applicationId,
  };

  const current = readCurrentValues();
  // Config values become the new "current" when they differ from project state
  // (lets you drive the rebrand purely from rebrand.config.js with no flags)
  if (cfgDefaults.appName && cfgDefaults.appName !== current.appName) {
    preArgs.appName = preArgs.appName || cfgDefaults.appName;
  }
  if (cfgDefaults.bundleId && cfgDefaults.bundleId !== current.bundleId) {
    preArgs.bundleId = preArgs.bundleId || cfgDefaults.bundleId;
  }

  log.info(`Detected current values:`);
  console.log(`   App Name    : ${c.yellow}${current.appName}${c.reset}`);
  console.log(`   Bundle ID   : ${c.yellow}${current.bundleId}${c.reset}`);
  console.log(`   Version     : ${c.yellow}${current.version}${c.reset}`);
  console.log(`   Build Number: ${c.yellow}${current.buildNumber}${c.reset}\n`);

  if (preArgs.dryRun) log.warn('DRY-RUN mode — no files will be written\n');

  // Gather inputs (interactive or from flags)
  const inputs = await gatherInputs(current, preArgs);

  // Validate
  try {
    if (inputs.bundleId !== current.bundleId) validateBundleId(inputs.bundleId);
    if (inputs.version !== current.version) validateVersion(inputs.version);
    if (inputs.buildNumber !== current.buildNumber)
      validateBuildNumber(inputs.buildNumber);
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }

  // Summary before writing
  console.log(`\n${c.bold}Changes to apply:${c.reset}`);
  const fields = [
    ['App Name', current.appName, inputs.appName],
    ['Bundle ID', current.bundleId, inputs.bundleId],
    ['Version', current.version, inputs.version],
    ['Build Number', current.buildNumber, inputs.buildNumber],
  ];
  for (const [label, from, to] of fields) {
    if (from !== to) {
      console.log(
        `   ${label.padEnd(13)}: ${c.red}${from}${c.reset}  →  ${c.green}${to}${
          c.reset
        }`,
      );
    } else {
      console.log(
        `   ${label.padEnd(13)}: ${c.grey}${from} (unchanged)${c.reset}`,
      );
    }
  }

  const hasChanges = fields.some(([, from, to]) => from !== to);
  if (!hasChanges) {
    log.info('Nothing to change. Exiting.');
    process.exit(0);
  }

  if (!preArgs.dryRun) {
    // Confirm if interactive
    const hasSomeFlags =
      preArgs.appName ||
      preArgs.bundleId ||
      preArgs.version ||
      preArgs.buildNumber;
    if (!hasSomeFlags) {
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await prompt(rl2, `\n  Proceed? (y/N): `);
      rl2.close();
      if (answer.trim().toLowerCase() !== 'y') {
        log.info('Aborted.');
        process.exit(0);
      }
    }
  }

  console.log('');

  // ── Android ────────────────────────────────────────────────────────────────
  log.step('Android');
  patchAndroidGradle(inputs, preArgs.dryRun, current);
  patchAndroidStrings(inputs, preArgs.dryRun, current);
  patchAndroidGoogleServices(inputs, preArgs.dryRun, current);

  // ── iOS ────────────────────────────────────────────────────────────────────
  log.step('iOS');
  patchIosPlist(inputs, preArgs.dryRun, current);
  patchIosPbxproj(inputs, preArgs.dryRun, current);
  patchIosGoogleServiceInfo(inputs, preArgs.dryRun, current);

  // ── Shared ─────────────────────────────────────────────────────────────────
  log.step('Shared');
  patchPackageJson(inputs, preArgs.dryRun, current);

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log('');
  if (preArgs.dryRun) {
    log.warn('Dry-run complete — no files were modified');
  } else {
    log.ok(`${c.bold}Rebranding complete!${c.reset}`);
    console.log('');
    log.info('Next steps:');
    console.log(
      `   ${c.grey}1. Android: run  npx react-native run-android  (or generate-apk)${c.reset}`,
    );
    console.log(
      `   ${c.grey}2. iOS:     run  bundle exec pod install  then  npx react-native run-ios${c.reset}`,
    );
    if (inputs.bundleId !== current.bundleId) {
      console.log(
        `   ${c.grey}3. Firebase: if this is a brand-new bundle ID, update google-services.json${c.reset}`,
      );
      console.log(
        `   ${c.grey}            and GoogleService-Info.plist from the Firebase Console.${c.reset}`,
      );
    }
    console.log('');
  }
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
