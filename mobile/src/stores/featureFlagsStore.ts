/**
 * Feature Flags Store (Zustand + AsyncStorage)
 *
 * Centralized state management for feature flags with persistence
 * New flat structure for better backend/admin screen compatibility
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import featureFlagsData from '@/data/featureFlagNew.json';
import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';
import { isSyncEnabled } from '@config/featureFlagsSync.config';

// New Types - API-compatible structure
export interface FeatureFlagTargeting {
  rolloutPercentage: number;
  environments: string[];
  userSegments?: string[];
}

export interface FeatureFlagMetadata {
  tags: string[];
  owner: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category:
    | 'ui'
    | 'feature'
    | 'social'
    | 'analytics'
    | 'experimental'
    | 'debug';
  type: 'boolean' | 'string' | 'number' | 'json';
  enabled: boolean;
  defaultValue: any;
  targeting: FeatureFlagTargeting;
  config?: Record<string, any> | null;
  metadata: FeatureFlagMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureFlagsData {
  flags: FeatureFlag[];
}

export type FeatureFlagCategory =
  | 'ui'
  | 'feature'
  | 'social'
  | 'analytics'
  | 'experimental'
  | 'debug';
export type FeatureFlagKey = string;

interface FeatureFlagsState {
  // State
  flags: FeatureFlag[];
  overrides: Record<string, boolean>;
  lastUpdated: number;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  syncFromBackend: () => Promise<void>;
  isFeatureEnabled: (flagKey: FeatureFlagKey) => boolean;
  getFeatureFlag: (flagKey: FeatureFlagKey) => FeatureFlag | null;
  getFeatureFlagsByCategory: (category: FeatureFlagCategory) => FeatureFlag[];
  getAllFeatureFlags: () => FeatureFlag[];
  toggleFeatureFlag: (flagKey: FeatureFlagKey) => void;
  setFeatureFlagOverride: (flagKey: FeatureFlagKey, enabled: boolean) => void;
  clearOverride: (flagKey: FeatureFlagKey) => void;
  clearAllOverrides: () => void;
  resetToDefaults: () => void;
  updateFromRemote: (remoteFlags: FeatureFlag[]) => void;
}

// Get current environment
const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  if (__DEV__) return 'development';
  // Add logic to detect staging vs production
  return 'production';
};

// Helper to check if flag should be enabled based on environment and rollout
const shouldEnableFlag = (flag: FeatureFlag): boolean => {
  const currentEnv = getCurrentEnvironment();

  // Check environment
  if (!flag.targeting.environments.includes(currentEnv)) {
    return false;
  }

  // Check rollout percentage
  if (flag.targeting.rolloutPercentage < 100) {
    // Simple deterministic rollout based on device
    // In production, you might want to use user ID or device ID
    const random = Math.random() * 100;
    if (random > flag.targeting.rolloutPercentage) {
      return false;
    }
  }

  return flag.enabled;
};

/**
 * Feature Flags Store
 *
 * Manages feature flags with AsyncStorage persistence and override support
 * New flat structure for easier backend management
 */
export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      // Initial state - Load from new JSON structure
      flags: (featureFlagsData as FeatureFlagsData).flags,
      overrides: {},
      lastUpdated: Date.now(),
      isInitialized: false,

      /**
       * Initialize the store
       */
      initialize: () => {
        set({ isInitialized: true, lastUpdated: Date.now() });
      },

      /**
       * Fetch feature flags from the backend and update the store.
       * Falls back silently to local defaults on failure.
       */
      syncFromBackend: async () => {
        if (!isSyncEnabled()) return;
        try {
          const response = await apiClient.get<{ flags: FeatureFlag[] }>(
            ENDPOINTS.FEATURE_FLAGS.LIST,
          );
          if (response.data?.flags && Array.isArray(response.data.flags)) {
            set({ flags: response.data.flags, lastUpdated: Date.now() });
          }
        } catch {
          // Silently fall back to local defaults — app still works offline
        }
      },

      /**
       * Check if a feature flag is enabled
       */
      isFeatureEnabled: (flagKey: FeatureFlagKey): boolean => {
        const state = get();

        if (flagKey in state.overrides) {
          return state.overrides[flagKey];
        }

        const flag = state.flags.find(f => f.key === flagKey);
        if (!flag) return false;

        return shouldEnableFlag(flag);
      },

      /**
       * Get feature flag details
       */
      getFeatureFlag: (flagKey: FeatureFlagKey): FeatureFlag | null => {
        return get().flags.find(f => f.key === flagKey) ?? null;
      },

      /**
       * Get feature flags by category
       */
      getFeatureFlagsByCategory: (
        category: FeatureFlagCategory,
      ): FeatureFlag[] => {
        const { flags } = get();
        return flags.filter(f => f.category === category);
      },

      /**
       * Get all feature flags
       */
      getAllFeatureFlags: (): FeatureFlag[] => {
        return get().flags;
      },

      /**
       * Toggle a feature flag (dev only)
       */
      toggleFeatureFlag: (flagKey: FeatureFlagKey) => {
        if (!__DEV__) {
          console.warn(
            'Feature flag toggling is only available in development mode',
          );
          return;
        }

        const { overrides, isFeatureEnabled } = get();
        const currentValue = isFeatureEnabled(flagKey);

        set({
          overrides: {
            ...overrides,
            [flagKey]: !currentValue,
          },
        });

        console.log(`🚩 Toggled ${flagKey}: ${!currentValue}`);
      },

      /**
       * Set feature flag override
       */
      setFeatureFlagOverride: (flagKey: FeatureFlagKey, enabled: boolean) => {
        const { overrides } = get();

        set({
          overrides: {
            ...overrides,
            [flagKey]: enabled,
          },
        });

        if (__DEV__) {
          console.log(`🚩 Override ${flagKey}: ${enabled}`);
        }
      },

      /**
       * Clear single override
       */
      clearOverride: (flagKey: FeatureFlagKey) => {
        const { overrides } = get();
        const newOverrides = { ...overrides };
        delete newOverrides[flagKey];

        set({ overrides: newOverrides });

        if (__DEV__) {
          console.log(`🚩 Cleared override for ${flagKey}`);
        }
      },

      /**
       * Clear all overrides
       */
      clearAllOverrides: () => {
        set({ overrides: {} });

        if (__DEV__) {
          console.log('🚩 Cleared all feature flag overrides');
        }
      },

      /**
       * Reset to default configuration
       */
      resetToDefaults: () => {
        set({
          flags: (featureFlagsData as FeatureFlagsData).flags,
          overrides: {},
          lastUpdated: Date.now(),
        });

        if (__DEV__) {
          console.log('🚩 Reset feature flags to defaults');
        }
      },

      /**
       * Update flags from remote source (e.g., API)
       */
      updateFromRemote: (remoteFlags: FeatureFlag[]) => {
        set({
          flags: remoteFlags,
          lastUpdated: Date.now(),
        });

        if (__DEV__) {
          console.log('🚩 Updated feature flags from remote');
        }
      },
    }),
    {
      name: 'feature-flags-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist flags and overrides, not computed state
      partialize: state => ({
        flags: state.flags,
        overrides: state.overrides,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);

/**
 * Hook to get feature flag value directly (non-reactive)
 */
export const getFeatureFlagValue = (flagKey: FeatureFlagKey): boolean => {
  return useFeatureFlagsStore.getState().isFeatureEnabled(flagKey);
};

/**
 * Development helper to log all feature flags
 */
export const logAllFeatureFlags = () => {
  if (__DEV__) {
    const store = useFeatureFlagsStore.getState();
    const allFlags = store.getAllFeatureFlags();

    console.group('🚩 Feature Flags Status');
    allFlags.forEach(flag => {
      const isEnabled = store.isFeatureEnabled(flag.key);
      const hasOverride = flag.key in store.overrides;
      console.log(
        `${flag.key}: ${isEnabled ? '✅' : '❌'} ${
          hasOverride ? '(overridden)' : ''
        } - ${flag.description}`,
      );
    });
    console.groupEnd();
  }
};

// Initialize store on import
useFeatureFlagsStore.getState().initialize();
