/**
 * Feature Flags Sync Configuration
 * Centralized configuration for feature flags API polling
 */

export const FEATURE_FLAGS_SYNC_CONFIG = {
  /**
   * Polling interval in milliseconds
   * Default: 60000 (1 minute)
   *
   * Adjust based on your needs:
   * - 30000 (30 seconds) - More frequent updates
   * - 60000 (1 minute) - Balanced
   * - 300000 (5 minutes) - Less frequent, more battery efficient
   */
  POLLING_INTERVAL: 60000,

  /**
   * Enable automatic polling
   * Set to false to disable automatic syncing and use local JSON only
   */
  AUTO_SYNC_ENABLED: false, // backend route not yet implemented — uses local JSON

  /**
   * Only poll when app is in foreground
   * Saves battery and data when app is backgrounded
   */
  FOREGROUND_ONLY: true,

  /**
   * Stale time - how long before data is considered stale (ms)
   * Should be slightly less than polling interval
   */
  STALE_TIME: 55000, // 55 seconds

  /**
   * Cache time - how long to keep data in cache (ms)
   */
  CACHE_TIME: 24 * 60 * 60 * 1000, // 24 hours

  /**
   * Number of retry attempts on API failure
   */
  RETRY_ATTEMPTS: 2,

  /**
   * Enable logging in development mode
   */
  ENABLE_DEV_LOGS: true,
};

/**
 * Get polling interval from config
 * Can be overridden by environment variables in the future
 */
export const getPollingInterval = (): number => {
  return FEATURE_FLAGS_SYNC_CONFIG.POLLING_INTERVAL;
};

/**
 * Check if feature flags sync is enabled
 */
export const isSyncEnabled = (): boolean => {
  return FEATURE_FLAGS_SYNC_CONFIG.AUTO_SYNC_ENABLED;
};

export default FEATURE_FLAGS_SYNC_CONFIG;
