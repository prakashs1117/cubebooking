/**
 * Analytics Service
 *
 * Centralised wrapper around @react-native-firebase/analytics.
 * All calls are fire-and-forget with silent error handling — analytics
 * must never crash or block the UI.
 *
 * Usage:
 *   import { analytics } from '@services/analyticsService';
 *   analytics.logScreenView('HomeScreen');
 *   analytics.logLogin('email');
 *   analytics.logAtlasSearch({ search_query: 'sodium chloride', result_count: 42 });
 */

import firebaseAnalytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import type { RatePromptContext } from '@hooks/useRatePrompt';
import { getFeatureFlagValue } from '@stores/featureFlagsStore';

const APP_VERSION = '0.0.1';

// ─── Types ───────────────────────────────────────────────────────────────────

type ValidityArea = 'EU' | 'US' | 'CN';
type Language = 'EN' | 'FR' | 'AR' | 'ZH';
type PlatformOS = 'ios' | 'android';

interface CommonParams {
  platform_os: PlatformOS;
  app_version: string;
}

interface ContextParams {
  validity_area?: ValidityArea;
  language?: Language;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get platform and app version for all events. */
const getCommonParams = (): CommonParams => ({
  platform_os: Platform.OS as PlatformOS,
  app_version: APP_VERSION,
});

/**
 * Wraps a Firebase Analytics call so it:
 *  1. Silently no-ops when analytics is disabled via feature flag
 *  2. Never propagates errors — analytics must not affect the app
 *  3. FIXED: uses correct flag key 'analytics_tracking' (was 'analytics_enabled')
 */
const safe = (fn: () => Promise<void>): void => {
  if (!getFeatureFlagValue('analytics_tracking')) return;
  fn().catch(() => {});
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const analytics = {
  // ── Navigation ─────────────────────────────────────────────────────────

  /** Call from NavigationContainer's onStateChange to track screen views. */
  logScreenView: (screenName: string, screenClass?: string): void => {
    safe(() =>
      firebaseAnalytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      }),
    );
  },

  // ── Authentication ─────────────────────────────────────────────────────

  /** User successfully signed in. */
  logLogin: (method: string = 'email', validityArea?: ValidityArea): void => {
    safe(() =>
      firebaseAnalytics().logLogin({
        method,
        ...getCommonParams(),
        ...(validityArea ? { region: validityArea } : {}),
      }),
    );
  },

  /** User signed up for the first time. */
  logSignUp: (method: string = 'email', validityArea?: ValidityArea): void => {
    safe(() =>
      firebaseAnalytics().logSignUp({
        method,
        ...getCommonParams(),
        ...(validityArea ? { region: validityArea } : {}),
      }),
    );
  },

  /** User logged out. */
  logLogout: (sessionDurationSeconds?: number): void => {
    safe(() =>
      firebaseAnalytics().logEvent('logout', {
        ...getCommonParams(),
        ...(sessionDurationSeconds !== undefined
          ? { session_duration_seconds: sessionDurationSeconds }
          : {}),
      }),
    );
  },

  // ── Search & Discovery ─────────────────────────────────────────────────

  /** User performed a search query against ATLAS API. */
  logAtlasSearch: (params: {
    search_query: string;
    search_type: 'text' | 'barcode' | 'cas_number';
    result_count: number;
    result_limit?: number;
    validity_area: ValidityArea;
    language: Language;
    filter_applied?: boolean;
    api_response_time_ms?: number;
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('atlas_search', {
        search_query: params.search_query.substring(0, 100),
        search_type: params.search_type,
        result_count: params.result_count,
        ...(params.result_limit ? { result_limit: params.result_limit } : {}),
        validity_area: params.validity_area,
        language: params.language,
        ...(params.filter_applied !== undefined
          ? { filter_applied: params.filter_applied }
          : {}),
        ...(params.api_response_time_ms
          ? { api_response_time_ms: params.api_response_time_ms }
          : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** User scanned a barcode to search for a product. */
  logBarcodeScanned: (params: {
    barcode_value: string;
    barcode_format: string;
    scan_result: 'success' | 'not_found' | 'invalid' | 'timeout';
    material_number?: string;
    validity_area: ValidityArea;
    scan_time_ms?: number;
    retry_count?: number;
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('barcode_scanned', {
        barcode_value: params.barcode_value.substring(0, 100),
        barcode_format: params.barcode_format,
        scan_result: params.scan_result,
        ...(params.material_number
          ? { material_number: params.material_number }
          : {}),
        validity_area: params.validity_area,
        ...(params.scan_time_ms ? { scan_time_ms: params.scan_time_ms } : {}),
        ...(params.retry_count !== undefined
          ? { retry_count: params.retry_count }
          : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** User viewed a Safety Data Sheet (SDS). */
  logSDSViewed: (params: {
    material_number: string;
    product_name?: string;
    sds_system?: 'NEX' | 'P24';
    validity_area: ValidityArea;
    language: Language;
    sections_viewed?: string[];
    scroll_depth_percent?: number;
    time_on_sds_seconds?: number;
    source?: 'search' | 'barcode' | 'favorites' | 'history';
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('sds_viewed', {
        material_number: params.material_number,
        ...(params.product_name
          ? {
              product_name: params.product_name.substring(0, 100),
            }
          : {}),
        ...(params.sds_system ? { sds_system: params.sds_system } : {}),
        validity_area: params.validity_area,
        language: params.language,
        ...(params.sections_viewed && params.sections_viewed.length > 0
          ? { sections_viewed: params.sections_viewed.join(',') }
          : {}),
        ...(params.scroll_depth_percent !== undefined
          ? { scroll_depth_percent: params.scroll_depth_percent }
          : {}),
        ...(params.time_on_sds_seconds !== undefined
          ? { time_on_sds_seconds: params.time_on_sds_seconds }
          : {}),
        ...(params.source ? { source: params.source } : {}),
        ...getCommonParams(),
      }),
    );
  },

  // ── Favorites ──────────────────────────────────────────────────────────

  /** Item added to a favorites list. */
  logFavoriteAdded: (params: {
    material_number: string;
    list_id: string;
    list_name: string;
    list_item_count_before: number;
    list_item_count_after: number;
    validity_area: ValidityArea;
    language: Language;
    product_name?: string;
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('favorite_added', {
        material_number: params.material_number,
        list_id: params.list_id,
        list_name: params.list_name.substring(0, 100),
        list_item_count_before: params.list_item_count_before,
        list_item_count_after: params.list_item_count_after,
        validity_area: params.validity_area,
        language: params.language,
        ...(params.product_name
          ? {
              product_name: params.product_name.substring(0, 100),
            }
          : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** Item removed from a favorites list. */
  logFavoriteRemoved: (params: {
    material_number: string;
    list_id: string;
    list_name: string;
    list_item_count_before: number;
    list_item_count_after: number;
    validity_area: ValidityArea;
    language: Language;
    reason?: 'manual_remove' | 'list_deleted';
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('favorite_removed', {
        material_number: params.material_number,
        list_id: params.list_id,
        list_name: params.list_name.substring(0, 100),
        list_item_count_before: params.list_item_count_before,
        list_item_count_after: params.list_item_count_after,
        validity_area: params.validity_area,
        language: params.language,
        ...(params.reason ? { reason: params.reason } : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** New favorites list created. */
  logFavoritesListCreated: (params: {
    list_id: string;
    list_name: string;
    validity_area: ValidityArea;
    language: Language;
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('favorites_list_created', {
        list_id: params.list_id,
        list_name: params.list_name.substring(0, 100),
        list_name_length: params.list_name.length,
        validity_area: params.validity_area,
        language: params.language,
        ...getCommonParams(),
      }),
    );
  },

  /** Favorites list deleted. */
  logFavoritesListDeleted: (params: {
    list_id: string;
    list_name: string;
    item_count_at_deletion: number;
    validity_area: ValidityArea;
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('favorites_list_deleted', {
        list_id: params.list_id,
        list_name: params.list_name.substring(0, 100),
        item_count_at_deletion: params.item_count_at_deletion,
        validity_area: params.validity_area,
        ...getCommonParams(),
      }),
    );
  },

  // ── Safety Labels ──────────────────────────────────────────────────────

  /** Safety label(s) generated for product(s). */
  logLabelGenerated: (params: {
    material_number: string;
    product_name?: string;
    label_count: number;
    label_type?: 'safety_tag' | 'ghs_label' | 'custom';
    template_size?: 'big' | 'medium' | 'small' | 'milli';
    hazard_categories?: string[];
    hazard_count?: number;
    pictogram_count?: number;
    rotation_applied?: boolean;
    validity_area: ValidityArea;
    language: Language;
    list_name?: string;
    generation_time_ms?: number;
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('label_generated', {
        material_number: params.material_number,
        ...(params.product_name
          ? {
              product_name: params.product_name.substring(0, 100),
            }
          : {}),
        label_count: params.label_count,
        ...(params.label_type ? { label_type: params.label_type } : {}),
        ...(params.template_size
          ? { template_size: params.template_size }
          : {}),
        ...(params.hazard_categories && params.hazard_categories.length > 0
          ? { hazard_categories: params.hazard_categories.join(',') }
          : {}),
        ...(params.hazard_count !== undefined
          ? { hazard_count: params.hazard_count }
          : {}),
        ...(params.pictogram_count !== undefined
          ? { pictogram_count: params.pictogram_count }
          : {}),
        ...(params.rotation_applied !== undefined
          ? { rotation_applied: params.rotation_applied }
          : {}),
        validity_area: params.validity_area,
        language: params.language,
        ...(params.list_name
          ? { list_name: params.list_name.substring(0, 100) }
          : {}),
        ...(params.generation_time_ms
          ? { generation_time_ms: params.generation_time_ms }
          : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** Safety label(s) shared with others. */
  logLabelShared: (params: {
    label_count: number;
    share_method: 'email' | 'sms' | 'whatsapp' | 'pdf_download' | 'print';
    validity_area: ValidityArea;
    success: boolean;
  }): void => {
    safe(() =>
      firebaseAnalytics().logEvent('label_shared', {
        label_count: params.label_count,
        share_method: params.share_method,
        validity_area: params.validity_area,
        success: params.success,
        ...getCommonParams(),
      }),
    );
  },

  // ── Settings & Preferences ─────────────────────────────────────────────

  /** User changed the app language. */
  logLanguageChanged: (
    language: Language,
    previousLanguage?: Language,
  ): void => {
    safe(() =>
      firebaseAnalytics().logEvent('language_changed', {
        language,
        ...(previousLanguage ? { previous_language: previousLanguage } : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** User toggled the app theme. */
  logThemeChanged: (
    theme: 'light' | 'dark',
    autoFollowSystem?: boolean,
  ): void => {
    safe(() =>
      firebaseAnalytics().logEvent('theme_changed', {
        theme,
        ...(autoFollowSystem !== undefined
          ? { auto_follow_system: autoFollowSystem }
          : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** User changed the validity area (region). */
  logValidityAreaChanged: (
    validityArea: ValidityArea,
    previousValidityArea?: ValidityArea,
  ): void => {
    safe(() =>
      firebaseAnalytics().logEvent('validity_area_changed', {
        validity_area: validityArea,
        ...(previousValidityArea
          ? { previous_validity_area: previousValidityArea }
          : {}),
        ...getCommonParams(),
      }),
    );
  },

  // ── Feedback & Rating ──────────────────────────────────────────────────

  /** User submitted feedback or rating. */
  logFeedbackSubmit: (
    starRating: number,
    category?: string,
    messageLength?: number,
  ): void => {
    safe(() =>
      firebaseAnalytics().logEvent('feedback_submitted', {
        star_rating: starRating,
        ...(category ? { category } : {}),
        ...(messageLength !== undefined
          ? { message_length: messageLength }
          : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** Quick-rate popup was shown to the user. */
  logRatePromptShown: (
    context: RatePromptContext,
    triggerReason?: 'completed_action' | 'time_based',
  ): void => {
    safe(() =>
      firebaseAnalytics().logEvent('rate_prompt_shown', {
        prompt_context: context,
        ...(triggerReason ? { trigger_reason: triggerReason } : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** User submitted a rating via the quick popup. */
  logRatePromptResponded: (starRating?: number, conversion?: boolean): void => {
    safe(() =>
      firebaseAnalytics().logEvent('rate_prompt_responded', {
        ...(starRating !== undefined ? { star_rating: starRating } : {}),
        ...(conversion !== undefined ? { conversion } : {}),
        ...getCommonParams(),
      }),
    );
  },

  /** User dismissed the quick popup without rating. */
  logRatePromptDismissed: (reason?: 'swipe_away' | 'tap_outside' | 'close_button'): void => {
    safe(() =>
      firebaseAnalytics().logEvent('rate_prompt_dismissed', {
        ...(reason ? { reason } : {}),
        ...getCommonParams(),
      }),
    );
  },

  // ── Events (existing, enhanced) ────────────────────────────────────────

  /** User opened an event detail page. */
  logEventViewed: (slug: string, title?: string): void => {
    safe(() =>
      firebaseAnalytics().logEvent('event_viewed', {
        content_type: 'event',
        item_id: slug,
        ...(title ? { title } : {}),
        ...getCommonParams(),
      }),
    );
  },

  // ── User properties ────────────────────────────────────────────────────

  /** Persist a user property (e.g. last_login_date, preferred_language). */
  setUserProperty: (name: string, value: string | number): void => {
    safe(() => firebaseAnalytics().setUserProperty(name, String(value)));
  },

  // ── Generic escape hatch ───────────────────────────────────────────────

  /** Log any custom event. Prefer the typed helpers above for consistency. */
  logEvent: (
    name: string,
    params?: Record<string, string | number | boolean>,
  ): void => {
    safe(() => firebaseAnalytics().logEvent(name, params));
  },
};
