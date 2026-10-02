import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function EmptyState({ title, subtitle, icon, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  iconWrap: {
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  title: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
