import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import CustomText from '@/components/common/CustomText';
import Avatar from '@/components/common/Avatar';
import IconButton from '@/components/common/IconButton';
import { MenuIcon } from '@/components/icons/components/MenuIcon';
import { BellIcon } from '@/components/icons/components/BellIcon';

interface MobileAppHeaderProps {
  onMenuPress: () => void;
  onNotificationsPress: () => void;
  hasNotifications?: boolean;
}

export default function MobileAppHeader({
  onMenuPress,
  onNotificationsPress,
  hasNotifications = true,
}: MobileAppHeaderProps) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const greeting = getGreeting();
  const userName = user?.name || 'User';
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    greeting: {
      flex: 1,
      minWidth: 0,
    },
    greetingText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: 2,
    },
    nameText: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: -0.5,
      lineHeight: 1.2,
      color: theme.text.primary,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
  });

  return (
    <View style={styles.container}>
      <IconButton
        icon={<MenuIcon width={20} height={20} color={theme.text.primary} />}
        onPress={onMenuPress}
        size="md"
      />
      <View style={styles.greeting}>
        <CustomText style={styles.greetingText}>{greeting}</CustomText>
        <CustomText style={styles.nameText} numberOfLines={1}>
          {userName}
        </CustomText>
      </View>
      <View style={styles.rightSection}>
        <IconButton
          icon={<BellIcon width={20} height={20} color={theme.text.primary} />}
          onPress={onNotificationsPress}
          badge={hasNotifications}
          size="md"
        />
        <Avatar initials={initials} size="md" />
      </View>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning ☀️';
  if (hour < 18) return 'Good afternoon 🌤️';
  return 'Good evening 🌙';
}
