/**
 * Feature Flags Management Screen
 *
 * Comprehensive management interface for viewing and toggling feature flags
 */

import React, { useState } from 'react';
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { useTheme } from '@theme/index';
import { AppModal, ModalConfig } from '@components/modals';
import {
  useFeatureFlagsStore,
  FeatureFlagCategory,
  FeatureFlag,
} from '@stores/featureFlagsStore';
import {
  useFeatureFlagActions,
  useHasFeatureFlagOverrides,
} from '@hooks/useFeatureFlag';

const CATEGORIES: FeatureFlagCategory[] = [
  'ui',
  'feature',
  'social',
  'analytics',
  'experimental',
  'debug',
];

const CATEGORY_LABELS: Record<FeatureFlagCategory, string> = {
  ui: '🎨 UI Features',
  feature: '⭐ Features',
  social: '🔗 Social',
  analytics: '📊 Analytics',
  experimental: '🧪 Experimental',
  debug: '🐛 Debug',
};

const FeatureFlagsManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const [expandedCategory, setExpandedCategory] =
    useState<FeatureFlagCategory | null>('ui');

  // Get store state and actions
  const flags = useFeatureFlagsStore(state => state.flags);
  const overrides = useFeatureFlagsStore(state => state.overrides);
  const isFeatureEnabled = useFeatureFlagsStore(
    state => state.isFeatureEnabled,
  );
  const setFeatureFlagOverride = useFeatureFlagsStore(
    state => state.setFeatureFlagOverride,
  );
  const clearOverride = useFeatureFlagsStore(state => state.clearOverride);

  const { resetToDefaults, clearAllOverrides } = useFeatureFlagActions();
  const hasOverrides = useHasFeatureFlagOverrides();
  const [modal, setModal] = useState<ModalConfig | null>(null);

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
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 12,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.button.primary.background,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    actionButtonDanger: {
      backgroundColor: theme.button.danger.background,
    },
    actionButtonText: {
      color: theme.button.primary.text,
      fontSize: 12,
      fontWeight: '600',
    },
    contentContainer: {
      padding: 16,
    },
    categoryCard: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    categoryHeaderPressed: {
      backgroundColor: theme.background.secondary,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
      flex: 1,
    },
    categoryBadge: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    categoryBadgeText: {
      color: theme.button.primary.text,
      fontSize: 12,
      fontWeight: '600',
    },
    expandIcon: {
      fontSize: 20,
      color: theme.text.secondary,
    },
    flagsList: {
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
    flagItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    flagItemLast: {
      borderBottomWidth: 0,
    },
    flagHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    flagName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      flex: 1,
      marginRight: 8,
    },
    flagDescription: {
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    flagMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    metaBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: theme.background.secondary,
    },
    metaBadgeText: {
      fontSize: 11,
      color: theme.text.secondary,
    },
    overrideBadge: {
      backgroundColor: theme.button.warning.background,
    },
    overrideBadgeText: {
      color: theme.button.warning.text,
      fontWeight: '600',
    },
    infoCard: {
      backgroundColor: theme.background.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.button.info.background,
    },
    infoText: {
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 20,
    },
    warningCard: {
      backgroundColor: theme.button.warning.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    warningText: {
      fontSize: 13,
      color: theme.button.warning.text,
      fontWeight: '600',
    },
  });

  const toggleCategory = (category: FeatureFlagCategory) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleToggleFlag = (flagKey: string, currentValue: boolean) => {
    if (!__DEV__) {
      setModal({
        variant: 'info',
        title: 'Not Available',
        message: 'Feature flag toggling is only available in development mode',
      });
      return;
    }

    setFeatureFlagOverride(flagKey, !currentValue);
  };

  const handleClearOverride = (flagKey: string) => {
    if (!__DEV__) return;
    clearOverride(flagKey);
  };

  const handleResetToDefaults = () => {
    setModal({
      variant: 'confirm',
      title: 'Reset to Defaults',
      message:
        'This will reset all feature flags to their default configuration and clear all overrides. Continue?',
      confirmLabel: 'Reset',
      onConfirm: () => {
        resetToDefaults();
        setModal({
          variant: 'success',
          title: 'Success',
          message: 'Feature flags reset to defaults',
        });
      },
    });
  };

  const handleClearAllOverrides = () => {
    setModal({
      variant: 'confirm',
      title: 'Clear All Overrides',
      message: 'This will clear all feature flag overrides. Continue?',
      confirmLabel: 'Clear',
      onConfirm: () => {
        clearAllOverrides();
        setModal({
          variant: 'success',
          title: 'Success',
          message: 'All overrides cleared',
        });
      },
    });
  };

  const renderFlagItem = (flag: FeatureFlag, isLast: boolean) => {
    const isEnabled = isFeatureEnabled(flag.key);
    const hasOverride = flag.key in overrides;

    return (
      <View
        key={flag.key}
        style={[styles.flagItem, isLast && styles.flagItemLast]}
      >
        <View style={styles.flagHeader}>
          <Text style={styles.flagName}>{flag.name || flag.key}</Text>
          <Switch
            value={isEnabled}
            onValueChange={() => handleToggleFlag(flag.key, isEnabled)}
            trackColor={{
              false: theme.border.secondary,
              true: theme.button.success.background,
            }}
            thumbColor={
              isEnabled ? theme.button.success.text : theme.text.secondary
            }
            disabled={!__DEV__}
          />
        </View>

        <Text style={styles.flagDescription}>{flag.description}</Text>

        <View style={styles.flagMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              {flag.targeting.rolloutPercentage}% rollout
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              {flag.targeting.environments.join(', ')}
            </Text>
          </View>
          {flag.metadata?.priority && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{flag.metadata.priority}</Text>
            </View>
          )}
          {hasOverride && (
            <TouchableOpacity
              style={[styles.metaBadge, styles.overrideBadge]}
              onPress={() => handleClearOverride(flag.key)}
              disabled={!__DEV__}
            >
              <Text style={[styles.metaBadgeText, styles.overrideBadgeText]}>
                OVERRIDDEN (tap to clear)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderCategory = (category: FeatureFlagCategory) => {
    const categoryFlags = flags.filter(flag => flag.category === category);
    const flagCount = categoryFlags.length;
    const isExpanded = expandedCategory === category;

    if (flagCount === 0) {
      return null;
    }

    return (
      <View key={category} style={styles.categoryCard}>
        <TouchableOpacity
          style={[
            styles.categoryHeader,
            isExpanded && styles.categoryHeaderPressed,
          ]}
          onPress={() => toggleCategory(category)}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{flagCount}</Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.flagsList}>
            {categoryFlags.map((flag, index) =>
              renderFlagItem(flag, index === categoryFlags.length - 1),
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚩 Feature Flags Manager</Text>
          <Text style={styles.headerSubtitle}>
            View and manage all feature flags in the application
          </Text>

          {__DEV__ && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClearAllOverrides}
                disabled={!hasOverrides}
              >
                <Text style={styles.actionButtonText}>Clear Overrides</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={handleResetToDefaults}
              >
                <Text style={styles.actionButtonText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {!__DEV__ && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️ Toggling is disabled in production mode
              </Text>
            </View>
          )}

          {hasOverrides && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                ℹ️ You have active overrides. These will persist until cleared
                or reset.
              </Text>
            </View>
          )}

          {CATEGORIES.map(renderCategory)}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </>
  );
};

export default FeatureFlagsManagementScreen;
