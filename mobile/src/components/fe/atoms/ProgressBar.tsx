import React from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFETheme } from '@theme/useFETheme';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  h?: number;
  /** Two-color gradient fill; defaults to the current accent. */
  fill?: [string, string];
}

/** Gradient-fill progress bar with rounded track. */
export default function ProgressBar({ value, h = 8, fill }: ProgressBarProps) {
  const t = useFETheme();
  const pct = Math.max(0, Math.min(1, value));
  const colors = fill ?? [t.a1, t.a2];

  return (
    <View style={{ height: h, borderRadius: h, backgroundColor: t.track, overflow: 'hidden' }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${pct * 100}%`, height: '100%', borderRadius: h }}
      />
    </View>
  );
}
