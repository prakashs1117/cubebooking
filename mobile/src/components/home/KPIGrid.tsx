import React from 'react';
import { View, StyleSheet } from 'react-native';
import KPICard from './KPICard';
import SaveIcon from '@/components/icons/components/SaveIcon';
import { TicketIcon } from '@/components/icons/components/TicketIcon';
import { MegaphoneIcon } from '@/components/icons/components/MegaphoneIcon';
import { HeartIcon } from '@/components/icons/components/HeartIcon';

interface KPIGridProps {
  onKPIPress?: (kpiId: string) => void;
}

export default function KPIGrid({ onKPIPress }: KPIGridProps) {
  const styles = StyleSheet.create({
    grid: {
      display: 'flex',
      flexDirection: 'row',
      gap: 14,
      marginBottom: 18,
    },
  });

  const kpis = [
    {
      id: 'employees',
      icon: <SaveIcon width={17} height={17} color="#149B5F" />,
      iconBg: '#ECFDF3',
      value: '2,847',
      label: 'Active employees today',
      trend: '+12%',
    },
    {
      id: 'events',
      icon: <TicketIcon width={17} height={17} color="#2DBECD" />,
      iconBg: '#E9FAFC',
      value: '14',
      label: 'Events this month',
      trend: '+8%',
    },
    {
      id: 'announcements',
      icon: <MegaphoneIcon width={17} height={17} color="#B07B00" />,
      iconBg: '#FFF8E1',
      value: '92%',
      label: 'Announcement reach',
      trend: '3 new',
      trendType: 'warning',
    },
    {
      id: 'reactions',
      icon: <HeartIcon width={17} height={17} color="#149B5F" />,
      iconBg: '#ECFDF3',
      value: '6.4k',
      label: 'Reactions this week',
      trend: '+21%',
    },
  ];

  return (
    <View style={styles.grid}>
      {kpis.map(kpi => (
        <View key={kpi.id} style={{ flex: 1 }}>
          <KPICard
            icon={kpi.icon}
            iconBackgroundColor={kpi.iconBg}
            value={kpi.value}
            label={kpi.label}
            trend={kpi.trend}
            trendType={kpi.trendType as 'positive' | 'warning'}
          />
        </View>
      ))}
    </View>
  );
}
