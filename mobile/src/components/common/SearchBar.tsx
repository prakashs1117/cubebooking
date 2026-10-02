import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import { Radius, Spacing } from '@theme/spacing';

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.8" />
      <Path d="M21 21l-4.35-4.35" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  onSubmit?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  onSubmit,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <SearchIcon />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={MERCK_TOKENS.tabInactive}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MERCK_TOKENS.bgSurface,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.md,
    padding: 0,
  },
});
