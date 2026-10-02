import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';

interface EngagementData {
  label: string;
  value: number; // percentage (0-100)
  isPeak?: boolean;
}

interface EngagementChartProps {
  data?: EngagementData[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
  const { theme } = useTheme();

  const defaultData: EngagementData[] = [
    { label: 'Thu', value: 46 },
    { label: 'Fri', value: 62 },
    { label: 'Sat', value: 30 },
    { label: 'Sun', value: 24 },
    { label: 'Mon', value: 70 },
    { label: 'Tue', value: 96, isPeak: true },
    { label: 'Wed', value: 80 },
  ];

  const chartData = data || defaultData;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 10,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 17,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    title: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.text.primary,
    },
    link: {
      fontSize: 11.5,
      fontWeight: '700',
      color: '#149B5F',
    },
    chartContainer: {
      paddingVertical: 16,
      paddingHorizontal: 12,
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 7,
      height: 88,
    },
    column: {
      flex: 1,
      alignItems: 'center',
      gap: 5,
    },
    bar: {
      width: '100%',
      borderRadius: 3,
      opacity: 0.85,
    },
    barPeak: {
      opacity: 1,
    },
    label: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.text.tertiary,
      textTransform: 'uppercase',
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.title}>Engagement · last 7 days</CustomText>
        <CustomText style={styles.link}>Report</CustomText>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {chartData.map((item, idx) => (
            <View key={idx} style={styles.column}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${item.value}%`,
                    backgroundColor:
                      item.isPeak
                        ? '#FFD75E'
                        : idx % 2 === 1
                          ? '#2DBECD'
                          : '#149B5F',
                  },
                  item.isPeak && styles.barPeak,
                ]}
              />
              <CustomText style={styles.label}>{item.label}</CustomText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
