import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing } from '@theme/spacing';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  style?: ViewStyle;
}

export default function SectionHeader({ title, onSeeAll, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },
  seeAll: {
    color: MERCK_TOKENS.green,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
