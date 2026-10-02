/**
 * Feature Flags Screen
 *
 * Screen to showcase and test feature flags functionality
 */

import React from 'react';
import { ScrollView, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { createCommonStyles } from '@theme/commonStyles';
import { getFontStyle } from '@utils/fonts';
import {
  BasicFeatureFlagExample,
  ComponentFeatureFlagExample,
  MultipleFeatureFlagExample,
  ConditionalFeatureExample,
  DevelopmentToggleExample,
  MultipleFlagsHookExample,
  HOCExample,
} from '@components/examples/FeatureFlagExamples';

const FeatureFlagsScreen: React.FC = () => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.secondary,
    },
    header: {
      backgroundColor: theme.background.card,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: 8,
      fontFamily: getFontStyle('h2').fontFamily,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
      fontFamily: getFontStyle('body').fontFamily,
    },
    contentContainer: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 12,
      marginTop: 24,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    sectionDescription: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 16,
      lineHeight: 20,
      fontFamily: getFontStyle('body').fontFamily,
    },
    exampleContainer: {
      marginBottom: 16,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border.secondary,
      marginVertical: 20,
    },
    infoCard: {
      backgroundColor: theme.background.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.button.primary.background,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    infoText: {
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 20,
      fontFamily: getFontStyle('body').fontFamily,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚩 Feature Flags</Text>
        <Text style={styles.headerSubtitle}>
          Interactive examples of feature flag implementations
        </Text>
      </View>

      <ScrollView
        style={commonStyles.flex1}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Feature Flags</Text>
          <Text style={styles.infoText}>
            Feature flags allow you to control feature rollouts, perform A/B
            testing, and safely deploy code while keeping features disabled
            until ready for production.
          </Text>
        </View>

        {/* Basic Example */}
        <Text style={styles.sectionTitle}>Basic Usage</Text>
        <Text style={styles.sectionDescription}>
          Simple boolean check using the useFeatureFlag hook
        </Text>
        <View style={styles.exampleContainer}>
          <BasicFeatureFlagExample />
        </View>

        <View style={styles.divider} />

        {/* Component Example */}
        <Text style={styles.sectionTitle}>Component-Based</Text>
        <Text style={styles.sectionDescription}>
          Using FeatureFlag component for conditional rendering
        </Text>
        <View style={styles.exampleContainer}>
          <ComponentFeatureFlagExample />
        </View>

        <View style={styles.divider} />

        {/* Multiple Flags Example */}
        <Text style={styles.sectionTitle}>Multiple Flags</Text>
        <Text style={styles.sectionDescription}>
          Working with multiple feature flags using gate logic (AND/OR)
        </Text>
        <View style={styles.exampleContainer}>
          <MultipleFeatureFlagExample />
        </View>

        <View style={styles.divider} />

        {/* Conditional Feature Example */}
        <Text style={styles.sectionTitle}>Conditional Features</Text>
        <Text style={styles.sectionDescription}>
          Explicit enabled/disabled content rendering
        </Text>
        <View style={styles.exampleContainer}>
          <ConditionalFeatureExample />
        </View>

        <View style={styles.divider} />

        {/* Development Toggle (only in dev) */}
        {__DEV__ && (
          <>
            <Text style={styles.sectionTitle}>Development Tools</Text>
            <Text style={styles.sectionDescription}>
              Toggle feature flags during development (Dev mode only)
            </Text>
            <View style={styles.exampleContainer}>
              <DevelopmentToggleExample />
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Multiple Flags Hook Example */}
        <Text style={styles.sectionTitle}>Flags Overview</Text>
        <Text style={styles.sectionDescription}>
          View multiple feature flags at once using hooks
        </Text>
        <View style={styles.exampleContainer}>
          <MultipleFlagsHookExample />
        </View>

        <View style={styles.divider} />

        {/* HOC Example */}
        <Text style={styles.sectionTitle}>Higher-Order Component</Text>
        <Text style={styles.sectionDescription}>
          Component wrapping with feature flag logic
        </Text>
        <View style={styles.exampleContainer}>
          <HOCExample />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeatureFlagsScreen;
