import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import QuickActionButton from './QuickActionButton';
import { TicketIcon } from '@/components/icons/components/TicketIcon';
import { QRCodeIcon } from '@/components/icons/components/QRCodeIcon';
import { AwardIcon } from '@/components/icons/components/AwardIcon';
import { FileTextIcon } from '@/components/icons/components/FileTextIcon';

interface QuickActionGridProps {
  onBookSeat?: () => void;
  onCheckIn?: () => void;
  onRecognize?: () => void;
  onWriteBlog?: () => void;
}

export default function QuickActionGrid({
  onBookSeat,
  onCheckIn,
  onRecognize,
  onWriteBlog,
}: QuickActionGridProps) {
  const { theme, isDark } = useTheme();

  const accentGreen = isDark ? 'rgba(20,155,95,.16)' : '#ECFDF3';
  const accentCyan = isDark ? 'rgba(45,190,205,.14)' : '#E9FAFC';
  const accentYellow = isDark ? 'rgba(255,200,50,.12)' : '#FFF8E1';
  const accentGray = theme.background.secondary;

  const styles = StyleSheet.create({
    grid: {
      marginHorizontal: 14,
      marginBottom: 10,
      display: 'flex',
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 0,
    },
  });

  return (
    <View style={styles.grid}>
      <View style={{ flex: 1 }}>
        <QuickActionButton
          icon={<TicketIcon width={19} height={19} color="#149B5F" />}
          label="Book seat"
          iconBackgroundColor={accentGreen}
          onPress={onBookSeat}
        />
      </View>
      <View style={{ flex: 1 }}>
        <QuickActionButton
          icon={<QRCodeIcon width={19} height={19} color="#2DBECD" />}
          label="Check-in"
          iconBackgroundColor={accentCyan}
          onPress={onCheckIn}
        />
      </View>
      <View style={{ flex: 1 }}>
        <QuickActionButton
          icon={<AwardIcon width={19} height={19} color="#B07B00" />}
          label="Recognize"
          iconBackgroundColor={accentYellow}
          onPress={onRecognize}
        />
      </View>
      <View style={{ flex: 1 }}>
        <QuickActionButton
          icon={<FileTextIcon width={19} height={19} color={theme.text.primary} />}
          label="Write blog"
          iconBackgroundColor={accentGray}
          onPress={onWriteBlog}
        />
      </View>
    </View>
  );
}
