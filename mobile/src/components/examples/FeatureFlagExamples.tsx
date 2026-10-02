/**
 * Feature Flag Usage Examples
 *
 * This file demonstrates various ways to use feature flags in your components.
 * These examples can be used as reference when implementing new features.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  useFeatureFlag,
  useFeatureFlags,
  useFeatureFlagToggle,
} from '@hooks/useFeatureFlag';
import {
  FeatureFlag,
  FeatureFlagGate,
  ConditionalFeature,
  FeatureFlagDebugInfo,
  withFeatureFlag,
} from '@components/common/FeatureFlag';
import { useTheme } from '@theme/index';

/**
 * Example 1: Basic feature flag usage with hook
 */
export const BasicFeatureFlagExample: React.FC = () => {
  const { theme } = useTheme();
  const isNewUIEnabled = useFeatureFlag('ENABLE_NEW_TODO_UI');

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background.card,
      margin: 8,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: theme.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic Feature Flag Example</Text>
      {isNewUIEnabled ? (
        <Text
          style={[
            styles.description,
            { color: theme.button.success.background },
          ]}
        >
          ✅ New UI is enabled! Showing enhanced interface.
        </Text>
      ) : (
        <Text style={[styles.description, { color: theme.text.secondary }]}>
          📱 Using standard UI interface.
        </Text>
      )}
    </View>
  );
};

/**
 * Example 2: Using FeatureFlag component for conditional rendering
 */
export const ComponentFeatureFlagExample: React.FC = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background.card,
      margin: 8,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    newFeature: {
      padding: 12,
      backgroundColor: theme.button.success.background,
      borderRadius: 6,
    },
    oldFeature: {
      padding: 12,
      backgroundColor: theme.background.secondary,
      borderRadius: 6,
    },
    featureText: {
      color: theme.text.primary,
      textAlign: 'center',
    },
    whiteText: {
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Component Feature Flag Example</Text>

      <FeatureFlag
        flag="ENABLE_PREMIUM_FEATURES"
        fallback={
          <View style={styles.oldFeature}>
            <Text style={styles.featureText}>Standard Features Available</Text>
          </View>
        }
      >
        <View style={styles.newFeature}>
          <Text style={styles.whiteText}>🌟 Premium Features Unlocked!</Text>
        </View>
      </FeatureFlag>
    </View>
  );
};

/**
 * Example 3: Multiple feature flags with gate logic
 */
export const MultipleFeatureFlagExample: React.FC = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background.card,
      margin: 8,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    premiumFeature: {
      padding: 12,
      backgroundColor: theme.button.primary.background,
      borderRadius: 6,
      marginBottom: 8,
    },
    upgrade: {
      padding: 12,
      backgroundColor: theme.button.outline.background,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.button.outline.border,
    },
    featureText: {
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: '600',
    },
    upgradeText: {
      color: theme.text.primary,
      textAlign: 'center',
    },
    secondaryText: {
      color: theme.text.secondary,
    },
    successText: {
      color: theme.button.success.background,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multiple Feature Flags Example</Text>

      <FeatureFlagGate
        flags={['ENABLE_PREMIUM_FEATURES', 'ENABLE_EXPORT_FEATURES']}
        operator="AND"
        fallback={
          <View style={styles.upgrade}>
            <Text style={styles.upgradeText}>
              📤 Export features require premium subscription
            </Text>
          </View>
        }
      >
        <View style={styles.premiumFeature}>
          <Text style={styles.featureText}>
            📊 Advanced Export Features Available
          </Text>
        </View>
      </FeatureFlagGate>

      <FeatureFlagGate
        flags={['ENABLE_ANALYTICS', 'ENABLE_PERFORMANCE_MONITORING']}
        operator="OR"
        fallback={
          <Text style={styles.secondaryText}>No monitoring active</Text>
        }
      >
        <Text style={styles.successText}>📈 Monitoring systems active</Text>
      </FeatureFlagGate>
    </View>
  );
};

/**
 * Example 4: ConditionalFeature component
 */
export const ConditionalFeatureExample: React.FC = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background.card,
      margin: 8,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    enabledText: {
      color: theme.button.success.background,
    },
    disabledText: {
      color: theme.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conditional Feature Example</Text>

      <ConditionalFeature
        flag="ENABLE_PUSH_NOTIFICATIONS"
        whenEnabled={
          <Text style={styles.enabledText}>
            🔔 Push notifications are enabled
          </Text>
        }
        whenDisabled={
          <Text style={styles.disabledText}>
            🔕 Push notifications coming soon...
          </Text>
        }
      />
    </View>
  );
};

/**
 * Example 5: Development toggle (only works in dev mode)
 */
export const DevelopmentToggleExample: React.FC = () => {
  const { theme } = useTheme();
  const { isEnabled, toggle } = useFeatureFlagToggle('ENABLE_NEW_TODO_UI');

  if (!__DEV__) {
    return null; // Don't show in production
  }

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background.card,
      margin: 8,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.button.error.background,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    debugLabel: {
      color: theme.button.error.background,
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    toggleButton: {
      backgroundColor: theme.button.primary.background,
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    toggleText: {
      color: theme.button.primary.text,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.debugLabel}>DEV ONLY</Text>
      <Text style={styles.title}>Development Toggle Example</Text>

      <TouchableOpacity style={styles.toggleButton} onPress={toggle}>
        <Text style={styles.toggleText}>
          Toggle New UI: {isEnabled ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Example 6: Multiple flags hook usage
 */
export const MultipleFlagsHookExample: React.FC = () => {
  const { theme } = useTheme();
  const flags = useFeatureFlags([
    'ENABLE_DARK_MODE',
    'ENABLE_ANALYTICS',
    'ENABLE_PREMIUM_FEATURES',
  ]);

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background.card,
      margin: 8,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    flagItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    flagName: {
      color: theme.text.secondary,
      fontSize: 14,
    },
    flagStatus: {
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multiple Flags Hook Example</Text>

      {Object.entries(flags).map(([flagKey, isEnabled]) => (
        <View key={flagKey} style={styles.flagItem}>
          <Text style={styles.flagName}>{flagKey}</Text>
          <Text
            style={[
              styles.flagStatus,
              {
                color: isEnabled
                  ? theme.button.success.background
                  : theme.text.secondary,
              },
            ]}
          >
            {isEnabled ? '✅ ON' : '❌ OFF'}
          </Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Example 7: Higher-order component usage
 */
const PremiumComponent: React.FC = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.button.success.background,
      borderRadius: 8,
    },
    text: {
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌟 This is a premium component!</Text>
    </View>
  );
};

const StandardComponent: React.FC = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background.secondary,
      borderRadius: 8,
    },
    text: {
      color: theme.text.primary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📱 This is the standard component</Text>
    </View>
  );
};

export const HOCExample = withFeatureFlag(
  'ENABLE_PREMIUM_FEATURES',
  StandardComponent,
)(PremiumComponent);

/**
 * Master component that shows all examples
 */
export const FeatureFlagExamples: React.FC = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    header: {
      padding: 20,
      backgroundColor: theme.background.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text.primary,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 4,
    },
    exampleContainer: {
      margin: 8,
    },
    exampleTitle: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚩 Feature Flags Examples</Text>
        <Text style={styles.headerSubtitle}>
          Demonstrating different ways to use feature flags
        </Text>
        <FeatureFlagDebugInfo flag="ENABLE_NEW_TODO_UI" />
      </View>

      <BasicFeatureFlagExample />
      <ComponentFeatureFlagExample />
      <MultipleFeatureFlagExample />
      <ConditionalFeatureExample />
      <DevelopmentToggleExample />
      <MultipleFlagsHookExample />

      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>HOC Example:</Text>
        <HOCExample />
      </View>
    </View>
  );
};
