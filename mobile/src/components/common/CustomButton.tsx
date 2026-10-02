import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  containerStyle,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonHeight = () => {
    switch (size) {
      case 'small':
        return 38;
      case 'medium':
        return 44;
      case 'large':
      default:
        return 50;
    }
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: getButtonHeight(),
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: theme.border.secondary,
        opacity: 0.5,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.button.primary.background,
          shadowColor: theme.button.primary.background,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.background.card,
          borderWidth: 1,
          borderColor: theme.border.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.button.primary.background,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#999999';
    switch (variant) {
      case 'primary':
        return theme.button.primary.text;
      case 'secondary':
      case 'outline':
        return theme.text.primary;
      default:
        return theme.button.primary.text;
    }
  };

  const styles = StyleSheet.create({
    button: getButtonStyles(),
    text: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: size === 'small' ? 13 : 15,
      fontWeight: '700',
      color: getTextColor(),
    },
    iconLeft: {
      marginRight: 6,
    },
    iconRight: {
      marginLeft: 6,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, containerStyle]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && <Text style={styles.iconLeft}>{leftIcon}</Text>}
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {rightIcon && <Text style={styles.iconRight}>{rightIcon}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
