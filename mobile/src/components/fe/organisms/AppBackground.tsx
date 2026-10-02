import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFETheme } from '@theme/useFETheme';

export interface AppBackgroundProps {
  children?: React.ReactNode;
}

/**
 * Ambient FluentEdge screen background: the angled base gradient plus two
 * large radial "glow" blobs (accent top-right, blue bottom-left) behind every
 * screen. Mirrors design/fe/fe-shell.jsx.
 */
export default function AppBackground({ children }: AppBackgroundProps) {
  const t = useFETheme();
  const { colors, locations, angle } = t.bgGradient;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors}
        locations={locations}
        useAngle
        angle={angle}
        style={StyleSheet.absoluteFill}
      />
      {/* accent glow — top right */}
      <View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            top: -90,
            right: -70,
            width: 280,
            height: 280,
            backgroundColor: t.a1,
            opacity: t.isDark ? 0.22 : 0.22,
          },
        ]}
      />
      {/* blue glow — bottom left */}
      <View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            bottom: 40,
            left: -90,
            width: 260,
            height: 260,
            backgroundColor: '#7DA0FF',
            opacity: t.isDark ? 0.22 : 0.3,
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 999 },
});
