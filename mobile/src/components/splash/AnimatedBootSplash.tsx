/**
 * AnimatedBootSplash
 *
 * Renders a full-screen JS overlay that mirrors the native BootSplash,
 * then plays a smooth exit animation before revealing the app.
 *
 * Animation sequence:
 *  1. Logo springs in from 0.85 → 1.0 scale while fading in (entrance)
 *  2. Brief hold (~400ms)
 *  3. Logo pulses up to 1.08 then shrinks + fades out simultaneously
 *  4. Container fades to transparent, revealing the app beneath
 */

import React, { useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import BootSplash from 'react-native-bootsplash';

// Generated assets — created by `npx react-native-bootsplash generate`
 
const logoSrc = require('@assets/bootsplash/logo.png');
 
const manifest = require('@assets/bootsplash/manifest.json');

type Props = {
  onAnimationEnd: () => void;
};

const ANIMATION_DURATION_MS = 500;
const HOLD_DELAY_MS = 400;

export default function AnimatedBootSplash({ onAnimationEnd }: Props) {
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const hasAnimated = useRef(false);

  const runExitAnimation = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Phase 1: entrance spring
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    logoOpacity.value = withTiming(1, { duration: 300 });

    // Phase 2: pulse up → shrink out + container fade (after hold delay)
    logoScale.value = withDelay(
      HOLD_DELAY_MS,
      withSequence(
        withTiming(1.08, { duration: 150 }),
        withTiming(0.6, { duration: ANIMATION_DURATION_MS }),
      ),
    );

    logoOpacity.value = withDelay(
      HOLD_DELAY_MS + 150,
      withTiming(0, { duration: ANIMATION_DURATION_MS }),
    );

    containerOpacity.value = withDelay(
      HOLD_DELAY_MS + 200,
      withTiming(0, { duration: ANIMATION_DURATION_MS }, () => {
        runOnJS(onAnimationEnd)();
      }),
    );
  }, [containerOpacity, logoScale, logoOpacity, onAnimationEnd]);

  const { container, logo } = BootSplash.useHideAnimation({
    manifest,
    logo: logoSrc,
    ready: true,
    animate: runExitAnimation,
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View
      {...container}
      style={[container.style, styles.container, animatedContainerStyle]}
    >
      <Animated.Image
        {...logo}
        // Override fadeDuration so reanimated controls it fully
        fadeDuration={0}
        style={[logo.style, styles.logo, animatedLogoStyle]}
      />
      <Animated.Text style={[styles.setupText, animatedLogoStyle]}>
        We are setting up for you
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Ensure it sits on top of everything — zIndex handled by absolute fill
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B1D8A',
  },
  logo: {
    // Explicit size from manifest keeps it pixel-perfect on all densities
    width: manifest.logo.width,
    height: manifest.logo.height,
    // Override absolute position from logo.style to use flex centering
    position: 'relative',
  },
  setupText: {
    marginTop: 24,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.85,
  },
});
