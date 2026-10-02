import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { MERCK_TOKENS } from '@theme/merckTokens';

export type TabName = 'Home' | 'Feed' | 'Marketplace' | 'People' | 'Profile';

interface Props {
  tabName: TabName;
  focused: boolean;
  color: string;
  size: number;
  children: React.ReactNode;
}

const SPRING_BOUNCE = { damping: 6, stiffness: 300 };
const SPRING_SETTLE = { damping: 12, stiffness: 250 };

export default function AnimatedTabIcon({ tabName, focused, color, size, children }: Props) {
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      switch (tabName) {
        case 'Home':
          scale.value = withSequence(
            withSpring(1.3, SPRING_BOUNCE),
            withSpring(1.0, SPRING_SETTLE),
          );
          break;

        case 'Feed':
          scale.value = withSequence(
            withSpring(1.25, { damping: 7, stiffness: 320 }),
            withSpring(1.0, SPRING_SETTLE),
          );
          break;

        case 'People':
          scale.value = withSequence(
            withSpring(1.2, { damping: 8, stiffness: 280 }),
            withSpring(1.0, SPRING_SETTLE),
          );
          break;

        case 'Profile':
          scale.value = withSequence(
            withSpring(1.25, SPRING_BOUNCE),
            withSpring(1.0, SPRING_SETTLE),
          );
          ringOpacity.value = withTiming(1, { duration: 150 });
          break;
      }
    } else {
      scale.value = withTiming(1, { duration: 120 });
      ringOpacity.value = withTiming(0, { duration: 120 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const bgOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    bgOpacity.value = withTiming(focused ? 1 : 0, { duration: 180 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const activeBgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      {/* Filled rounded-rect container behind active icon */}
      <Animated.View style={[styles.activeBg, activeBgStyle]} />
      <Animated.View style={containerStyle}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 32,
  },
  activeBg: {
    position: 'absolute',
    width: 52,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 138, 99, 0.15)',
  },
});
