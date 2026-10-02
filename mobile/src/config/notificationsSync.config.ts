/**
 * Notifications Sync Configuration
 * Centralized configuration for notifications API polling
 */

export const NOTIFICATIONS_SYNC_CONFIG = {
  /**
   * Polling interval in milliseconds
   * Default: 30000 (30 seconds)
   *
   * Adjust based on your needs:
   * - 15000 (15 seconds) - More frequent updates
   * - 30000 (30 seconds) - Balanced ⭐ Recommended
   * - 60000 (1 minute) - Less frequent, more battery efficient
   */
  POLLING_INTERVAL: 30000,

  /**
   * Enable automatic polling via React Query refetchInterval.
   * 404 responses are swallowed gracefully, so this is safe to keep on.
   */
  AUTO_SYNC_ENABLED: true,

  /**
   * Only poll when app is in foreground
   * Saves battery and data when app is backgrounded
   */
  FOREGROUND_ONLY: true,

  /**
   * Stale time - how long before data is considered stale (ms)
   * Should be slightly less than polling interval
   */
  STALE_TIME: 25000, // 25 seconds

  /**
   * Cache time - how long to keep data in cache (ms)
   */
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes

  /**
   * Number of retry attempts on API failure
   */
  RETRY_ATTEMPTS: 3,

  /**
   * Pagination settings
   */
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,

  /**
   * Enable logging in development mode
   */
  ENABLE_DEV_LOGS: true,
};

/**
 * Get polling interval from config
 */
export const getNotificationsPollingInterval = (): number => {
  return NOTIFICATIONS_SYNC_CONFIG.POLLING_INTERVAL;
};

/**
 * Check if notifications sync is enabled
 */
export const isNotificationsSyncEnabled = (): boolean => {
  return NOTIFICATIONS_SYNC_CONFIG.AUTO_SYNC_ENABLED;
};

export default NOTIFICATIONS_SYNC_CONFIG;
