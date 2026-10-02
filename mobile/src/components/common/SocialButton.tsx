import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import GoogleIcon from '@assets/icon-google';
import AppleIcon from '@assets/icon-apple';

interface SocialButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  onPress: () => void;
  containerStyle?: ViewStyle;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  containerStyle,
}) => {
  const { theme } = useTheme();

  const getProviderIcon = () => {
    const iconSize = 18;
    switch (provider) {
      case 'google':
        return <GoogleIcon size={iconSize} />;
      case 'apple':
        return <AppleIcon size={iconSize} color={theme.text.primary} />;
      case 'facebook':
        return <Text style={styles.icon}>📘</Text>; // Replace with Facebook logo if needed
      default:
        return null;
    }
  };

  const getProviderName = () => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple';
      case 'facebook':
        return 'Facebook';
      default:
        return provider;
    }
  };

  const styles = StyleSheet.create({
    button: {
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.secondary,
      borderRadius: 10,
      paddingHorizontal: 12,
      gap: 10,
    },
    iconContainer: {
      width: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 18,
    },
    text: {
      fontFamily: getFontStyle('bodySmall').fontFamily,
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.primary,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{getProviderIcon()}</View>
      <Text style={styles.text}>{getProviderName()}</Text>
    </TouchableOpacity>
  );
};

export default SocialButton;
