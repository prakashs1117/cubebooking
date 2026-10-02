import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import GradIcon from '@components/fe/atoms/GradIcon';
import { useFETheme } from '@theme/useFETheme';
import { useAppearanceStore } from '@stores/appearanceStore';
import type { FETone } from '@demand/shared/fe';

/** [icon, tone, size] */
export type ClusterIcon = [string, FETone, number];

function Floaty({ delay, children }: { delay: number; children: React.ReactNode }) {
  const animations = useAppearanceStore((s) => s.animations);
  const y = useSharedValue(0);
  useEffect(() => {
    if (!animations) return;
    y.value = withDelay(
      delay,
      withRepeat(withTiming(-10, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [animations, delay, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Floating multicolor icon cluster (Welcome hero). Ported from fe-onboarding.jsx. */
export default function FEFloatCluster({ icons }: { icons: ClusterIcon[] }) {
  const t = useFETheme();
  const [a, b, c] = icons;
  return (
    <View style={styles.wrap}>
      <View style={[styles.glassCircle, { backgroundColor: t.card, borderColor: t.stroke }]} />
      <View style={styles.center}>
        <Floaty delay={0}>
          <GradIcon name={a[0]} tone={a[1]} size={a[2]} />
        </Floaty>
      </View>
      <View style={styles.topLeft}>
        <Floaty delay={600}>
          <GradIcon name={b[0]} tone={b[1]} size={b[2]} />
        </Floaty>
      </View>
      <View style={styles.bottomRight}>
        <Floaty delay={1100}>
          <GradIcon name={c[0]} tone={c[1]} size={c[2]} />
        </Floaty>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 240, height: 230, alignSelf: 'center' },
  glassCircle: {
    position: 'absolute',
    left: 35,
    top: 30,
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
  },
  center: { position: 'absolute', left: '50%', top: '50%', marginLeft: -46, marginTop: -46 },
  topLeft: { position: 'absolute', left: 18, top: 36 },
  bottomRight: { position: 'absolute', right: 16, bottom: 40 },
});
