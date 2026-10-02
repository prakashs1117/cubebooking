/**
 * AnimatedTabBar
 *
 * Wraps React Navigation's default BottomTabBar and slides it off-screen
 * when the user scrolls down, sliding it back when they scroll up.
 * Uses safe area insets to sit above the home indicator on notched iPhones.
 */

import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarVisibility } from '@context/TabBarVisibilityContext';

const TAB_BAR_HEIGHT = 60; // matches tabBarVisible.height in TabNavigator

const AnimatedTabBar: React.FC<BottomTabBarProps> = props => {
  const { progress } = useTabBarVisibility();
  const { bottom: bottomInset } = useSafeAreaInsets();

  // On notched iPhones bottomInset is ~34, on others it's 0
  const safeBottom = Platform.OS === 'ios' ? bottomInset : 0;

  // Total distance to slide off-screen when hiding
  const translateDistance = TAB_BAR_HEIGHT + safeBottom + 10;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }],
  }));

  return (
    <Animated.View
      style={[styles.container, { bottom: safeBottom }, animatedStyle]}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

export default AnimatedTabBar;
