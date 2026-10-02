import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { BodyText } from '@components/common/CustomText';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  autoFocus?: boolean;
}

/**
 * OTPInput Component
 * Modern OTP input with individual square boxes for each digit
 * Features:
 * - Clean square boxes for each digit
 * - Auto-focus on next box
 * - Animated focus states
 * - Error handling
 * - Paste support
 */
const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChangeText,
  error,
  autoFocus = true,
}) => {
  const { theme } = useTheme();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null,
  );
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const animatedValues = useRef<Animated.Value[]>(
    Array(length)
      .fill(0)
      .map(() => new Animated.Value(1)),
  ).current;

  // Split value into individual digits
  const digits = value.split('');
  while (digits.length < length) {
    digits.push('');
  }

  useEffect(() => {
    // Auto-focus first input on mount
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Animate focus
  const animateFocus = (index: number, isFocused: boolean) => {
    Animated.spring(animatedValues[index], {
      toValue: isFocused ? 1.05 : 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handleChangeText = (text: string, index: number) => {
    // Handle paste
    if (text.length > 1) {
      const pastedCode = text.slice(0, length);
      onChangeText(pastedCode);
      // Focus last input after paste
      const nextIndex = Math.min(pastedCode.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');

    // Update value
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newValue = newDigits.join('').slice(0, length);
    onChangeText(newValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current box is empty, focus previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChangeText(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        // Clear current box
        const newDigits = [...digits];
        newDigits[index] = '';
        onChangeText(newDigits.join(''));
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    animateFocus(index, true);
  };

  const handleBlur = (index: number) => {
    if (focusedIndex === index) {
      setFocusedIndex(null);
    }
    animateFocus(index, false);
  };

  const handleBoxPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const getBoxStyle = (index: number) => {
    const isFocused = focusedIndex === index;
    const hasValue = !!digits[index];
    const hasError = !!error;

    return [
      styles.box,
      {
        backgroundColor: theme.background.card,
        borderColor: hasError
          ? theme.button.error.background
          : isFocused
          ? theme.button.primary.background
          : hasValue
          ? theme.border.primary
          : theme.border.secondary,
        borderWidth: isFocused ? 2 : 1,
        shadowColor: isFocused
          ? theme.button.primary.background
          : 'transparent',
      },
    ];
  };

  const getTextStyle = (index: number) => {
    const hasValue = !!digits[index];
    return [
      styles.text,
      {
        color: hasValue ? theme.text.primary : theme.text.tertiary,
        fontFamily: getFontStyle('h2').fontFamily,
      },
    ];
  };

  return (
    <View style={styles.container}>
      {/* OTP Input Boxes */}
      <View style={styles.boxesContainer}>
        {Array(length)
          .fill(0)
          .map((_, index) => (
            <Pressable
              key={index}
              onPress={() => handleBoxPress(index)}
              style={styles.boxWrapper}
            >
              <Animated.View
                style={[
                  getBoxStyle(index),
                  {
                    transform: [{ scale: animatedValues[index] }],
                  },
                ]}
              >
                <TextInput
                  ref={ref => (inputRefs.current[index] = ref)}
                  value={digits[index]}
                  onChangeText={text => handleChangeText(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  onFocus={() => handleFocus(index)}
                  onBlur={() => handleBlur(index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  style={[styles.input, getTextStyle(index)]}
                  caretHidden={Platform.OS === 'ios'} // Hide cursor on iOS for cleaner look
                  contextMenuHidden={Platform.OS === 'android'}
                />
                {/* Blinking cursor effect for focused empty box */}
                {focusedIndex === index && !digits[index] && (
                  <View
                    style={[
                      styles.cursor,
                      { backgroundColor: theme.button.primary.background },
                    ]}
                  />
                )}
              </Animated.View>
            </Pressable>
          ))}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <BodyText
            style={[
              styles.errorText,
              {
                color: theme.button.error.background,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
          >
            {error}
          </BodyText>
        </View>
      )}

      {/* Helper Text */}
      <View style={styles.helperContainer}>
        <BodyText
          style={[
            styles.helperText,
            {
              color: theme.text.tertiary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
        >
          Enter the 6-digit code sent to your email
        </BodyText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  boxWrapper: {
    position: 'relative',
  },
  box: {
    width: 44,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 20,
    opacity: 0.6,
  },
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  helperContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  helperText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OTPInput;
