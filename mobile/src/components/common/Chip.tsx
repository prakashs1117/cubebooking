import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from './CustomText';

interface ChipProps {
  label: string;
  type: 'blog' | 'kudos' | 'news';
}

export default function Chip({ label, type }: ChipProps) {
  const { theme, isDark } = useTheme();

  const typeMap = {
    blog: {
      backgroundColor: isDark ? 'rgba(45,190,205,.14)' : '#E9FAFC',
      textColor: isDark ? '#5ED0DE' : '#0E7A87',
    },
    kudos: {
      backgroundColor: isDark ? 'rgba(255,200,50,.12)' : '#FFF8E1',
      textColor: isDark ? '#FFD75E' : '#9A6B00',
    },
    news: {
      backgroundColor: isDark ? 'rgba(20,155,95,.16)' : '#ECFDF3',
      textColor: isDark ? '#34C383' : '#01884C',
    },
  };

  const { backgroundColor, textColor } = typeMap[type];

  const styles = StyleSheet.create({
    chip: {
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 18,
      backgroundColor,
      alignSelf: 'flex-start',
    },
    text: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.1,
      textTransform: 'uppercase',
      color: textColor,
    },
  });

  return (
    <View style={styles.chip}>
      <CustomText style={styles.text}>{label}</CustomText>
    </View>
  );
}
