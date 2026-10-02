import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Radius, Shadow, Spacing } from '@theme/spacing';

interface StatChipProps {
  label: string;
  value: string | number;
  iconColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function StatChip({ label, value, iconColor = MERCK_TOKENS.green, icon, style }: StatChipProps) {
  return (
    <View style={[styles.chip, style]}>
      {icon && (
        <View style={[styles.iconDot, { backgroundColor: iconColor + '22' }]}>
          {icon}
        </View>
      )}
      <View style={styles.textStack}>
        <Text style={styles.value} numberOfLines={1}>{value}</Text>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: MERCK_TOKENS.cardBackground,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    width: 104,
    height: 56,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Shadow.sm,
  },
  iconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStack: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: 20,
  },
  label: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.medium,
    lineHeight: 14,
  },
});
