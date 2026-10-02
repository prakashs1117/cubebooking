import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AvatarGradients } from '@theme/colors';
import { FontWeight } from '@theme/typography';

interface GradientAvatarProps {
  initials: string;
  gradientIndex?: number;
  size?: number;
  style?: ViewStyle;
}

export default function GradientAvatar({
  initials,
  gradientIndex = 0,
  size = 40,
  style,
}: GradientAvatarProps) {
  const colors = AvatarGradients[gradientIndex % AvatarGradients.length];
  const fontSize = Math.round(size * 0.38);

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, style]}
    >
      <Text style={[styles.text, { fontSize }]} numberOfLines={1}>
        {initials.toUpperCase().slice(0, 2)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
});
