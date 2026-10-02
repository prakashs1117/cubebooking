/**
 * Feature Flag Hooks
 *
 * React hooks for using feature flags in components with Zustand store
 */

import { useCallback, useMemo } from 'react';
import {
  useFeatureFlagsStore,
  FeatureFlagKey,
  FeatureFlag,
  FeatureFlagCategory,
} from '@stores/featureFlagsStore';

/**
 * Hook to check if a feature flag is enabled
 *
 * @param flagKey - The feature flag key to check
 * @param fallbackValue - Optional fallback value if flag is not found
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isNewUIEnabled = useFeatureFlag('ENABLE_NEW_TODO_UI');
 *
 *   return (
 *     <View>
 *       {isNewUIEnabled ? <NewTodoUI /> : <OldTodoUI />}
 *     </View>
 *   );
 * };
 * ```
 */
export const useFeatureFlag = (
  flagKey: FeatureFlagKey,
  fallbackValue: boolean = false,
): boolean => {
  return useFeatureFlagsStore(state => {
    try {
      return state.isFeatureEnabled(flagKey);
    } catch (error) {
      if (__DEV__) {
        console.warn(`Error getting feature flag ${flagKey}:`, error);
      }
      return fallbackValue;
    }
  });
};

/**
 * Hook to get multiple feature flags at once
 *
 * IMPORTANT: Pass a stable array reference to prevent unnecessary recalculations.
 * Define the array outside the component or use useMemo.
 *
 * @param flagKeys - Array of feature flag keys to check
 * @returns Object with flag keys as keys and boolean values
 *
 * @example
 * ```tsx
 * // ✅ Good - stable array reference
 * const FLAG_KEYS = ['ENABLE_NEW_TODO_UI', 'ENABLE_DARK_MODE'];
 *
 * const MyComponent = () => {
 *   const flags = useFeatureFlags(FLAG_KEYS);
 *
 *   return (
 *     <View>
 *       {flags.ENABLE_NEW_TODO_UI && <NewTodoUI />}
 *       {flags.ENABLE_DARK_MODE && <DarkModeToggle />}
 *     </View>
 *   );
 * };
 *
 * // ❌ Bad - creates new array on every render
 * const MyComponent = () => {
 *   const flags = useFeatureFlags(['ENABLE_NEW_TODO_UI', 'ENABLE_DARK_MODE']);
 *   // ...
 * };
 * ```
 */
export const useFeatureFlags = (
  flagKeys: ReadonlyArray<FeatureFlagKey>,
): Record<FeatureFlagKey, boolean> => {
  // Get the isFeatureEnabled function from store
  const isFeatureEnabled = useFeatureFlagsStore(
    state => state.isFeatureEnabled,
  );

  // Memoize the result - this is safe because flagKeys should be a stable reference
  // If flagKeys is recreated on every render, components should fix that by
  // defining the array outside the component or using useMemo
  return useMemo(() => {
    const flags: Record<string, boolean> = {};
    flagKeys.forEach(key => {
      flags[key] = isFeatureEnabled(key);
    });
    return flags;
  }, [flagKeys, isFeatureEnabled]);
};

/**
 * Hook to get all active feature flags
 *
 * @returns Object with all feature flags and their values
 *
 * @example
 * ```tsx
 * const DebugPanel = () => {
 *   const allFlags = useAllFeatureFlags();
 *
 *   return (
 *     <View>
 *       {Object.entries(allFlags).map(([key, value]) => (
 *         <Text key={key}>{key}: {value ? '✅' : '❌'}</Text>
 *       ))}
 *     </View>
 *   );
 * };
 * ```
 */
export const useAllFeatureFlags = (): Record<string, boolean> => {
  return useFeatureFlagsStore(state => {
    const allFlags = state.getAllFeatureFlags();
    const flagValues: Record<string, boolean> = {};

    allFlags.forEach(flag => {
      flagValues[flag.key] = state.isFeatureEnabled(flag.key);
    });

    return flagValues;
  });
};

/**
 * Hook to get feature flag metadata
 *
 * @param flagKey - The feature flag key to get metadata for
 * @returns Feature flag metadata including description, environments, etc.
 *
 * @example
 * ```tsx
 * const FeatureFlagInfo = ({ flagKey }: { flagKey: FeatureFlagKey }) => {
 *   const metadata = useFeatureFlagMetadata(flagKey);
 *   const isEnabled = useFeatureFlag(flagKey);
 *
 *   return (
 *     <View>
 *       <Text>{flagKey}: {isEnabled ? 'ON' : 'OFF'}</Text>
 *       <Text>{metadata?.description}</Text>
 *     </View>
 *   );
 * };
 * ```
 */
export const useFeatureFlagMetadata = (
  flagKey: FeatureFlagKey,
): FeatureFlag | null => {
  return useFeatureFlagsStore(state => state.getFeatureFlag(flagKey));
};

/**
 * Hook to get feature flags by category
 *
 * @param category - The category to get flags from
 * @returns Array of feature flags in that category
 *
 * @example
 * ```tsx
 * const UIFeatures = () => {
 *   const uiFlags = useFeatureFlagsByCategory('ui');
 *
 *   return (
 *     <View>
 *       {uiFlags.map((flag) => (
 *         <Text key={flag.key}>{flag.key}: {flag.description}</Text>
 *       ))}
 *     </View>
 *   );
 * };
 * ```
 */
export const useFeatureFlagsByCategory = (
  category: FeatureFlagCategory,
): FeatureFlag[] => {
  return useFeatureFlagsStore(state =>
    state.getFeatureFlagsByCategory(category),
  );
};

/**
 * Development hook to toggle feature flags (only in dev mode)
 *
 * @param flagKey - The feature flag key to toggle
 * @returns Object with current value, toggle function, and actions
 *
 * @example
 * ```tsx
 * const DevPanel = () => {
 *   const { isEnabled, toggle, setOverride, clearOverride } = useFeatureFlagToggle('ENABLE_NEW_TODO_UI');
 *
 *   return (
 *     <View>
 *       <TouchableOpacity onPress={toggle}>
 *         <Text>New UI: {isEnabled ? 'ON' : 'OFF'}</Text>
 *       </TouchableOpacity>
 *       <TouchableOpacity onPress={() => setOverride(true)}>
 *         <Text>Force Enable</Text>
 *       </TouchableOpacity>
 *       <TouchableOpacity onPress={clearOverride}>
 *         <Text>Clear Override</Text>
 *       </TouchableOpacity>
 *     </View>
 *   );
 * };
 * ```
 */
export const useFeatureFlagToggle = (flagKey: FeatureFlagKey) => {
  const isEnabled = useFeatureFlag(flagKey);
  const toggleFeatureFlag = useFeatureFlagsStore(
    state => state.toggleFeatureFlag,
  );
  const setFeatureFlagOverride = useFeatureFlagsStore(
    state => state.setFeatureFlagOverride,
  );
  const clearOverride = useFeatureFlagsStore(state => state.clearOverride);

  const toggle = useCallback(() => {
    if (__DEV__) {
      toggleFeatureFlag(flagKey);
    } else {
      console.warn(
        'Feature flag toggling is only available in development mode',
      );
    }
  }, [flagKey, toggleFeatureFlag]);

  const setOverride = useCallback(
    (enabled: boolean) => {
      if (__DEV__) {
        setFeatureFlagOverride(flagKey, enabled);
      }
    },
    [flagKey, setFeatureFlagOverride],
  );

  const clear = useCallback(() => {
    if (__DEV__) {
      clearOverride(flagKey);
    }
  }, [flagKey, clearOverride]);

  return {
    isEnabled,
    toggle: __DEV__ ? toggle : () => {},
    setOverride: __DEV__ ? setOverride : () => {},
    clearOverride: __DEV__ ? clear : () => {},
  };
};

/**
 * Hook to get all feature flag store actions
 *
 * @returns Object with store actions
 *
 * @example
 * ```tsx
 * const AdminPanel = () => {
 *   const { resetToDefaults, clearAllOverrides, updateFromRemote } = useFeatureFlagActions();
 *
 *   return (
 *     <View>
 *       <Button title="Reset to Defaults" onPress={resetToDefaults} />
 *       <Button title="Clear Overrides" onPress={clearAllOverrides} />
 *     </View>
 *   );
 * };
 * ```
 */
export const useFeatureFlagActions = () => {
  const resetToDefaults = useFeatureFlagsStore(state => state.resetToDefaults);
  const clearAllOverrides = useFeatureFlagsStore(
    state => state.clearAllOverrides,
  );
  const updateFromRemote = useFeatureFlagsStore(
    state => state.updateFromRemote,
  );

  return {
    resetToDefaults,
    clearAllOverrides,
    updateFromRemote,
  };
};

/**
 * Hook to check if any feature flag has an override
 *
 * @returns boolean indicating if there are any overrides
 */
export const useHasFeatureFlagOverrides = (): boolean => {
  return useFeatureFlagsStore(state => Object.keys(state.overrides).length > 0);
};
