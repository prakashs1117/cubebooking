import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@theme/index';
import { CaptionText } from '@components/common/CustomText';

interface Props {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

const DEFAULT_MESSAGE = 'Save this to your favourites for quick access.';
const EXIT_DURATION = 180;

const SwipeHintBubble: React.FC<Props> = ({ visible, message, onDismiss }) => {
  const { isDark } = useTheme();

  // Keep rendered during exit animation
  const [mounted, setMounted] = useState(visible);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.72);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Enter: spring scale + fade in
      opacity.value = withTiming(1, { duration: 260 });
      scale.value = withSpring(1, { damping: 14, stiffness: 180 });
      // Pulse after settle to draw attention
      scale.value = withDelay(
        360,
        withSequence(
          withTiming(1.05, { duration: 160 }),
          withSpring(1, { damping: 12, stiffness: 200 }),
        ),
      );
    } else {
      // Exit: shrink + fade, then unmount
      opacity.value = withTiming(0, { duration: EXIT_DURATION });
      scale.value = withTiming(0.82, { duration: EXIT_DURATION });
      const t = setTimeout(() => setMounted(false), EXIT_DURATION + 20);
      return () => clearTimeout(t);
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!mounted) return null;

  const bubbleBg = isDark ? '#2C2C3E' : '#FFFFFF';
  const textColor = isDark ? '#F0F0F5' : '#1A1A2E';
  const label = message && message.length > 0 ? message : DEFAULT_MESSAGE;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Upward-pointing tail — matches bubble bg */}
      <View style={[styles.tail, { borderBottomColor: bubbleBg }]} />

      <TouchableOpacity
        onPress={onDismiss}
        activeOpacity={0.8}
        style={[styles.bubble, getBubbleStyle(bubbleBg, isDark)]}
      >
        <CaptionText style={[styles.text, { color: textColor }]} numberOfLines={2}>
          {label}
        </CaptionText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getBubbleStyle = (bg: string, dark: boolean) => ({
  backgroundColor: bg,
  shadowColor: dark ? '#000000' : '#4A1259',
  shadowOpacity: dark ? 0.4 : 0.12,
});

const styles = StyleSheet.create({
  container: {
    maxWidth: 220,
    alignItems: 'flex-start',
    // anchor scale from bottom-left (where the tail is)
    transformOrigin: 'bottom left',
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 9,
    marginLeft: 18,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});

export default SwipeHintBubble;
