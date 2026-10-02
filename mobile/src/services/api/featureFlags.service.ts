/**
 * Feature Flags API Service
 *
 * Service for fetching feature flags from the backend API
 * Prepares the application for remote feature flag management
 */

import apiClient from './client';
import type { FeatureFlag } from '@stores/featureFlagsStore';

/**
 * API Response structure for feature flags
 */
export interface FeatureFlagsAPIResponse {
  flags: FeatureFlag[];
  version?: string;
  lastUpdated?: string;
}

/**
 * Fetch all feature flags from the backend
 *
 * @returns Promise with feature flags data
 *
 * @example
 * ```typescript
 * const { flags } = await fetchFeatureFlags();
 * store.updateFromRemote(flags);
 * ```
 */
export const fetchFeatureFlags = async (): Promise<FeatureFlagsAPIResponse> => {
  try {
    const response = await apiClient.get<FeatureFlagsAPIResponse>(
      '/feature-flags',
    );

    if (__DEV__) {
      console.log('🌐 Feature flags API response received:', {
        status: response.status,
        hasData: !!response.data,
        hasFlags: !!response.data?.flags,
        flagsCount: response.data?.flags?.length || 0,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });
    }

    // Validate response structure
    if (!response.data) {
      throw new Error('API response is empty');
    }

    if (!response.data.flags) {
      if (__DEV__) {
        console.error(
          '❌ API response missing "flags" property:',
          response.data,
        );
      }
      throw new Error('API response missing "flags" property');
    }

    if (!Array.isArray(response.data.flags)) {
      throw new Error('API response "flags" is not an array');
    }

    if (__DEV__) {
      console.log(
        '✅ Feature flags fetched from API:',
        response.data.flags.length,
      );
    }

    return response.data;
  } catch (error: any) {
    if (__DEV__) {
      console.error('❌ Error fetching feature flags:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
};

/**
 * Fetch a specific feature flag by key
 *
 * @param key - The feature flag key
 * @returns Promise with feature flag data
 *
 * @example
 * ```typescript
 * const flag = await fetchFeatureFlagByKey('dark_mode');
 * ```
 */
export const fetchFeatureFlagByKey = async (
  key: string,
): Promise<FeatureFlag> => {
  try {
    const response = await apiClient.get<FeatureFlag>(`/feature-flags/${key}`);

    if (__DEV__) {
      console.log(`✅ Feature flag fetched: ${key}`);
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching feature flag ${key}:`, error);
    throw error;
  }
};

/**
 * Update a feature flag on the backend (admin only)
 *
 * @param key - The feature flag key
 * @param updates - Partial updates to apply
 * @returns Promise with updated feature flag
 *
 * @example
 * ```typescript
 * const updated = await updateFeatureFlag('dark_mode', { enabled: true });
 * ```
 */
export const updateFeatureFlag = async (
  key: string,
  updates: Partial<FeatureFlag>,
): Promise<FeatureFlag> => {
  try {
    const response = await apiClient.patch<FeatureFlag>(
      `/feature-flags/${key}`,
      updates,
    );

    if (__DEV__) {
      console.log(`✅ Feature flag updated: ${key}`);
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Error updating feature flag ${key}:`, error);
    throw error;
  }
};

/**
 * Sync feature flags from backend to local store
 * This function should be called on app startup or when user logs in
 *
 * @param updateStore - Callback to update the local store
 * @returns Promise with sync result
 *
 * @example
 * ```typescript
 * import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
 *
 * const updateFromRemote = useFeatureFlagsStore.getState().updateFromRemote;
 * await syncFeatureFlags(updateFromRemote);
 * ```
 */
export const syncFeatureFlags = async (
  updateStore: (flags: FeatureFlag[]) => void,
): Promise<void> => {
  try {
    const { flags } = await fetchFeatureFlags();
    updateStore(flags);

    if (__DEV__) {
      console.log('✅ Feature flags synced successfully');
    }
  } catch (error) {
    console.error('❌ Error syncing feature flags:', error);
    // Don't throw - allow app to continue with cached flags
  }
};
