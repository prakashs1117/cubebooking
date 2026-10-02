import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface UseLegalModalAnimationReturn {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

/**
 * useLegalModalAnimation
 *
 * Custom hook to manage modal entrance and exit animations.
 *
 * @param visible - Whether the modal is visible
 * @returns Animation values for fade and slide effects
 */
export const useLegalModalAnimation = (
  visible: boolean,
): UseLegalModalAnimationReturn => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  return { fadeAnim, slideAnim };
};
