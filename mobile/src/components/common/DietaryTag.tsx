import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FontSize, FontWeight } from '@theme/typography';
import { Radius, Spacing } from '@theme/spacing';
import { MERCK_TOKENS } from '@theme/merckTokens';

type DietaryType = 'Veg' | 'Non-Veg' | 'Gluten-free' | 'Contains dairy' | 'Contains nuts' | 'Contains egg';

interface DietaryTagProps {
  type: DietaryType | string;
  style?: ViewStyle;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'Veg': { bg: '#0E9F6E22', text: '#0E9F6E' },
  'Non-Veg': { bg: '#E5484D22', text: '#E5484D' },
  'Gluten-free': { bg: '#2E7DF622', text: '#2E7DF6' },
  'Contains dairy': { bg: '#FBBF4022', text: '#FBBF40' },
  'Contains nuts': { bg: '#FF6A3D22', text: '#FF6A3D' },
  'Contains egg': { bg: '#a855f722', text: '#a855f7' },
};

export default function DietaryTag({ type, style }: DietaryTagProps) {
  const colors = TAG_COLORS[type] ?? { bg: MERCK_TOKENS.bgSurface, text: MERCK_TOKENS.tabInactive };

  return (
    <View style={[styles.tag, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  text: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
});
