import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useMerckTokens } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing, Radius, Shadow } from '@theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useLocaleStore } from '@stores/localeStore';
import { getCurrentLanguage } from '@localization/i18n';
import { useAuth } from '@context/AuthContext';
import { AppModal, ModalConfig } from '@components/modals';
import AppText from '@components/common/AppText';
import GradientAvatar from '@components/common/GradientAvatar';
import NotificationBell from '@components/notifications/NotificationBell';
import { AvatarGradients } from '@theme/colors';

// ── Language data ──────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English',   flag: '🇬🇧' },
  { code: 'fr', name: 'French',     native: 'Français',  flag: '🇫🇷' },
  { code: 'de', name: 'German',     native: 'Deutsch',   flag: '🇩🇪' },
  { code: 'es', name: 'Spanish',    native: 'Español',   flag: '🇪🇸' },
  { code: 'it', name: 'Italian',    native: 'Italiano',  flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese',    native: '中文',       flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese',   native: '日本語',     flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic',     native: 'العربية',   flag: '🇸🇦' },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const SunIcon       = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const MoonIcon      = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const GlobeIcon     = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 3c-4 4-4 14 0 18M12 3c4 4 4 14 0 18M3 12h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const SmallBellIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" />
  </Svg>
);
const FoodIcon      = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const CalIcon       = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const BookmarkIcon  = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const HistoryIcon   = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 8v4l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3.05 11a9 9 0 1 0 .5-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 3v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ShieldIcon    = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m9 12 2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const DocIcon       = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const CalXIcon      = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" stroke={color} strokeWidth="2" />
    <Path d="M16 2v4M8 2v4M3 8h18M10 12l4 4M14 12l-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const HelpIcon      = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 17h.01" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
const PhoneIcon     = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15.46l-4.73-.43-2.3 2.3a15.05 15.05 0 0 1-6.3-6.3l2.31-2.31L9.54 4H4a17 17 0 0 0 17 17l-.54-5.54z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const LogoutIcon    = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ChevronIcon   = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const EditIcon      = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CheckIcon     = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="m5 12 5 5L20 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CloseIcon     = ({ color }: { color: string }) => (
  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

// ── Section ────────────────────────────────────────────────────────────────────

function Section({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  const T = useMerckTokens();
  return (
    <View style={sec.wrap}>
      <AppText weight="bold" size={11} color={T.tabInactive} style={sec.label}>{label}</AppText>
      <View style={[sec.card, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
        {children}
      </View>
      {note ? <AppText weight="medium" size={FontSize.xs} color={T.tabInactive} style={sec.note}>{note}</AppText> : null}
    </View>
  );
}

const sec = StyleSheet.create({
  wrap:  { marginTop: 20, paddingHorizontal: 16 },
  label: { textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 7, paddingLeft: 2 },
  card:  { borderRadius: 16, borderWidth: 1, overflow: 'hidden', ...Shadow.sm },
  note:  { marginTop: 7, paddingLeft: 4, lineHeight: 17 },
});

// ── Sep ────────────────────────────────────────────────────────────────────────

function Sep() {
  const T = useMerckTokens();
  return <View style={{ height: 1, backgroundColor: T.borderDefault, marginLeft: 54 }} />;
}

// ── Row ────────────────────────────────────────────────────────────────────────

function Row({ iconBg, icon, label, value, right, onPress, danger }: {
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const T = useMerckTokens();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={rowS.wrap}>
      <View style={[rowS.pill, { backgroundColor: iconBg }]}>{icon}</View>
      <AppText weight="semibold" size={FontSize.md} color={danger ? T.error : T.headerText} style={{ flex: 1 }}>
        {label}
      </AppText>
      {value !== undefined && (
        <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={{ marginRight: 6, maxWidth: 140, textAlign: 'right' }}>
          {value}
        </AppText>
      )}
      {right !== undefined ? right : onPress ? <ChevronIcon color={T.tabInactive} /> : null}
    </TouchableOpacity>
  );
}

const rowS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 12, minHeight: 50 },
  pill: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

// ── ThemeToggle ────────────────────────────────────────────────────────────────

function ThemeToggle({ current, onChange }: { current: 'light' | 'dark'; onChange: (m: 'light' | 'dark') => void }) {
  const T = useMerckTokens();
  return (
    <View style={tt.wrap}>
      {(['light', 'dark'] as const).map(mode => {
        const active = current === mode;
        return (
          <TouchableOpacity
            key={mode}
            onPress={() => onChange(mode)}
            activeOpacity={0.8}
            style={[tt.btn, { backgroundColor: active ? T.green : T.bgSurface, borderColor: active ? T.green : T.borderDefault }]}
          >
            {mode === 'light'
              ? <SunIcon  color={active ? T.bgApp : T.tabInactive} />
              : <MoonIcon color={active ? T.bgApp : T.tabInactive} />}
            <AppText weight="bold" size={FontSize.xs} color={active ? T.bgApp : T.tabInactive}>
              {mode === 'light' ? 'Light' : 'Dark'}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tt = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8, flex: 1, justifyContent: 'flex-end' },
  btn:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
});

// ── LanguageSheet ──────────────────────────────────────────────────────────────

function LanguageSheet({ visible, current, onSelect, onClose }: {
  visible: boolean; current: string; onSelect: (code: string) => void; onClose: () => void;
}) {
  const T = useMerckTokens();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} onPress={onClose} />
      <View style={[ls.sheet, { backgroundColor: T.bgCard, borderColor: T.borderDefault }]}>
        <View style={[ls.handle, { backgroundColor: T.borderMuted }]} />
        <View style={ls.hRow}>
          <AppText weight="bold" size={FontSize['2xl']} color={T.headerText}>Language</AppText>
          <TouchableOpacity onPress={onClose} style={[ls.closeBtn, { backgroundColor: T.bgSurface }]}>
            <CloseIcon color={T.tabInactive} />
          </TouchableOpacity>
        </View>
        <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} style={ls.sub}>
          Choose your preferred display language
        </AppText>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
          {LANGUAGES.map((lang, idx) => {
            const sel = current === lang.code;
            return (
              <React.Fragment key={lang.code}>
                <TouchableOpacity onPress={() => onSelect(lang.code)} style={ls.row} activeOpacity={0.75}>
                  <Text style={ls.flag}>{lang.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <AppText weight="semibold" size={FontSize.md} color={sel ? T.green : T.headerText}>{lang.native}</AppText>
                    <AppText weight="medium" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 1 }}>{lang.name}</AppText>
                  </View>
                  {lang.code === 'ar' && (
                    <View style={[ls.rtl, { backgroundColor: T.accentAmber + '22', borderColor: T.accentAmber + '50' }]}>
                      <AppText weight="bold" size={10} color={T.accentAmber}>RTL</AppText>
                    </View>
                  )}
                  {sel && <CheckIcon color={T.green} />}
                </TouchableOpacity>
                {idx < LANGUAGES.length - 1 && (
                  <View style={{ height: 1, backgroundColor: T.borderDefault, marginLeft: 52 }} />
                )}
              </React.Fragment>
            );
          })}
          <View style={{ height: 28 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const ls = StyleSheet.create({
  sheet:    { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%', borderTopWidth: 1 },
  handle:   { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 2 },
  hRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sub:      { paddingHorizontal: 20, paddingBottom: 12 },
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 4, gap: 13 },
  flag:     { fontSize: 24, width: 32, textAlign: 'center' },
  rtl:      { borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
});

// ── StatPill ───────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string | number }) {
  const T = useMerckTokens();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <AppText weight="bold" size={FontSize['2xl']} color={T.headerText}>{value}</AppText>
      <AppText weight="medium" size={FontSize.xs} color={T.tabInactive} align="center">{label}</AppText>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

const ProfileScreenMobile: React.FC = () => {
  const T = useMerckTokens();
  const navigation = useNavigation<any>();
  const { themeMode, setTheme, isDark } = useTheme();
  const { language, setLanguage } = useLocaleStore();
  const { logout } = useAuth();

  const [langSheetVisible, setLangSheetVisible] = useState(false);
  const [pushEnabled,  setPushEnabled]  = useState(true);
  const [foodEnabled,  setFoodEnabled]  = useState(true);
  const [eventEnabled, setEventEnabled] = useState(true);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const currentLang = LANGUAGES.find(l => l.code === (language || getCurrentLanguage()));
  const langLabel   = currentLang ? `${currentLang.flag}  ${currentLang.native}` : '🇬🇧  English';

  const handleLanguageSelect = (code: string) => {
    setLangSheetVisible(false);
    setLanguage(code);
  };

  const handleSignOut = () => {
    setModal({
      variant: 'confirm',
      title: 'Sign out',
      message: 'Are you sure you want to sign out?',
      confirmLabel: 'Sign out',
      onConfirm: async () => {
        try { await logout(); } catch {
          setModal({ variant: 'error', title: 'Error', message: 'Failed to sign out. Try again.' });
        }
      },
    });
  };

  const switchProps = (value: boolean, onChange: (v: boolean) => void) => ({
    value,
    onValueChange: onChange,
    trackColor: { false: T.borderDefault, true: T.green + '99' },
    thumbColor: value ? T.green : T.tabInactive,
    ios_backgroundColor: T.borderDefault,
  });

  return (
    <View style={{ flex: 1, backgroundColor: T.bgApp }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={T.headerBackground}
      />

      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: T.headerBackground }}>
        <View style={[hdr.wrap, { borderBottomColor: T.borderDefault, backgroundColor: T.headerBackground }]}>
          <AppText weight="bold" size={FontSize['2xl']} color={T.headerText} style={{ flex: 1 }}>Profile</AppText>
          <NotificationBell color={T.headerText} size={22} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Hero banner ── */}
        <LinearGradient
          colors={AvatarGradients[0]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={banner.wrap}
        >
          <GradientAvatar initials="JR" gradientIndex={1} size={64} style={banner.avatar} />
          <AppText weight="bold"    size={FontSize['3xl']} color="#fff" align="center" style={{ marginBottom: 3 }}>
            James Rivera
          </AppText>
          <AppText weight="medium"  size={FontSize.md}    color="rgba(255,255,255,0.85)" align="center" style={{ marginBottom: 2 }}>
            Senior Research Scientist · R&amp;D
          </AppText>
          <AppText weight="regular" size={FontSize.sm}    color="rgba(255,255,255,0.6)"  align="center">
            Darmstadt, Germany · Joined 2019
          </AppText>
          <TouchableOpacity style={banner.editBtn} activeOpacity={0.8}>
            <EditIcon color="#fff" />
            <AppText weight="semibold" size={FontSize.xs} color="#fff">Edit Profile</AppText>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Stats row ── */}
        <View style={[stats.row, { backgroundColor: T.cardBackground, borderBottomColor: T.borderDefault }]}>
          <StatPill label="Events joined" value={12} />
          <View style={[stats.divider, { backgroundColor: T.borderDefault }]} />
          <StatPill label="Connections" value="248" />
          <View style={[stats.divider, { backgroundColor: T.borderDefault }]} />
          <StatPill label="Meals ordered" value={23} />
        </View>

        {/* ── Appearance ── */}
        <Section label="Appearance">
          <Row
            iconBg={isDark ? '#2A3B6A' : '#FFF3CD'}
            icon={isDark ? <MoonIcon color="#93C5FD" /> : <SunIcon color="#F59E0B" />}
            label="Theme"
            right={<ThemeToggle current={themeMode} onChange={setTheme} />}
          />
        </Section>

        {/* ── Language ── */}
        <Section label="Language & Region" note="Switching to Arabic restarts the app to apply right-to-left layout.">
          <Row
            iconBg="#1A3A2A"
            icon={<GlobeIcon color={T.green} />}
            label="Language"
            value={langLabel}
            onPress={() => setLangSheetVisible(true)}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section label="Notifications">
          <Row
            iconBg="#1E2D4A"
            icon={<SmallBellIcon color="#60A5FA" />}
            label="Push notifications"
            right={<Switch {...switchProps(pushEnabled, setPushEnabled)} />}
          />
          <Sep />
          <Row
            iconBg="#1A3A2A"
            icon={<FoodIcon color={T.green} />}
            label="Food order alerts"
            right={<Switch {...switchProps(foodEnabled, setFoodEnabled)} />}
          />
          <Sep />
          <Row
            iconBg="#2A2A1A"
            icon={<CalIcon color={T.accentAmber} />}
            label="Event reminders"
            right={<Switch {...switchProps(eventEnabled, setEventEnabled)} />}
          />
        </Section>

        {/* ── Account ── */}
        <Section label="Account">
          <Row
            iconBg="#1A2A3A"
            icon={<BookmarkIcon color="#60A5FA" />}
            label="Saved Items"
            onPress={() => navigation.navigate('Saved' as never)}
          />
          <Sep />
          <Row
            iconBg="#1A3A2A"
            icon={<HistoryIcon color={T.green} />}
            label="Food Order History"
            onPress={() => (navigation as any).navigate('Food', { screen: 'AllOrders' })}
          />
        </Section>

        {/* ── Legal ── */}
        <Section label="Legal">
          <Row
            iconBg="#1A3A2A"
            icon={<ShieldIcon color={T.green} />}
            label="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          />
          <Sep />
          <Row
            iconBg="#1E2D4A"
            icon={<DocIcon color="#60A5FA" />}
            label="Terms &amp; Conditions"
            onPress={() => navigation.navigate('Terms' as never)}
          />
          <Sep />
          <Row
            iconBg="#2A2A1A"
            icon={<CalXIcon color={T.accentAmber} />}
            label="Cancellation Policy"
            onPress={() => navigation.navigate('CancellationPolicy' as never)}
          />
        </Section>

        {/* ── Support ── */}
        <Section label="Support">
          <Row
            iconBg="#2A1A3A"
            icon={<HelpIcon color="#C084FC" />}
            label="FAQ"
            onPress={() => navigation.navigate('FAQ' as never)}
          />
          <Sep />
          <Row
            iconBg="#1E2D4A"
            icon={<PhoneIcon color="#60A5FA" />}
            label="Contact Us"
            onPress={() => navigation.navigate('Contact' as never)}
          />
        </Section>

        {/* ── Session ── */}
        <Section label="Session">
          <Row
            iconBg="rgba(229,72,77,0.15)"
            icon={<LogoutIcon color={T.error} />}
            label="Sign out"
            danger
            onPress={handleSignOut}
          />
        </Section>

        {/* ── Footer ── */}
        <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
          <AppText weight="medium" size={FontSize.xs} color={T.tabInactive}>
            v1.0.0 · Build 42
          </AppText>
        </View>
      </ScrollView>

      <LanguageSheet
        visible={langSheetVisible}
        current={language || getCurrentLanguage()}
        onSelect={handleLanguageSelect}
        onClose={() => setLangSheetVisible(false)}
      />
      <AppModal config={modal} onClose={() => setModal(null)} />
    </View>
  );
};

export default ProfileScreenMobile;

// ── Styles ─────────────────────────────────────────────────────────────────────

const hdr = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

const banner = StyleSheet.create({
  wrap:    { alignItems: 'center', paddingTop: 36, paddingBottom: 24, paddingHorizontal: Spacing.lg, minHeight: 190, position: 'relative' },
  avatar:  { borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)', marginBottom: 12 },
  editBtn: {
    position: 'absolute', bottom: 14, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.pill ?? 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
});

const stats = StyleSheet.create({
  row:     { flexDirection: 'row', paddingVertical: Spacing.lg, borderBottomWidth: 1 },
  divider: { width: 1, marginVertical: 4 },
});
