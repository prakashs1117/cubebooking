import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import { HomeIcon } from '@/components/icons/components/HomeIcon';
import { MegaphoneIcon } from '@/components/icons/components/MegaphoneIcon';
import { FileTextIcon } from '@/components/icons/components/FileTextIcon';
import { TicketIcon } from '@/components/icons/components/TicketIcon';
import { AwardIcon } from '@/components/icons/components/AwardIcon';
import SaveIcon from '@/components/icons/components/SaveIcon';

interface DashboardSidebarProps {
  activeItem?: string;
  onItemPress?: (item: string) => void;
}

export default function DashboardSidebar({
  activeItem = 'dashboard',
  onItemPress,
}: DashboardSidebarProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: 236,
      backgroundColor: theme.background.secondary,
      borderRightWidth: 1,
      borderRightColor: theme.border.primary,
      paddingVertical: 20,
      paddingHorizontal: 12,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingBottom: 18,
      marginBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    brandMark: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#149B5F',
      justifyContent: 'center',
      alignItems: 'center',
    },
    brandText: {
      flex: 1,
    },
    brandTitle: {
      fontSize: 14.5,
      fontWeight: '900',
      letterSpacing: -0.01,
      color: theme.text.primary,
    },
    brandSub: {
      fontSize: 9.5,
      fontWeight: '700',
      letterSpacing: 0.12,
      textTransform: 'uppercase',
      color: theme.text.secondary,
      marginTop: 2,
    },
    nav: {
      flex: 1,
      paddingVertical: 14,
    },
    label: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.12,
      textTransform: 'uppercase',
      color: theme.text.tertiary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginBottom: 5,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingVertical: 11,
      paddingHorizontal: 12,
      marginBottom: 6,
      borderRadius: 12,
    },
    navItemActive: {
      backgroundColor: '#ECFDF3',
    },
    navItemDark: {
      backgroundColor: 'rgba(20,155,95,.16)',
    },
    navIcon: {
      width: 18,
      height: 18,
    },
    navText: {
      fontSize: 13.5,
      fontWeight: '600',
      flex: 1,
      color: theme.text.secondary,
    },
    navTextActive: {
      fontWeight: '800',
      color: '#149B5F',
    },
    navBadge: {
      fontSize: 10,
      fontWeight: '800',
      backgroundColor: '#F8F9FA',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 99,
      color: theme.text.secondary,
    },
    storageCard: {
      marginVertical: 12,
      marginHorizontal: 4,
      paddingHorizontal: 13,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: '#ECFDF3',
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    storageTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 3,
    },
    storageDesc: {
      fontSize: 10.5,
      color: theme.text.secondary,
      lineHeight: 1.45,
      marginBottom: 9,
    },
    footer: {
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border.primary,
    },
  });

  const workspaceItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'announcements', label: 'Announcements', icon: MegaphoneIcon, badge: '4' },
    { id: 'blogs', label: 'Blogs & Articles', icon: FileTextIcon },
    { id: 'events', label: 'Events', icon: TicketIcon, badge: '2' },
    { id: 'calendar', label: 'Calendar', icon: AwardIcon },
  ];

  const communityItems = [
    { id: 'recognition', label: 'Recognition', icon: AwardIcon },
    { id: 'directory', label: 'Directory', icon: SaveIcon },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <CustomText style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>EC</CustomText>
        </View>
        <View style={styles.brandText}>
          <CustomText style={styles.brandTitle}>Employee Connect</CustomText>
          <CustomText style={styles.brandSub}>Merck · EMEA</CustomText>
        </View>
      </View>

      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        <CustomText style={styles.label}>Workspace</CustomText>
        {workspaceItems.map(item => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive && (theme.text.primary === '#000000' ? styles.navItemActive : styles.navItemDark),
              ]}
              onPress={() => onItemPress?.(item.id)}
              activeOpacity={0.7}
            >
              <IconComponent
                width={18}
                height={18}
                color={isActive ? '#149B5F' : theme.text.secondary}
              />
              <CustomText style={[styles.navText, isActive && styles.navTextActive]}>
                {item.label}
              </CustomText>
              {item.badge && <CustomText style={styles.navBadge}>{item.badge}</CustomText>}
            </TouchableOpacity>
          );
        })}

        <CustomText style={styles.label}>Community</CustomText>
        {communityItems.map(item => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => onItemPress?.(item.id)}
              activeOpacity={0.7}
            >
              <IconComponent width={18} height={18} color={theme.text.secondary} />
              <CustomText style={styles.navText}>{item.label}</CustomText>
            </TouchableOpacity>
          );
        })}

        <View style={styles.storageCard}>
          <CustomText style={styles.storageTitle}>Innovation Day 2026</CustomText>
          <CustomText style={styles.storageDesc}>
            Seat booking opens Friday 09:00 CET. 420 seats · 3 tracks.
          </CustomText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem} onPress={() => onItemPress?.('settings')} activeOpacity={0.7}>
          <SaveIcon width={18} height={18} color={theme.text.secondary} />
          <CustomText style={styles.navText}>Settings</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
