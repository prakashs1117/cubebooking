import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';

interface KPICardProps {
  icon: React.ReactNode;
  iconBackgroundColor: string;
  value: string | number;
  label: string;
  trend?: string;
  trendType?: 'positive' | 'warning';
}

export default function KPICard({
  icon,
  iconBackgroundColor,
  value,
  label,
  trend,
  trendType = 'positive',
}: KPICardProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 10,
      paddingVertical: 15,
      paddingHorizontal: 16,
      position: 'relative',
      overflow: 'hidden',
    },
    iconContainer: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: iconBackgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 11,
    },
    value: {
      fontSize: 21,
      fontWeight: '900',
      letterSpacing: -0.02,
      color: theme.text.primary,
      marginBottom: 4,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    trend: {
      position: 'absolute',
      top: 14,
      right: 14,
      fontSize: 10,
      fontWeight: '800',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 99,
    },
    trendPositive: {
      backgroundColor: '#ECFDF3',
      color: '#149B5F',
    },
    trendWarning: {
      backgroundColor: '#FFF8E1',
      color: '#9A6B00',
    },
  });

  return (
    <View style={styles.container}>
      {trend && (
        <CustomText
          style={[
            styles.trend,
            trendType === 'positive' ? styles.trendPositive : styles.trendWarning,
          ]}
        >
          {trend}
        </CustomText>
      )}
      <View style={styles.iconContainer}>{icon}</View>
      <CustomText style={styles.value}>{value}</CustomText>
      <CustomText style={styles.label}>{label}</CustomText>
    </View>
  );
}
