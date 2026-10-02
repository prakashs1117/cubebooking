import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '@components/common/AppText';
import { AppModal, ModalConfig } from '@components/modals';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useTheme } from '@theme/index';
import { useAuth } from '@context/AuthContext';
import { useMerckTokens } from '@theme/merckTokens';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcHome({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

function IcFeed({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="5" width="18" height="3" rx="1.5" />
      <Rect x="3" y="11" width="18" height="3" rx="1.5" />
      <Rect x="3" y="17" width="12" height="3" rx="1.5" />
    </Svg>
  );
}

function IcCompass({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </Svg>
  );
}

function IcFood({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <Line x1="6" y1="1" x2="6" y2="4" />
      <Line x1="10" y1="1" x2="10" y2="4" />
      <Line x1="14" y1="1" x2="14" y2="4" />
    </Svg>
  );
}

function IcSaved({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function IcSettings({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

function IcPeople({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

function IcFAQ({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </Svg>
  );
}

function IcFeedback({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function IcDashboard({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="7" height="9" rx="2" />
      <Rect x="14" y="3" width="7" height="5" rx="2" />
      <Rect x="14" y="12" width="7" height="9" rx="2" />
      <Rect x="3" y="16" width="7" height="5" rx="2" />
    </Svg>
  );
}

function IcContact({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

function IcProfile({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

function IcLogout({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Svg>
  );
}

function IcComponent({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="7" height="7" rx="1" />
      <Rect x="14" y="3" width="7" height="7" rx="1" />
      <Rect x="3" y="14" width="7" height="7" rx="1" />
      <Rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  Icon: React.FC<{ color: string }>;
  tab?: string;
  screen?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Home',  Icon: IcHome, tab: 'Home' },
      { label: 'Food',  Icon: IcFood, tab: 'Food' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', Icon: IcProfile, tab: 'Profile' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'FAQ',        Icon: IcFAQ,      screen: 'FAQ' },
      { label: 'Contact Us', Icon: IcContact,  screen: 'Contact' },
      { label: 'Feedback',   Icon: IcFeedback, screen: 'Feedback' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const { theme, isDark } = useTheme();
  const T = useMerckTokens();
  const { user, logout } = useAuth();
  const { navigation } = props;
  const [modal, setModal] = useState<ModalConfig | null>(null);

  // Track active tab for highlight
  const state = props.state;
  const activeRouteName = state.routes[state.index]?.name;

  const handlePress = (item: NavItem) => {
    navigation.closeDrawer();
    if (item.tab) {
      (navigation as any).navigate('Tabs', { screen: item.tab });
    } else if (item.screen === 'FAQ' || item.screen === 'Feedback' || item.screen === 'Contact') {
      // These live inside the Home stack as modals
      (navigation as any).navigate('Tabs', {
        screen: 'Home',
        params: { screen: item.screen },
      });
    } else if (item.screen) {
      (navigation as any).navigate(item.screen);
    }
  };

  const handleLogout = () => {
    setModal({
      variant: 'confirm',
      title: 'Log out',
      message: 'Are you sure you want to log out?',
      confirmLabel: 'Log out',
      onConfirm: async () => {
        try { await logout(); } catch {
          setModal({ variant: 'error', title: 'Error', message: 'Failed to log out. Try again.' });
        }
      },
    });
  };

  const userName = user?.name ?? user?.username ?? 'User';
  const userEmail = user?.email ?? '';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const isActive = (item: NavItem) =>
    (item.tab && activeRouteName === 'Tabs') ? false : item.screen === activeRouteName;

  return (
    <View style={[styles.container, { backgroundColor: (theme.background as any).drawer ?? theme.background.secondary }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.brandDot, { backgroundColor: T.green }]} />
          <AppText style={[styles.brandName, { color: theme.text.primary }]}>
            <AppText style={{ fontWeight: '800' }}>Merck</AppText>
            <AppText style={{ fontWeight: '400', color: theme.text.secondary }}>Connect</AppText>
          </AppText>
        </View>

        {/* Nav groups */}
        {NAV_GROUPS.map(group => (
          <View key={group.title} style={styles.group}>
            <AppText style={[styles.groupLabel, { color: theme.text.tertiary ?? theme.text.secondary }]}>
              {group.title}
            </AppText>
            {group.items.map(item => {
              const active = isActive(item);
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.navItem,
                    active && { backgroundColor: T.green + '12' },
                  ]}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.7}
                >
                  {active && <View style={[styles.activeBar, { backgroundColor: T.green }]} />}
                  {/* Bare icon — no box background */}
                  <item.Icon color={active ? T.green : theme.text.secondary} />
                  <AppText style={[
                    styles.navLabel,
                    { color: active ? T.green : theme.text.primary },
                    active && { fontWeight: '600' },
                  ]}>
                    {item.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </DrawerContentScrollView>

      {/* Footer: user + logout */}
      <View style={[styles.footer, { borderTopColor: theme.border.primary, backgroundColor: theme.background.primary }]}>
        <View style={styles.userRow}>
          <View style={[styles.footerAvatar, { backgroundColor: T.green }]}>
            <AppText style={styles.footerAvatarText}>{initials}</AppText>
          </View>
          <View style={styles.footerInfo}>
            <AppText style={[styles.footerName, { color: theme.text.primary }]} numberOfLines={1}>{userName}</AppText>
            <AppText style={[styles.footerEmail, { color: theme.text.secondary }]} numberOfLines={1}>{userEmail}</AppText>
          </View>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IcLogout color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 16 },

  brand: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
  },
  brandDot: { width: 10, height: 10, borderRadius: 5 },
  brandName: { fontSize: 20 },

  group: { paddingHorizontal: 12, marginBottom: 4 },
  groupLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 12, paddingTop: 16, paddingBottom: 4,
  },

  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    height: 44, // fixed 44pt row height
    paddingHorizontal: 12,
    borderRadius: 10, marginVertical: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  activeBar: {
    position: 'absolute', left: 0, top: 8, bottom: 8,
    width: 3, borderRadius: 2,
  },

  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48 },
  footerAvatar: {
    width: 36, height: 36, borderRadius: 18, // circle
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  footerAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footerInfo: { flex: 1 },
  footerName: { fontSize: 13, fontWeight: '600' },
  footerEmail: { fontSize: 11, marginTop: 1 },
  logoutBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default CustomDrawerContent;
