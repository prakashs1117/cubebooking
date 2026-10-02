import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  badge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
}

export default function IconButton({
  icon,
  onPress,
  badge = false,
  size = 'md',
  backgroundColor,
}: IconButtonProps) {
  const { theme } = useTheme();

  const sizeMap = {
    sm: { width: 36, height: 36, borderRadius: 10 },
    md: { width: 42, height: 42, borderRadius: 14 },
    lg: { width: 50, height: 50, borderRadius: 16 },
  };

  const { width, height, borderRadius } = sizeMap[size];

  const styles = StyleSheet.create({
    button: {
      width,
      height,
      borderRadius,
      backgroundColor: backgroundColor || theme.background.muted,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    icon: {
      color: theme.text.primary,
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: '#FFC832',
      borderWidth: 2,
      borderColor: theme.background.primary,
    },
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.button} activeOpacity={0.7}>
      {icon}
      {badge && <View style={styles.badge} />}
    </TouchableOpacity>
  );
}
