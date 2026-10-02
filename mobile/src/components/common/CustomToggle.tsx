import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';

interface CustomToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  size?: number;
  testID?: string;
}

const TogglePath = {
  // Outer pill track (just the outer ring)
  track:
    'M8,5 C4.13401,5 1,8.13401 1,12 C1,15.866 4.13401,19 8,19 L16,19 C19.866,19 23,15.866 23,12 C23,8.13401 19.866,5 16,5 Z',
  // Left (OFF) - circle/thumb on the left side
  circleLeft:
    'M6,12 C6,10.8954 6.89543,10 8,10 C9.10457,10 10,10.8954 10,12 C10,13.1046 9.10457,14 8,14 C6.89543,14 6,13.1046 6,12 Z',
  // Right (ON) - circle/thumb on the right side
  circleRight:
    'M14,12 C14,10.8954 14.8954,10 16,10 C17.1046,10 18,10.8954 18,12 C18,13.1046 17.1046,14 16,14 C14.8954,14 14,13.1046 14,12 Z',
};

export const CustomToggle: React.FC<CustomToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 48,
  testID,
}) => {
  const { isDark } = useTheme();
  const animatedValue = useSharedValue(value ? 1 : 0);

  // Update shared value when value prop changes
  useEffect(() => {
    animatedValue.value = withTiming(value ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  }, [value, animatedValue]);

  // Get track colors based on theme and state
  const onTrackColor = isDark ? BaseColors.merckPurpleLight : BaseColors.merckPurple;
  const offTrackColor = isDark ? BaseColors.gray600 : BaseColors.gray300;

  // Thumb is always white for contrast
  const thumbColor = BaseColors.white;

  // Opacity styles for left and right SVGs
  const leftOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - animatedValue.value,
    };
  });

  const rightOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
    };
  });

  // Main container style
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: disabledValue?.value,
    };
  });

  const height = size * 0.54; // Maintain aspect ratio of pill
  const disabledValue = useSharedValue(disabled ? 0.4 : 1);

  useEffect(() => {
    disabledValue.value = withTiming(disabled ? 0.4 : 1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });
  }, [disabled, disabledValue]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
      testID={testID}
    >
      <Animated.View
        style={[
          {
            width: size,
            height,
            borderRadius: height / 2,
            overflow: 'hidden',
          },
          containerStyle,
        ]}
      >
        {/* LEFT (OFF) SVG */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            leftOpacityStyle,
          ]}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox="0 4 24 16"
            preserveAspectRatio="xMidYMid meet"
          >
            <Path
              d={TogglePath.track}
              fill={offTrackColor}
            />
            <Path
              d={TogglePath.circleLeft}
              fill={thumbColor}
            />
          </Svg>
        </Animated.View>

        {/* RIGHT (ON) SVG */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            rightOpacityStyle,
          ]}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox="0 4 24 16"
            preserveAspectRatio="xMidYMid meet"
          >
            <Path
              d={TogglePath.track}
              fill={onTrackColor}
            />
            <Path
              d={TogglePath.circleRight}
              fill={thumbColor}
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};
