import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useAppearanceStore } from '@stores/appearanceStore';
import { useFETheme } from '@theme/useFETheme';

function Bar({ active, color, seed }: { active: boolean; color: string; seed: { dur: number; delay: number; base: number } }) {
  const animations = useAppearanceStore((s) => s.animations);
  const h = useSharedValue(seed.base);
  useEffect(() => {
    if (active && animations) {
      h.value = withDelay(seed.delay * 1000, withRepeat(withTiming(1, { duration: seed.dur * 1000 }), -1, true));
    } else {
      h.value = withTiming(active ? 0.7 : seed.base * 0.4, { duration: 250 });
    }
  }, [active, animations, h, seed]);
  const style = useAnimatedStyle(() => ({ height: `${Math.max(8, h.value * 100)}%` }));
  return <Animated.View style={[styles.bar, { backgroundColor: color, opacity: active ? 1 : 0.45 }, style]} />;
}

export interface FEWaveformProps {
  active?: boolean;
  bars?: number;
  height?: number;
  color?: string;
}

/** Animated speaking waveform. Static-ish when inactive; lively when recording. */
export default function FEWaveform({ active = false, bars = 34, height = 72, color }: FEWaveformProps) {
  const t = useFETheme();
  const seeds = React.useMemo(
    () => Array.from({ length: bars }, (_, i) => ({ dur: 0.5 + (i % 7) * 0.11, delay: (i % 11) * 0.06, base: 0.22 + ((i * 37) % 60) / 100 })),
    [bars],
  );
  return (
    <View style={[styles.row, { height }]}>
      {seeds.map((s, i) => (
        <Bar key={i} active={active} color={color ?? t.aText} seed={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  bar: { width: 4, borderRadius: 3 },
});
