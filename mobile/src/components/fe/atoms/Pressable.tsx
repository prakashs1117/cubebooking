import React from 'react';
import { Pressable as RNPressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAppearanceStore } from '@stores/appearanceStore';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface FEPressableProps extends Omit<PressableProps, 'style'> {
  /** Target scale while pressed (default 0.95). */
  scale?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Press-scale wrapper (spring). Mirrors the prototype's `Pressable` press
 * feedback; respects the `animations` appearance flag (reduced-motion).
 */
export default function Pressable({ scale = 0.95, style, children, ...rest }: FEPressableProps) {
  const animations = useAppearanceStore((s) => s.animations);
  const sv = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: sv.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        if (animations) sv.value = withSpring(scale, { damping: 15, stiffness: 320 });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (animations) sv.value = withSpring(1, { damping: 15, stiffness: 320 });
        rest.onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
