import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import SearchModal from '@components/common/SearchModal';
import NotificationBell from '@components/notifications/NotificationBell';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

interface CustomHeaderProps {
  title?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onFAQPress?: () => void;
  showHamburger?: boolean;
  onHamburgerPress?: () => void;
  hideSearch?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  leftIcon?: React.ReactNode;
  /** 'merck' renders MerckConnect green header with two-colour "MerckConnect" logo */
  variant?: 'default' | 'merck';
}

/**
 * CustomHeader Component
 * Displays header with optional hamburger menu, title, search, notifications, and profile icons
 * Icons visibility controlled by feature flags
 */
const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  onProfilePress,
  onNotificationPress,
  onSearchPress,
  showHamburger = false,
  onHamburgerPress,
  hideSearch = false,
  showBack = false,
  onBackPress,
  leftIcon,
  variant = 'default',
}) => {
  const { theme, isDark } = useTheme();
  const { i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const [searchVisible, setSearchVisible] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Feature flags
  const showSearch = useFeatureFlagsStore(state =>
    state.isFeatureEnabled('ENABLE_HEADER_SEARCH'),
  );
  const showProfile = useFeatureFlagsStore(state =>
    state.isFeatureEnabled('ENABLE_HEADER_PROFILE'),
  );

  const handleSearchPress = () => {
    setSearchVisible(true);
    onSearchPress?.();
  };

  const handleProfilePress = () => {
    console.log('Profile pressed');
    onProfilePress?.();
  };

  const handleEventSelect = (slug: string) => {
    console.log('🔍 CustomHeader: Handling event selection with slug:', slug);

    try {
      // Try nested navigation to Events tab -> EventDetail screen
      navigation.navigate('Events', {
        screen: 'EventDetail',
        params: { slug },
      });
      console.log('✅ CustomHeader: Navigation successful');
    } catch (error) {
      console.error(
        '❌ CustomHeader: Navigation failed, trying dispatch:',
        error,
      );

      // Try using dispatch with CommonActions
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Events',
            params: {
              screen: 'EventDetail',
              params: { slug },
            },
          }),
        );
        console.log('✅ CustomHeader: Dispatch navigation successful');
      } catch (dispatchError) {
        console.error(
          '❌ CustomHeader: All navigation methods failed:',
          dispatchError,
        );
      }
    }
  };

  const isMerck = variant === 'merck';
  const iconColor = isMerck ? theme.text.primary : '#FFFFFF';
  const headerBg = isMerck ? 'transparent' : BaseColors.merckPurple;

  const styles = getStyles(theme, isRTL, isDark, headerBg, isMerck);

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.container}>
          {/* Left side - Back, Hamburger, or custom icon */}
          <View style={styles.leftSection}>
            {showBack && (
              <TouchableOpacity
                onPress={onBackPress ?? (() => navigation.goBack())}
                style={styles.iconButton}
              >
                <Icon name="back-circle" size={28} color={iconColor} />
              </TouchableOpacity>
            )}
            {!showBack && showHamburger && onHamburgerPress && (
              <TouchableOpacity
                onPress={onHamburgerPress}
                style={styles.iconButton}
              >
                <Icon
                  name={isDark ? 'hamburger-outline' : 'hamburger'}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
            )}
            {!showBack && !showHamburger && leftIcon}
          </View>

          {/* Center - Title or MerckConnect logo */}
          <View style={styles.centerSection}>
            {isMerck ? (
              <Text style={styles.merckLogo} numberOfLines={1}>
                <Text style={styles.merckLogoMerck}>Merck</Text>
                <Text style={styles.merckLogoConnect}>Connect</Text>
              </Text>
            ) : title ? (
              <Text
                style={[
                  styles.title,
                  {
                    color: iconColor,
                    fontFamily: getFontStyle('h4').fontFamily,
                  },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : null}
          </View>

          {/* Right side - Action icons */}
          <View style={styles.rightSection}>
            {showSearch && !hideSearch && (
              <TouchableOpacity
                onPress={handleSearchPress}
                style={styles.iconButton}
              >
                <Icon name="header-search" size={24} />
              </TouchableOpacity>
            )}

            <NotificationBell color={iconColor} size={24} />

            {showProfile && (
              <TouchableOpacity
                onPress={handleProfilePress}
                style={styles.iconButton}
              >
                <Icon name="profile" size={24} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Search Modal */}
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSearch={query => console.log('Search query:', query)}
        onEventSelect={handleEventSelect}
      />

    </>
  );
};

const getStyles = (theme: any, isRTL: boolean, isDark: boolean, headerBg: string, isMerck: boolean) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: headerBg,
      borderBottomWidth: 0,
    },
    container: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    leftSection: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      minWidth: 48,
      height: 40,
      overflow: 'visible',
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    rightSection: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 0,
      minWidth: 48,
      height: 40,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bellWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    merckLogo: {
      fontSize: 18,
      letterSpacing: -0.3,
    },
    merckLogoMerck: {
      color: isMerck ? theme.text.primary : '#FFFFFF',
      fontWeight: '800',
    },
    merckLogoConnect: {
      color: isMerck ? theme.text.secondary : 'rgba(255,255,255,0.75)',
      fontWeight: '400',
    },
  });

export default CustomHeader;
