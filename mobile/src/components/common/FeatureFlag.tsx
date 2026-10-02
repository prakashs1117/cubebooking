/**
 * FeatureFlag Components
 *
 * Components for conditionally rendering content based on feature flags
 */

import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useFeatureFlag, useFeatureFlags } from '@hooks/useFeatureFlag';
import { FeatureFlagKey } from '@stores/featureFlagsStore';

interface FeatureFlagProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * FeatureFlag component for conditional rendering
 *
 * @param flag - The feature flag key to check
 * @param children - Content to render when flag is enabled
 * @param fallback - Optional content to render when flag is disabled
 *
 * @example
 * ```tsx
 * <FeatureFlag flag="ENABLE_NEW_TODO_UI" fallback={<OldTodoUI />}>
 *   <NewTodoUI />
 * </FeatureFlag>
 * ```
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  children,
  fallback = null,
}) => {
  const isEnabled = useFeatureFlag(flag);

  return <>{isEnabled ? children : fallback}</>;
};

interface FeatureFlagGateProps {
  flags: FeatureFlagKey[];
  operator?: 'AND' | 'OR';
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * FeatureFlagGate component for multiple flag conditions
 *
 * @param flags - Array of feature flag keys to check
 * @param operator - Whether ALL flags ('AND') or ANY flag ('OR') should be enabled
 * @param children - Content to render when condition is met
 * @param fallback - Optional content to render when condition is not met
 *
 * @example
 * ```tsx
 * <FeatureFlagGate
 *   flags={['ENABLE_PREMIUM_FEATURES', 'ENABLE_EXPORT_FEATURES']}
 *   operator="AND"
 *   fallback={<UpgradePrompt />}
 * >
 *   <PremiumExportFeature />
 * </FeatureFlagGate>
 * ```
 */
export const FeatureFlagGate: React.FC<FeatureFlagGateProps> = ({
  flags,
  operator = 'AND',
  children,
  fallback = null,
}) => {
  const flagValues = useFeatureFlags(flags);

  const isEnabled =
    operator === 'AND'
      ? flags.every(flag => flagValues[flag])
      : flags.some(flag => flagValues[flag]);

  return <>{isEnabled ? children : fallback}</>;
};

interface ConditionalFeatureProps {
  flag: FeatureFlagKey;
  whenEnabled?: ReactNode;
  whenDisabled?: ReactNode;
}

/**
 * ConditionalFeature component with explicit enabled/disabled content
 *
 * @param flag - The feature flag key to check
 * @param whenEnabled - Content to render when flag is enabled
 * @param whenDisabled - Content to render when flag is disabled
 *
 * @example
 * ```tsx
 * <ConditionalFeature
 *   flag="ENABLE_DARK_MODE"
 *   whenEnabled={<DarkModeToggle />}
 *   whenDisabled={<Text>Dark mode coming soon!</Text>}
 * />
 * ```
 */
export const ConditionalFeature: React.FC<ConditionalFeatureProps> = ({
  flag,
  whenEnabled = null,
  whenDisabled = null,
}) => {
  const isEnabled = useFeatureFlag(flag);

  return <>{isEnabled ? whenEnabled : whenDisabled}</>;
};

/**
 * Development component to display feature flag status
 * Only renders in development mode
 *
 * @example
 * ```tsx
 * <FeatureFlagDebugInfo flag="ENABLE_NEW_TODO_UI" />
 * ```
 */
export const FeatureFlagDebugInfo: React.FC<{ flag: FeatureFlagKey }> = ({
  flag,
}) => {
  const isEnabled = useFeatureFlag(flag);

  if (!__DEV__) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: isEnabled ? 'green' : 'red',
        padding: 4,
        borderRadius: 4,
        opacity: 0.7,
        zIndex: 1000,
      }}
    >
      <Text style={{ color: 'white', fontSize: 10 }}>
        {flag}: {isEnabled ? 'ON' : 'OFF'}
      </Text>
    </View>
  );
};

/**
 * Higher-order component to wrap components with feature flag logic
 *
 * @param flag - The feature flag key to check
 * @param fallbackComponent - Optional component to render when flag is disabled
 *
 * @example
 * ```tsx
 * const EnhancedTodoList = withFeatureFlag('ENABLE_NEW_TODO_UI', OldTodoList)(NewTodoList);
 * ```
 */
export const withFeatureFlag = <P extends object>(
  flag: FeatureFlagKey,
  fallbackComponent?: React.ComponentType<P>,
) => {
  return (WrappedComponent: React.ComponentType<P>) => {
    const ComponentWithFeatureFlag: React.FC<P> = props => {
      const isEnabled = useFeatureFlag(flag);

      if (!isEnabled) {
        return fallbackComponent
          ? React.createElement(fallbackComponent, props)
          : null;
      }

      return React.createElement(WrappedComponent, props);
    };

    ComponentWithFeatureFlag.displayName = `withFeatureFlag(${
      WrappedComponent.displayName || WrappedComponent.name
    })`;

    return ComponentWithFeatureFlag;
  };
};

/**
 * Hook-based wrapper for feature flag logic
 *
 * @param flag - The feature flag key to check
 * @param enabledComponent - Component to render when flag is enabled
 * @param disabledComponent - Optional component to render when flag is disabled
 *
 * @example
 * ```tsx
 * const TodoUI = useFeatureFlagComponent(
 *   'ENABLE_NEW_TODO_UI',
 *   NewTodoUI,
 *   OldTodoUI
 * );
 *
 * return <TodoUI />;
 * ```
 */
export const useFeatureFlagComponent = <P extends object>(
  flag: FeatureFlagKey,
  enabledComponent: React.ComponentType<P>,
  disabledComponent?: React.ComponentType<P>,
) => {
  const isEnabled = useFeatureFlag(flag);

  return React.useMemo(() => {
    if (isEnabled) {
      return enabledComponent;
    }

    return disabledComponent || (() => null);
  }, [isEnabled, enabledComponent, disabledComponent]);
};
