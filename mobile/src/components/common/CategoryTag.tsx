import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Radius, Spacing } from '@theme/spacing';

interface CategoryTagProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function CategoryTag({ label, active = false, onPress, style }: CategoryTagProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.tag,
        active ? styles.activeTag : styles.inactiveTag,
        style,
      ]}
    >
      <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  activeTag: {
    backgroundColor: MERCK_TOKENS.green + '22',
    borderColor: MERCK_TOKENS.green,
  },
  inactiveTag: {
    backgroundColor: 'transparent',
    borderColor: MERCK_TOKENS.borderDefault,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  activeLabel: {
    color: MERCK_TOKENS.green,
  },
  inactiveLabel: {
    color: MERCK_TOKENS.tabInactive,
  },
});
