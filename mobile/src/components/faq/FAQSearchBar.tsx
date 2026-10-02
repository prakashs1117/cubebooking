import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '@theme/index';
import Icon from '@components/icons/Icon';

interface FAQSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * FAQSearchBar
 *
 * Beautiful search bar with clear button and smooth animations
 */
export const FAQSearchBar: React.FC<FAQSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search FAQs...',
  onFocus,
  onBlur,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const focusAnim = useRef(new Animated.Value(0)).current;
  const clearButtonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  useEffect(() => {
    Animated.spring(clearButtonScale, {
      toValue: value.length > 0 ? 1 : 0,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [value, clearButtonScale]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border.primary, theme.text.link],
  });

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.background.card,
          borderColor,
          borderWidth: 2,
        },
      ]}
    >
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Icon
          name="search"
          size={20}
          color={isFocused ? theme.text.link : theme.text.tertiary}
        />
      </View>

      {/* Text Input */}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: theme.text.primary,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.text.tertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never" // We'll use custom clear button
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <Animated.View
          style={[
            styles.clearButton,
            {
              transform: [{ scale: clearButtonScale }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleClear}
            style={[
              styles.clearButtonInner,
              { backgroundColor: theme.background.secondary },
            ]}
            activeOpacity={0.7}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Icon name="close" size={16} color={theme.text.secondary} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingRight: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  clearButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
