'use strict';

const fs = require('fs');
const path = require('path');
const { log } = require('./log');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Load and validate rebrand.config.js from the repo root.
 * Returns {} if the file does not exist (all fields optional).
 */
function loadConfig(configPath) {
  const resolved = configPath
    ? path.resolve(configPath)
    : path.join(ROOT, 'rebrand.config.js');

  if (!fs.existsSync(resolved)) {
    log.warn(`No config file found at ${resolved} — using project values only.`);
    return {};
  }

  // Clear require cache so re-runs in tests always get fresh data
  delete require.cache[require.resolve(resolved)];
  try {
    return require(resolved);
  } catch (e) {
    log.warn(`Could not load ${resolved}: ${e.message}`);
    return {};
  }
}

/**
 * Validate the shape of a loaded config object.
 * Throws with a descriptive message on any invalid field.
 */
function validateConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') {
    throw new Error('rebrand.config.js must export a plain object.');
  }
  if (cfg.ios?.bundleId && !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){1,}$/.test(cfg.ios.bundleId)) {
    throw new Error(`ios.bundleId "${cfg.ios.bundleId}" is not a valid reverse-domain ID.`);
  }
  if (cfg.android?.applicationId && !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){1,}$/.test(cfg.android.applicationId)) {
    throw new Error(`android.applicationId "${cfg.android.applicationId}" is not a valid reverse-domain ID.`);
  }
  if (cfg.assets?.icon && !fs.existsSync(path.join(ROOT, cfg.assets.icon))) {
    log.warn(`assets.icon "${cfg.assets.icon}" not found — icon generation will be skipped.`);
  }
  if (cfg.assets?.splash && !fs.existsSync(path.join(ROOT, cfg.assets.splash))) {
    log.warn(`assets.splash "${cfg.assets.splash}" not found — splash generation will be skipped.`);
  }
}

module.exports = { loadConfig, validateConfig, ROOT };
