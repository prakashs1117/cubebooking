/**
 * useFeatureFlagsSync Hook
 * Fetches feature flags from API with auto-polling and syncs with local store
 * Similar pattern to useNotifications for consistency
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchFeatureFlags } from '@services/api/featureFlags.service';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import FEATURE_FLAGS_SYNC_CONFIG from '@config/featureFlagsSync.config';

interface UseFeatureFlagsSyncOptions {
  /**
   * Enable/disable automatic polling
   * @default true
   */
  enabled?: boolean;

  /**
   * Polling interval in milliseconds
   * @default 60000 (1 minute)
   */
  pollingInterval?: number;

  /**
   * Auto-sync with local store
   * @default true
   */
  autoSync?: boolean;

  /**
   * Only poll when app is in foreground
   * @default true
   */
  foregroundOnly?: boolean;
}

/**
 * Hook to fetch and manage feature flags from API
 * Automatically polls for updated flags and syncs with local store
 *
 * @example
 * ```tsx
 * // In App.tsx or root component
 * function App() {
 *   useFeatureFlagsSync({
 *     enabled: true,
 *     pollingInterval: 60000, // Poll every 1 minute
 *   });
 *
 *   return <YourApp />;
 * }
 * ```
 */
export const useFeatureFlagsSync = (
  options: UseFeatureFlagsSyncOptions = {},
) => {
  const {
    enabled = true,
    pollingInterval = FEATURE_FLAGS_SYNC_CONFIG.POLLING_INTERVAL,
    autoSync = true,
    foregroundOnly = FEATURE_FLAGS_SYNC_CONFIG.FOREGROUND_ONLY,
  } = options;

  const updateFromRemote = useFeatureFlagsStore(
    state => state.updateFromRemote,
  );
  const localFlags = useFeatureFlagsStore(state => state.flags);
  const lastUpdated = useFeatureFlagsStore(state => state.lastUpdated);

  // Fetch feature flags with React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: fetchFeatureFlags,
    enabled,
    refetchInterval: enabled ? pollingInterval : false, // Auto-refetch every interval
    refetchIntervalInBackground: !foregroundOnly, // Control background polling
    staleTime: FEATURE_FLAGS_SYNC_CONFIG.STALE_TIME, // Consider data stale slightly before refetch
    gcTime: FEATURE_FLAGS_SYNC_CONFIG.CACHE_TIME, // Cache for 24 hours
    networkMode: 'online', // Only fetch when online
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('Forbidden')
      ) {
        return false;
      }
      // Retry other errors
      return failureCount < FEATURE_FLAGS_SYNC_CONFIG.RETRY_ATTEMPTS;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Auto-sync with local store when data changes
  useEffect(() => {
    if (autoSync && data) {
      // Debug logging for API response
      if (__DEV__ && FEATURE_FLAGS_SYNC_CONFIG.ENABLE_DEV_LOGS) {
        console.log('📦 Feature flags API response:', {
          hasFlags: !!data.flags,
          flagsCount: data.flags?.length || 0,
          hasVersion: !!data.version,
          hasLastUpdated: !!data.lastUpdated,
          rawData: data,
        });
      }

      // Check if we have valid flags data
      if (data.flags && Array.isArray(data.flags) && data.flags.length > 0) {
        updateFromRemote(data.flags);

        if (__DEV__ && FEATURE_FLAGS_SYNC_CONFIG.ENABLE_DEV_LOGS) {
          console.log('✅ Feature flags synced from API:', {
            count: data.flags.length,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        if (__DEV__) {
          console.warn(
            '⚠️ API response missing or empty flags array. Using local data.',
            {
              response: data,
            },
          );
        }
      }
    }
  }, [data, autoSync, updateFromRemote]);

  // Log errors
  useEffect(() => {
    if (isError && error) {
      if (__DEV__) {
        console.error('❌ Feature flags sync error:', {
          message: error.message,
          error: error,
        });
        console.log(
          '💡 Tip: Set AUTO_SYNC_ENABLED to false in featureFlagsSync.config.ts to use local data only',
        );
      }
    }
  }, [isError, error]);

  return {
    // API data
    remoteFlags: data?.flags || [],
    remoteVersion: data?.version,
    remoteLastUpdated: data?.lastUpdated,

    // Local store data (for offline support)
    localFlags,
    localLastUpdated: lastUpdated,

    // Query states
    isLoading,
    isError,
    error,
    isRefetching,
    dataUpdatedAt,

    // Actions
    refetch, // Manual refetch
    updateFromRemote, // Manual store update
  };
};

/**
 * Hook to get only local feature flags (offline support)
 * Does not fetch from API
 */
export const useLocalFeatureFlags = () => {
  const flags = useFeatureFlagsStore(state => state.flags);
  const isFeatureEnabled = useFeatureFlagsStore(
    state => state.isFeatureEnabled,
  );
  const getFeatureFlag = useFeatureFlagsStore(state => state.getFeatureFlag);
  const toggleFeatureFlag = useFeatureFlagsStore(
    state => state.toggleFeatureFlag,
  );
  const clearAllOverrides = useFeatureFlagsStore(
    state => state.clearAllOverrides,
  );
  const lastUpdated = useFeatureFlagsStore(state => state.lastUpdated);

  return {
    flags,
    isFeatureEnabled,
    getFeatureFlag,
    toggleFeatureFlag,
    clearAllOverrides,
    lastUpdated,
  };
};

export default useFeatureFlagsSync;
