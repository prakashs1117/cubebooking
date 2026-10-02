import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AppText from '@components/common/AppText';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Rect, Polygon } from 'react-native-svg';
import { useMerckTokens } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';


// ─── Tab Icons ───────────────────────────────────────────────────────────────

function HomeIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M9 21V13h6v8"
        stroke={filled ? 'rgba(17,32,26,0.5)' : color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CalendarIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3" y="4" width="18" height="17" rx="2"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.7}
      />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={filled ? 'rgba(17,32,26,0.4)' : color} strokeWidth="1.6" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="8" cy="13" r="1.2" fill={filled ? 'rgba(17,32,26,0.6)' : color} />
      <Circle cx="12" cy="13" r="1.2" fill={filled ? 'rgba(17,32,26,0.6)' : color} />
      <Circle cx="16" cy="13" r="1.2" fill={filled ? 'rgba(17,32,26,0.6)' : color} />
    </Svg>
  );
}

function PeopleIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3.5" fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 1.7} />
      <Path
        d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6"
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <Circle cx="18" cy="8" r="2.5" fill="none" stroke={color} strokeWidth="1.5" />
      <Path d="M21 20c0-2.5-1.8-4.5-4.5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function CompassIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 1.7} />
      <Polygon
        points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        fill={filled ? 'rgba(17,32,26,0.5)' : 'none'}
        stroke={filled ? 'rgba(17,32,26,0.5)' : color}
        strokeWidth="1.2"
      />
    </Svg>
  );
}

function FoodIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8h1a4 4 0 0 1 0 8h-1"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" fill="none"
      />
      <Path
        d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"
        stroke={color} strokeWidth="1.7"
        fill={filled ? color : 'none'}
      />
      <Line x1="6" y1="1" x2="6" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="10" y1="1" x2="10" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="14" y1="1" x2="14" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function VendorIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1.5"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.7}
      />
      <Rect x="14" y="3" width="7" height="7" rx="1.5"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.7}
      />
      <Rect x="3" y="14" width="7" height="7" rx="1.5"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.7}
      />
      <Path
        d="M14 14h3v3M21 14v7h-7v-3M17 21h1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ProfileIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 1.7} />
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Badge Pill ───────────────────────────────────────────────────────────────

function BadgePill({ value }: { value: string | number }) {
  const T = useMerckTokens();
  const isNew = value === 'New';
  return (
    <View style={[styles.badge, { backgroundColor: isNew ? T.accentAmber : T.tabActive }]}>
      <AppText style={[styles.badgeText, { color: T.bgApp }]}>
        {value}
      </AppText>
    </View>
  );
}

// ─── Animated Tab Item ────────────────────────────────────────────────────────

function TabItem({
  label,
  focused,
  onPress,
  icon,
  badge,
  activeColor,
  inactiveColor,
}: {
  label: string;
  focused: boolean;
  onPress: () => void;
  icon: (focused: boolean) => React.ReactNode;
  badge?: string | number;
  activeColor: string;
  inactiveColor: string;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.88, { damping: 12, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    onPress();
  };

  const color = focused ? activeColor : inactiveColor;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconWrapper, animStyle]}>
        <View style={styles.iconContainer}>
          {icon(focused)}
          {badge !== undefined && <BadgePill value={badge} />}
        </View>
        <AppText style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </AppText>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

const BADGE_MAP: Record<string, string | number> = {};

const TAB_ICONS: Record<string, (focused: boolean, activeColor: string, inactiveColor: string) => React.ReactNode> = {
  Home:    (f, a, i) => <HomeIcon    color={f ? a : i} filled={f} />,
  Food:    (f, a, i) => <FoodIcon    color={f ? a : i} filled={f} />,
  Profile: (f, a, i) => <ProfileIcon color={f ? a : i} filled={f} />,
  Vendor:  (f, a, i) => <VendorIcon  color={f ? a : i} filled={f} />,
};

const TAB_LABELS: Record<string, string> = {
  Home:    'Home',
  Food:    'Food',
  Profile: 'Profile',
  Vendor:  'Vendor',
};

export default function MerckTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const T = useMerckTokens();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: T.tabBackground }]}>
      <View style={[styles.border, { backgroundColor: T.tabBorder }]} />
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = TAB_LABELS[route.name] ?? route.name;
        const iconRenderer = TAB_ICONS[route.name];
        const badge = BADGE_MAP[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconFn = iconRenderer
          ? (f: boolean) => iconRenderer(f, T.tabActive, T.tabInactive)
          : () => null;

        return (
          <TabItem
            key={route.key}
            label={label}
            focused={focused}
            onPress={onPress}
            icon={iconFn}
            badge={badge}
            activeColor={T.tabActive}
            inactiveColor={T.tabInactive}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.1,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    lineHeight: 12,
  },
});
