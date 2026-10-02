#!/usr/bin/env node
/**
 * API URL Switcher
 *
 * Toggles API_BASE_URL in .env and the fallback in src/config/index.ts
 * between the remote Vercel endpoint and localhost.
 *
 * Usage:
 *   npm run api:local    →  http://localhost:3000/api/v1
 *   npm run api:remote   →  https://localhost:4000/api/v1
 *
 * Android emulator note:
 *   Use `npm run api:emu` for the Android emulator loopback (10.0.2.2).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
const CONFIG_FILE = path.join(ROOT, 'src', 'config', 'index.ts');

const URLS = {
  remote:
    'mongodb+srv://Vercel-Admin-demand-atlas-chestnut-park:rVgyMCIN6DBnoqNP@demand-atlas-chestnut-p.z1cupt6.mongodb.net/?retryWrites=true&w=majority/api/v1',
  local: 'http://localhost:8000/api/v1',
  ios: 'http://192.168.0.167:8000/api/v1',
  emu: 'http://10.0.2.2:8000/api/v1',
};

const target = process.argv[2];

if (!URLS[target]) {
  console.error(`Usage: node switch-api.js <local|ios|remote|emu>`);
  console.error(`  local   → ${URLS.local}`);
  console.error(`  ios     → ${URLS.ios}  (iOS Simulator — Mac LAN IP)`);
  console.error(`  remote  → ${URLS.remote}`);
  console.error(`  emu     → ${URLS.emu}  (Android emulator)`);
  process.exit(1);
}

const targetUrl = URLS[target];

// ─── .env ─────────────────────────────────────────────────────────────────────

let env = fs.readFileSync(ENV_FILE, 'utf8');

// Comment out all API_BASE_URL= lines (both active and already-commented)
env = env.replace(/^(# ?)?API_BASE_URL=.+$/gm, match => {
  const clean = match.replace(/^# ?/, '').trim();
  return `# ${clean}`;
});

// Activate the target URL (uncomment it, or append it if not present)
const targetEnvLine = `API_BASE_URL=${targetUrl}`;
const commentedTarget = `# ${targetEnvLine}`;

if (env.includes(commentedTarget)) {
  env = env.replace(commentedTarget, targetEnvLine);
} else {
  // Line isn't present at all — append it after the last API_BASE_URL block
  env = env.replace(/((?:# ?API_BASE_URL=.+\n?)+)/, `$1${targetEnvLine}\n`);
  if (!env.includes(targetEnvLine)) {
    env += `\n${targetEnvLine}\n`;
  }
}

fs.writeFileSync(ENV_FILE, env, 'utf8');

// ─── src/config/index.ts ──────────────────────────────────────────────────────

let cfg = fs.readFileSync(CONFIG_FILE, 'utf8');

// Comment out all baseUrl fallback lines inside apiConfig
cfg = cfg.replace(
  /^(\s*)(\/\/ ?)?(baseUrl: API_BASE_URL \|\| '.+'[,;]?\s*)$/gm,
  (_, indent, _comment, rest) => {
    return `${indent}// ${rest.trimEnd()}`;
  },
);

// Uncomment the line matching our target URL
const targetCfgPattern = new RegExp(
  `(^\\s*)// (baseUrl: API_BASE_URL \\|\\| '${escapeRegex(
    targetUrl,
  )}'[,;]?\\s*)$`,
  'm',
);

if (targetCfgPattern.test(cfg)) {
  cfg = cfg.replace(targetCfgPattern, '$1$2');
} else {
  // Line not present — insert it after the first commented-out baseUrl line
  cfg = cfg.replace(
    /(^\s*\/\/ baseUrl: API_BASE_URL \|\| '.+'[,;]?\s*\n)/m,
    `$1  baseUrl: API_BASE_URL || '${targetUrl}',\n`,
  );
}

fs.writeFileSync(CONFIG_FILE, cfg, 'utf8');

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log(`API switched to: ${target}`);
console.log(`  URL: ${targetUrl}`);
console.log('');
console.log('Restart Metro and rebuild for the change to take effect:');
console.log('  npm start -- --reset-cache');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
