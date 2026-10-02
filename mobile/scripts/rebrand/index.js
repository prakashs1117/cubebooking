#!/usr/bin/env node
/**
 * scripts/rebrand/index.js — Orchestrator: runs iOS + Android in sequence.
 *
 *   yarn rebrand [--dry-run] [--skip-icons] [--skip-splash] [--skip-firebase]
 *               [--platform ios|android] [--config path/to/rebrand.config.js]
 *
 * --platform ios      runs only the iOS script
 * --platform android  runs only the Android script
 * (omit --platform to run both)
 *
 * All other flags are forwarded verbatim to the per-platform scripts.
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const { log, c } = require('../core/log');

const VALID_PLATFORMS = new Set(['ios', 'android', 'both']);

function parseArgs() {
  const args = process.argv.slice(2);
  const r = { platform: 'both', extraArgs: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--platform') {
      const p = args[++i];
      if (!p || !VALID_PLATFORMS.has(p)) {
        log.error(`--platform must be "ios" or "android". Got: "${p}"`);
        process.exit(1);
      }
      r.platform = p;
    } else {
      // Forward all other flags (--dry-run, --skip-*, --config …) to sub-scripts
      r.extraArgs.push(args[i]);
    }
  }
  return r;
}

function run(scriptPath, extraArgs) {
  try {
    execSync(
      `node ${JSON.stringify(scriptPath)} ${extraArgs.map(a => JSON.stringify(a)).join(' ')}`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..', '..') },
    );
  } catch (e) {
    log.error(`Script failed: ${path.basename(scriptPath)}`);
    process.exit(e.status || 1);
  }
}

async function main() {
  log.header();
  const { platform, extraArgs } = parseArgs();

  const iosScript     = path.join(__dirname, 'rebrand-ios.js');
  const androidScript = path.join(__dirname, 'rebrand-android.js');

  if (platform === 'ios' || platform === 'both') {
    run(iosScript, extraArgs);
  }
  if (platform === 'android' || platform === 'both') {
    run(androidScript, extraArgs);
  }

  if (platform === 'both') {
    console.log(`\n${c.bold}${c.green}✔  Both platforms rebranded successfully.${c.reset}\n`);
  }
}

main().catch(e => { log.error(e.message); process.exit(1); });
