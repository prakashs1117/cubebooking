import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from './CustomText';

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: [string, string];
}

export default function Avatar({
  initials,
  size = 'md',
  gradient,
}: AvatarProps) {
  const { theme, isDark } = useTheme();

  const sizeMap = {
    sm: { width: 32, height: 32, fontSize: 11 },
    md: { width: 42, height: 42, fontSize: 14 },
    lg: { width: 50, height: 50, fontSize: 16 },
    xl: { width: 84, height: 84, fontSize: 26 },
  };

  const { width, height, fontSize } = sizeMap[size];

  const defaultGradient = [theme.button.primary.background, '#2DBECD'];
  const [startColor, endColor] = gradient || defaultGradient;

  const styles = StyleSheet.create({
    avatar: {
      width,
      height,
      borderRadius: width / 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: startColor,
      borderWidth: size === 'lg' ? 2 : size === 'xl' ? 3 : 0,
      borderColor: theme.background.primary,
    },
    initials: {
      color: '#fff',
      fontWeight: '800',
      fontSize,
    },
  });

  return (
    <View style={styles.avatar}>
      <CustomText style={styles.initials}>{initials.toUpperCase()}</CustomText>
    </View>
  );
}
