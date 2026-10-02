import React from 'react';
import { Text, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Pressable from '@components/fe/atoms/Pressable';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface FEButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Primary accent-gradient button (or ghost). Atom. */
export default function FEButton({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: FEButtonProps) {
  const t = useFETheme();
  const isDisabled = disabled || loading;

  const content = loading ? (
    <ActivityIndicator color={variant === 'primary' ? '#fff' : t.aText} />
  ) : (
    <Text style={[styles.label, { color: variant === 'primary' ? '#fff' : t.aText }]}>{label}</Text>
  );

  if (variant === 'ghost') {
    return (
      <Pressable onPress={isDisabled ? undefined : onPress} scale={0.97} style={[styles.base, style, { opacity: isDisabled ? 0.5 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={isDisabled ? undefined : onPress} scale={0.97} style={[style, { opacity: isDisabled ? 0.6 : 1 }]}>
      <LinearGradient colors={[t.a1, t.a2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
        {content}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  label: { fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700' },
});
