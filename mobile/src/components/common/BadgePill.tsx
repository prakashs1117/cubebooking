import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Radius, Spacing } from '@theme/spacing';

type BadgeVariant = 'count' | 'new' | 'label' | 'category';

interface BadgePillProps {
  value: string | number;
  variant?: BadgeVariant;
  color?: string;
  style?: ViewStyle;
}

const VARIANT_COLORS = {
  count: { bg: MERCK_TOKENS.green, text: MERCK_TOKENS.bgApp },
  new: { bg: MERCK_TOKENS.accentAmber, text: MERCK_TOKENS.bgApp },
  label: { bg: MERCK_TOKENS.bgSurface, text: MERCK_TOKENS.headerText },
  category: { bg: MERCK_TOKENS.green + '1A', text: MERCK_TOKENS.green },
};

export default function BadgePill({ value, variant = 'label', color, style }: BadgePillProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: color ? color + '22' : colors.bg,
          borderRadius: variant === 'new' ? Radius.xs : Radius.pill,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: color ?? colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
});
