import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Radius, Spacing } from '@theme/spacing';

type Variant = 'primary' | 'outline' | 'ghost' | 'success';

interface MerckButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  compact?: boolean;
}

const VARIANT_STYLES = {
  primary: {
    bg: MERCK_TOKENS.green,
    text: MERCK_TOKENS.bgApp,
    border: MERCK_TOKENS.green,
  },
  outline: {
    bg: 'transparent',
    text: MERCK_TOKENS.green,
    border: MERCK_TOKENS.green,
  },
  ghost: {
    bg: 'transparent',
    text: MERCK_TOKENS.headerText,
    border: 'transparent',
  },
  success: {
    bg: MERCK_TOKENS.greenDark,
    text: '#fff',
    border: MERCK_TOKENS.greenDark,
  },
};

export default function MerckButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  labelStyle,
  compact = false,
}: MerckButtonProps) {
  const v = VARIANT_STYLES[variant];
  const opacity = disabled ? 0.45 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.btn,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity,
          paddingVertical: compact ? Spacing.sm : 13,
          paddingHorizontal: compact ? Spacing.md : Spacing.lg,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[styles.label, { color: v.text }, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
  },
});
