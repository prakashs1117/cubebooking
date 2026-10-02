import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Svg, { Path, Line } from 'react-native-svg';
import { useMerckTokens } from '@theme/merckTokens';
import { useTheme } from '@/theme/ThemeContext';
import { FontSize } from '@theme/typography';
import AppText from '@components/common/AppText';
import NotificationBell from '@components/notifications/NotificationBell';

function HamburgerIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <Line x1="3" y1="18" x2="15" y2="18" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </Svg>
  );
}

interface MerckHeaderProps {
  title: string;
  showNotification?: boolean;
  rightElement?: React.ReactNode;
  // Legacy — ignored, kept for call-site compatibility
  hasNotificationBadge?: boolean;
  onNotificationPress?: () => void;
}

export default function MerckHeader({
  title,
  showNotification = true,
  rightElement,
}: MerckHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const T = useMerckTokens();
  const { isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + 4,
        backgroundColor: T.headerBackground,
        borderBottomColor: T.borderDefault,
      },
    ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={T.headerBackground}
      />

      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        style={styles.iconBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <HamburgerIcon color={T.headerText} />
      </TouchableOpacity>

      <AppText
        weight="semibold"
        size={FontSize['2xl']}
        color={T.headerText}
        align="center"
        letterSpacing={0.1}
        style={{ flex: 1 }}
        numberOfLines={1}
      >
        {title}
      </AppText>

      <View style={styles.rightSlot}>
        {rightElement ?? (showNotification && (
          <NotificationBell color={T.headerText} size={22} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    minHeight: 56 + (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0),
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  rightSlot: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',      // badge allowed to extend outside the slot
  },
});
