/**
 * Feature Flag Migration Utility
 *
 * Maps old feature flag keys to new API-compatible keys
 * Ensures backward compatibility during transition
 */

/**
 * Mapping from old flag keys (UPPERCASE) to new flag keys (lowercase_with_underscores)
 */
export const FEATURE_FLAG_KEY_MAPPING: Record<string, string> = {
  // UI Features
  ENABLE_HOME_CAROUSEL: 'home_carousel',
  ENABLE_DRAWER_NAVIGATION: 'drawer_navigation',
  ENABLE_TAB_NAVIGATION: 'tab_navigation',
  ENABLE_DARK_MODE: 'dark_mode',
  ENABLE_ABOUT_SCREEN: 'about_screen',
  ENABLE_HEADER_SEARCH: 'header_search',
  ENABLE_HEADER_NOTIFICATIONS: 'header_notifications',
  ENABLE_HEADER_PROFILE: 'header_profile',
  ENABLE_FAQ: 'faq_screen',
  ENABLE_AI_SEARCH: 'ai_search',
  ENABLE_HIDE_TAB_BAR_ON_SCROLL: 'hide_tab_bar_on_scroll',

  // Feature Flags
  ENABLE_ONBOARDING: 'new_onboarding_flow',
  ENABLE_TERMS_AND_PRIVACY_POPUP: 'terms_privacy_popup',
  ENABLE_OFFLINE_SYNC: 'offline_mode',
  ENABLE_PUSH_NOTIFICATIONS: 'push_notifications',
  ENABLE_BIOMETRIC_AUTH: 'biometric_auth',

  // Social Login
  ENABLE_SOCIAL_LOGIN_GOOGLE: 'social_login',
  ENABLE_SOCIAL_LOGIN_APPLE: 'social_login',
  ENABLE_SOCIAL_LOGIN_FACEBOOK: 'social_login',

  // Analytics
  ENABLE_ANALYTICS: 'analytics_tracking',
  ENABLE_PERFORMANCE_MONITORING: 'performance_monitoring',

  // Experimental
  ENABLE_NEW_TODO_UI: 'new_todo_ui',
  ENABLE_REAL_TIME_UPDATES: 'real_time_updates',
  ENABLE_AI_FEATURES: 'ai_event_summary',

  // Debug
  SHOW_DEBUG_INFO: 'debug_mode',
  ENABLE_FEATURE_FLAGS_SCREEN: 'feature_flags_screen',
  ENABLE_ICON_GALLERY: 'icon_gallery',
};

/**
 * Reverse mapping: new keys to old keys
 */
export const REVERSE_KEY_MAPPING: Record<string, string[]> = Object.entries(
  FEATURE_FLAG_KEY_MAPPING,
).reduce((acc, [oldKey, newKey]) => {
  if (!acc[newKey]) {
    acc[newKey] = [];
  }
  acc[newKey].push(oldKey);
  return acc;
}, {} as Record<string, string[]>);

/**
 * Convert old flag key to new flag key
 */
export const migrateFeatureFlagKey = (oldKey: string): string => {
  return FEATURE_FLAG_KEY_MAPPING[oldKey] || oldKey.toLowerCase();
};

/**
 * Convert new flag key to old flag key (for backward compatibility)
 */
export const reverseFeatureFlagKey = (newKey: string): string => {
  const oldKeys = REVERSE_KEY_MAPPING[newKey];
  return oldKeys && oldKeys.length > 0 ? oldKeys[0] : newKey.toUpperCase();
};

/**
 * Check if a flag key is in the old format
 */
export const isOldFormatKey = (key: string): boolean => {
  return key === key.toUpperCase() && key.includes('ENABLE_');
};

/**
 * Check if a flag key is in the new format
 */
export const isNewFormatKey = (key: string): boolean => {
  return key === key.toLowerCase() && key.includes('_');
};
