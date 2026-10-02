import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FEGlyph from '@components/fe/atoms/FEGlyph';
import { toneGradient } from '@theme/feTokens';
import type { FETone } from '@demand/shared/fe';

export interface GradIconProps {
  name: string;
  tone?: FETone;
  size?: number;
  /** Glyph size as a fraction of tile size (default 0.52). */
  glyph?: number;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Gradient squircle tile with a white glyph — the "multicolor icon" primitive.
 * Ported from design/fe/fe-icons.jsx `GradIcon`.
 */
export default function GradIcon({
  name,
  tone = 'iris',
  size = 44,
  glyph = 0.52,
  glow = true,
  style,
}: GradIconProps) {
  const [c1, c2] = toneGradient(tone);
  const radius = Math.round(size * 0.31);

  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          alignItems: 'center',
          justifyContent: 'center',
        },
        glow && {
          shadowColor: c2,
          shadowOffset: { width: 0, height: Math.round(size * 0.16) },
          shadowOpacity: 0.6,
          shadowRadius: Math.round(size * 0.36),
          elevation: 6,
        },
        style,
      ]}
    >
      <FEGlyph name={name} size={Math.round(size * glyph)} color="#fff" />
    </LinearGradient>
  );
}
