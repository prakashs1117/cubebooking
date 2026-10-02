import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { Spacing } from '@theme/spacing';

interface DividerProps {
  style?: ViewStyle;
  indent?: number;
}

export default function Divider({ style, indent = 0 }: DividerProps) {
  return (
    <View style={[styles.line, { marginLeft: indent }, style]} />
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: MERCK_TOKENS.borderDefault,
    marginVertical: Spacing.sm,
  },
});
