import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useFETheme } from '@theme/useFETheme';

export interface GlassCardProps {
  pad?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Translucent card with the FE corner radius + hairline stroke + elevation.
 *
 * RN has no `backdrop-filter`, so this uses a translucent fill (theme.card)
 * rather than a real blur. A BlurView enhancement can be layered later on
 * iOS; the translucent fill reads acceptably on both platforms (see plan
 * "Blur on Android" risk).
 */
export default function GlassCard({ pad = 16, style, children }: GlassCardProps) {
  const t = useFETheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.card,
          borderRadius: t.radius,
          borderWidth: 1,
          borderColor: t.stroke,
          padding: pad,
          ...t.cardShadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
