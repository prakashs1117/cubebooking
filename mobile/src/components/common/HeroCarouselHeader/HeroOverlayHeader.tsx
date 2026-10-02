import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import { useNotificationStore } from '@stores/notificationStore';
import Icon from '@components/icons/Icon';
import SearchModal from '@components/common/SearchModal';
import NotificationModal from '@components/notifications/NotificationModal';

const { height: SH } = Dimensions.get('window');

const { fontFamily: h4FontFamily } = getFontStyle('h4');
const { fontFamily: captionFontFamily } = getFontStyle('caption');

interface Props {
  title: string;
  showHamburger?: boolean;
  onMenuPress?: () => void;
  /**
   * Reanimated shared value from the parent ScrollView's onScroll handler.
   * When provided, the header background fades in as the user scrolls past the hero.
   */
  scrollY?: SharedValue<number>;
  /**
   * The scroll Y at which the background reaches full opacity.
   * Defaults to half the screen height (matches 'half' heroHeight).
   */
  fadeThreshold?: number;
}

const HeroOverlayHeader: React.FC<Props> = ({
  title,
  showHamburger = false,
  onMenuPress,
  scrollY,
  fadeThreshold = Math.round(SH * 0.5),
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const navigation = useNavigation<any>();

  const [searchVisible, setSearchVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

  const isRTL = i18n.language === 'ar';
  const headerPaddingTop = insets.top + (Platform.OS === 'android' ? 6 : 10);

  const showSearch = useFeatureFlagsStore(s =>
    s.isFeatureEnabled('ENABLE_HEADER_SEARCH'),
  );
  const showNotifications = useFeatureFlagsStore(s =>
    s.isFeatureEnabled('ENABLE_HEADER_NOTIFICATIONS'),
  );
  const showProfile = useFeatureFlagsStore(s =>
    s.isFeatureEnabled('ENABLE_HEADER_PROFILE'),
  );
  const unreadCount = useNotificationStore(s => s.unreadCount);

  const handleEventSelect = useCallback(
    (slug: string) => {
      setSearchVisible(false);
      try {
        navigation.navigate('Events', {
          screen: 'EventDetail',
          params: { slug },
        });
      } catch {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Events',
            params: { screen: 'EventDetail', params: { slug } },
          }),
        );
      }
    },
    [navigation],
  );

  // Fade background in as user scrolls past the hero
  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scrollY
      ? interpolate(
          scrollY.value,
          [0, fadeThreshold * 0.5, fadeThreshold],
          [0, 0, 1],
          Extrapolation.CLAMP,
        )
      : 0,
  }));

  return (
    <>
      <View style={styles.container} pointerEvents="box-none">
        {/* Animated background layer — fades in on scroll */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.bg, bgAnimatedStyle]}
        />

        {/* Header content row */}
        <View
          style={[
            styles.row,
            {
              paddingTop: headerPaddingTop,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Left — hamburger */}
          <View style={[styles.side, isRTL && styles.sideReverse]}>
            {showHamburger && onMenuPress && (
              <TouchableOpacity
                style={styles.btn}
                onPress={onMenuPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name={isDark ? 'hamburger-outline' : 'hamburger'}
                  size={24}
                  color="#ffffff"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Centre — title */}
          <View style={styles.center}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Right — search / notifications / profile */}
          <View
            style={[styles.side, styles.sideRight, isRTL && styles.sideReverse]}
          >
            {showSearch && (
              <TouchableOpacity
                style={styles.btn}
                onPress={() => setSearchVisible(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="search" size={24} color="#ffffff" />
              </TouchableOpacity>
            )}

            {showNotifications && (
              <TouchableOpacity
                style={styles.btn}
                onPress={() => setNotificationVisible(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View>
                  <Icon name="bell-outline" size={28} color="#ffffff" />
                  {unreadCount > 0 && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: theme.button.error.background },
                      ]}
                    >
                      <Text style={styles.badgeCount}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}

            {showProfile && (
              <TouchableOpacity
                style={styles.btn}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="profile" size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSearch={query => console.log('Hero search:', query)}
        onEventSelect={handleEventSelect}
      />
      <NotificationModal
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bg: {
    backgroundColor: 'rgba(10, 10, 10, 0.82)',
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    height: 40,
  },
  sideReverse: { flexDirection: 'row-reverse' },
  sideRight: { justifyContent: 'flex-end', gap: 4 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontFamily: h4FontFamily,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeCount: {
    color: '#ffffff',
    fontFamily: captionFontFamily,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default HeroOverlayHeader;
