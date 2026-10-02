/**
 * Crashlytics Service
 *
 * Centralised wrapper around @react-native-firebase/crashlytics.
 * All calls are fire-and-forget with silent error handling — crash reporting
 * must never crash or block the UI.
 *
 * Usage:
 *   import { crashlytics } from '@services/crashlyticsService';
 *   crashlytics.recordError(error);
 *   crashlytics.log('User tapped checkout');
 *   crashlytics.setUserId('user-123');
 */

import firebaseCrashlytics from '@react-native-firebase/crashlytics';
import { getFeatureFlagValue } from '@stores/featureFlagsStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Wraps a Crashlytics call so errors never propagate to the app. */
const safe = (fn: () => Promise<void>): void => {
  if (!getFeatureFlagValue('analytics_enabled')) return;
  fn().catch(() => {});
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const crashlytics = {
  /**
   * Record a non-fatal JS error.
   * Pass the raw Error object — Crashlytics will capture the stack trace.
   */
  recordError: (error: Error, jsErrorContext?: string): void => {
    safe(() =>
      firebaseCrashlytics()
        .recordError(error, jsErrorContext)
        .then(() => {}),
    );
  },

  /**
   * Add a breadcrumb log message visible in the Crashlytics dashboard
   * alongside any subsequent crash or error report.
   */
  log: (message: string): void => {
    safe(() =>
      firebaseCrashlytics()
        .log(message)
        .then(() => {}),
    );
  },

  /**
   * Associate a user identifier with crash reports.
   * Call after login; call with an empty string on logout.
   */
  setUserId: (userId: string): void => {
    safe(() =>
      firebaseCrashlytics()
        .setUserId(userId)
        .then(() => {}),
    );
  },

  /**
   * Attach a custom key-value attribute to crash reports.
   * Useful for recording app state (screen, feature flags, etc.).
   */
  setAttribute: (key: string, value: string | number | boolean): void => {
    safe(() =>
      firebaseCrashlytics()
        .setAttribute(key, String(value))
        .then(() => {}),
    );
  },

  /**
   * Attach multiple custom attributes at once.
   */
  setAttributes: (attributes: Record<string, string>): void => {
    safe(() =>
      firebaseCrashlytics()
        .setAttributes(attributes)
        .then(() => {}),
    );
  },

  /**
   * Force-enable or disable Crashlytics collection at runtime.
   */
  setCrashlyticsCollectionEnabled: (enabled: boolean): void => {
    safe(() =>
      firebaseCrashlytics()
        .setCrashlyticsCollectionEnabled(enabled)
        .then(() => {}),
    );
  },
};
