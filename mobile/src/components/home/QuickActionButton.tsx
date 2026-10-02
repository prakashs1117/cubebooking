import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  iconBackgroundColor: string;
  onPress?: () => void;
}

export default function QuickActionButton({
  icon,
  label,
  iconBackgroundColor,
  onPress,
}: QuickActionButtonProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 8,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 11,
      backgroundColor: iconBackgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.primary,
      textAlign: 'center',
      lineHeight: 16,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>{icon}</View>
      <CustomText style={styles.label}>{label}</CustomText>
    </TouchableOpacity>
  );
}
