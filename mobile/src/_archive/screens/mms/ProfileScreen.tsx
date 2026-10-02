import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AppModal, ModalConfig } from '@components/modals';
import { useTranslation } from 'react-i18next';
import Icon from '@components/icons/Icon';
import { IconName } from '@components/icons/types';
import {
  Heading1,
  Heading3,
  BodyText,
  CaptionText,
} from '@components/common/CustomText';
import { useTheme, createCommonStyles } from '@theme/index';
import { useAuth } from '@context/AuthContext';

const ProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const { user, logout } = useAuth();
  const commonStyles = createCommonStyles(theme);
  const currentLang = i18n.language;
  const isCurrentRTL = currentLang === 'ar';

  const handleLogout = () => {
    setModal({
      variant: 'confirm',
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmLabel: 'Logout',
      onConfirm: async () => {
        try {
          console.log('🔄 Logging out user from Profile...');
          await logout();
          console.log(
            '✅ Logout successful - navigation will happen automatically',
          );
        } catch (error) {
          console.error('❌ Logout error:', error);
          setModal({
            variant: 'error',
            title: 'Error',
            message: 'Failed to logout. Please try again.',
          });
        }
      },
    });
  };

  const handleMenuItemPress = (key: string) => {
    if (key === 'logout') {
      handleLogout();
    } else {
      console.log(`Menu item pressed: ${key}`);
    }
  };

  // Create combined styles with both common and profile-specific styles
  const styles = StyleSheet.create({
    ...commonStyles,
    // Profile-specific styles
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIcon: {
      marginRight: 15,
    },
    rtlIcon: {
      marginRight: 0,
      marginLeft: 15,
    },
    menuItemText: {
      marginLeft: 15,
    },
    avatarContainer: {
      alignSelf: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    roleBadge: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
  });

  const menuItems: Array<{
    key: string;
    title: string;
    icon: IconName;
    color: string;
  }> = [
    {
      key: 'edit',
      title: t('common.edit'),
      icon: 'settings',
      color: '#007AFF',
    },
    {
      key: 'about',
      title: t('navigation.about'),
      icon: 'book',
      color: '#34C759',
    },
    {
      key: 'notifications',
      title: 'Notifications',
      icon: 'bell',
      color: '#FF9500',
    },
    {
      key: 'logout',
      title: t('auth.logout'),
      icon: 'close',
      color: '#FF3B30',
    },
  ];

  return (
    <>
      <ScrollView
        style={[styles.scrollContainer, isCurrentRTL && styles.rtlContainer]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="user" size={60} color={theme.text.link} />
            </View>
          </View>

          <Heading1
            style={[isCurrentRTL && styles.rtlText]}
            color={theme.text.primary}
          >
            {user?.username || 'Guest User'}
          </Heading1>
          <BodyText
            style={[isCurrentRTL && styles.rtlText]}
            color={theme.text.secondary}
          >
            {user?.email || 'guest@example.com'}
          </BodyText>
          {user?.role && (
            <View style={styles.roleBadge}>
              <CaptionText
                style={[isCurrentRTL && styles.rtlText]}
                color={theme.button.primary.text}
              >
                {user.role}
              </CaptionText>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="user" size={20} color={theme.text.primary} />
            <Heading3
              style={[styles.sectionTitle, isCurrentRTL && styles.rtlText]}
              color={theme.text.primary}
            >
              {' '}
              Account Settings
            </Heading3>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.card}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => handleMenuItemPress(item.key)}
            >
              <View style={styles.menuItemLeft}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={item.color}
                  style={[styles.menuIcon, isCurrentRTL && styles.rtlIcon]}
                />
                <BodyText
                  style={[styles.menuItemText, isCurrentRTL && styles.rtlText]}
                  color={theme.text.primary}
                >
                  {item.title}
                </BodyText>
              </View>
              <Icon
                name={isCurrentRTL ? 'arrow-left' : 'arrow-right'}
                size={20}
                color={theme.text.tertiary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </>
  );
};

export default ProfileScreen;
