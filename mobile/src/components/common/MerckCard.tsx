import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { Radius, Shadow, Spacing } from '@theme/spacing';

interface MerckCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
}

export default function MerckCard({ children, style, padding = Spacing.lg, elevated = false }: MerckCardProps) {
  return (
    <View style={[styles.card, { padding }, elevated && Shadow.md, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: MERCK_TOKENS.cardBackground,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    ...Shadow.sm,
  },
});
