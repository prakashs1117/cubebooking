import React, { useState, ReactNode, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import AppModal, { type ModalConfig } from '@components/modals/AppModal';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { getFontStyle } from '@utils/fonts';
import { useAuth } from '@context/AuthContext';
import Icon from '@components/icons/Icon';
import type { IconName } from '@components/icons/types';
import FeedbackIcon from '@components/icons/FeedbackIcon';
import { BodyText, CaptionText, Heading3 } from '@components/common/CustomText';
import CustomButton from '@components/common/CustomButton';
import type { MoreStackParamList } from '@/types/navigation';
import type { User } from '@/types/auth.types';
import type { ThemeColors } from '@theme/colors';
import type { ViewStyle } from 'react-native';
import LanguageSelectorModal from '@components/modals/LanguageSelectorModal';
import { changeLanguage, getCurrentLanguage } from '@localization/i18n';
import { showInfo } from '@utils/toast';
import { CustomToggle } from '@components/common/CustomToggle';

type MoreListScreenNavigationProp = StackNavigationProp<
  MoreStackParamList,
  'MoreList'
>;

// ─── ProfileRow ──────────────────────────────────────────────────────────────

interface ProfileRowProps {
  user: User;
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
  theme: ThemeColors;
}

const ProfileRow: React.FC<ProfileRowProps> = ({
  user,
  onPress,
  styles,
  theme,
}) => {
  const nameParts = (user.name ?? '').trim().split(' ');
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : (nameParts[0]?.[0] ?? '?').toUpperCase();
  const displayRole = user.position ?? null;

  return (
    <TouchableOpacity
      style={[styles.profileCard, { backgroundColor: theme.background.card }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.avatarCircle}>
        <Heading3 style={styles.avatarInitials}>{initials}</Heading3>
      </View>

      <View style={styles.profileInfo}>
        <BodyText
          style={[styles.profileName, { color: theme.text.primary }]}
          numberOfLines={1}
        >
          {user.name}
        </BodyText>

        {displayRole ? (
          <View style={styles.roleBadge}>
            <CaptionText style={styles.roleBadgeText}>
              ● {displayRole}
            </CaptionText>
          </View>
        ) : null}

        {user.email ? (
          <View style={styles.profileEmailRow}>
            <Icon name="mail-outline" size={12} color={theme.text.tertiary} />
            <CaptionText
              style={[styles.profileEmail, { color: theme.text.tertiary }]}
              numberOfLines={1}
            >
              {user.email}
            </CaptionText>
          </View>
        ) : null}
      </View>

      <Icon name="chevron-right" size={20} color={theme.text.tertiary} />
    </TouchableOpacity>
  );
};

// ─── GuestBanner ─────────────────────────────────────────────────────────────

interface GuestBannerProps {
  onSignIn: () => void;
  onSignUp: () => void;
  styles: ReturnType<typeof getStyles>;
  t: (key: string) => string;
}

const GuestBanner: React.FC<GuestBannerProps> = ({
  onSignIn,
  onSignUp,
  styles,
  t,
}) => (
  <View style={styles.guestCard}>
    <View style={styles.guestIconRow}>
      <Image
        source={require('@assets/images/home-logo.png')}
        style={styles.guestLogo}
        resizeMode="contain"
      />
      <Heading3 style={[styles.guestTitle,styles.guestHeaderTitle ]}>{t('auth.welcomeToMySafety')}</Heading3>
    </View>
    <CaptionText style={styles.guestSubtitle}>
      {t('more.guestSubtitle')}
    </CaptionText>
    <View style={styles.guestButtons}>
      <CustomButton
        title={t('auth.signIn')}
        onPress={onSignIn}
        variant="primary"
        size="medium"
        containerStyle={styles.guestBtn}
        textStyle={styles.guestSignInText}
      />
      <CustomButton
        title={t('auth.createAccount')}
        onPress={onSignUp}
        variant="outline"
        size="medium"
        containerStyle={
          StyleSheet.flatten([
            styles.guestBtn,
            styles.guestOutlineBtn,
          ]) as ViewStyle
        }
        textStyle={styles.guestOutlineText}
      />
    </View>
  </View>
);

// ─── QuickTabsRow ─────────────────────────────────────────────────────────────

interface QuickTabsRowProps {
  onAboutPress: () => void;
  onFAQPress: () => void;
  onSettingsPress: () => void;
  styles: ReturnType<typeof getStyles>;
  theme: ThemeColors;
  t: (key: string) => string;
}

const QuickTabsRow: React.FC<QuickTabsRowProps> = ({
  onAboutPress,
  onFAQPress,
  onSettingsPress,
  styles,
  theme,
  t,
}) => {
  const tabs: { icon: IconName; label: string; onPress: () => void }[] = [
    {
      icon: 'info-circle',
      label: t('navigation.about'),
      onPress: onAboutPress,
    },
    { icon: 'info', label: t('navigation.faq'), onPress: onFAQPress },
    {
      icon: 'settings-outline',
      label: t('navigation.settings'),
      onPress: onSettingsPress,
    },
  ];

  return (
    <View style={styles.quickTabsRow}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.label}
          style={[
            styles.quickTab,
            { backgroundColor: theme.background.secondary },
          ]}
          onPress={tab.onPress}
          activeOpacity={0.7}
        >
          <Icon name={tab.icon} size={20} color={theme.text.secondary} />
          <CaptionText
            style={[styles.quickTabLabel, { color: theme.text.secondary }]}
          >
            {tab.label}
          </CaptionText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── SectionGroup ─────────────────────────────────────────────────────────────

interface SectionGroupProps {
  children: React.ReactNode;
  styles: ReturnType<typeof getStyles>;
  theme: ThemeColors;
}

const SectionGroup: React.FC<SectionGroupProps> = React.memo(({
  children,
  styles,
  theme,
}) => (
  <View
    style={[
      styles.sectionGroup,
      {
        backgroundColor: theme.background.card,
        borderColor: theme.border.secondary,
      },
    ]}
  >
    {children}
  </View>
));

// ─── SettingsRow ──────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon?: IconName;
  iconBg?: string;
  iconTint?: string;
  customIcon?: ReactNode;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  valueLabel?: string;
  styles: ReturnType<typeof getStyles>;
  theme: ThemeColors;
}

const SettingsRow: React.FC<SettingsRowProps> = React.memo(({
  icon,
  iconBg,
  iconTint,
  customIcon,
  label,
  onPress,
  isLast,
  valueLabel,
  styles,
  theme,
}) => (
  <TouchableOpacity
    style={[
      styles.settingsRow,
      !isLast && {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.border.secondary,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.65}
  >
    <View
      style={[
        styles.rowIconContainer,
        { backgroundColor: iconBg ?? theme.background.secondary },
      ]}
    >
      {customIcon ? (
        customIcon
      ) : (
        <Icon name={icon!} size={18} color={iconTint ?? theme.text.secondary} />
      )}
    </View>

    <BodyText
      style={[styles.rowLabel, { color: theme.text.primary }]}
      numberOfLines={1}
    >
      {label}
    </BodyText>

    <View style={styles.rowRight}>
      {valueLabel ? (
        <CaptionText style={[styles.rowValue, { color: theme.text.tertiary }]}>
          {valueLabel}
        </CaptionText>
      ) : null}
      <Icon name="chevron-right" size={16} color={theme.text.tertiary} />
    </View>
  </TouchableOpacity>
));

// ─── ToggleRow ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  icon: IconName;
  iconBg?: string;
  iconTint?: string;
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  isLast?: boolean;
  styles: ReturnType<typeof getStyles>;
  theme: ThemeColors;
}

const ToggleRow: React.FC<ToggleRowProps> = React.memo(({
  icon,
  iconBg,
  iconTint,
  label,
  value,
  onToggle,
  isLast,
  styles,
  theme,
}) => (
  <View
    style={[
      styles.settingsRow,
      !isLast && {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.border.secondary,
      },
    ]}
  >
    <View
      style={[
        styles.rowIconContainer,
        { backgroundColor: iconBg ?? theme.background.secondary },
      ]}
    >
      <Icon name={icon} size={22} color={iconTint ?? theme.text.secondary} />
    </View>

    <BodyText
      style={[styles.rowLabel, { color: theme.text.primary }]}
      numberOfLines={1}
    >
      {label}
    </BodyText>

    <CustomToggle
      value={value}
      onValueChange={onToggle}
      size={56}
    />
  </View>
));

// ─── LogoutRow ────────────────────────────────────────────────────────────────

interface LogoutRowProps {
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
  theme: ThemeColors;
  t: (key: string) => string;
}

const LogoutRow: React.FC<LogoutRowProps> = ({ onPress, styles, theme, t }) => (
  <View
    style={[
      styles.sectionGroup,
      {
        backgroundColor: theme.background.card,
        borderColor: theme.border.secondary,
      },
    ]}
  >
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View
        style={[
          styles.rowIconContainer,
          { backgroundColor: theme.button.error.background + '18' },
        ]}
      >
        <Icon name="logout" size={18} color={theme.button.error.background} />
      </View>
      <BodyText
        style={[styles.rowLabel, { color: theme.button.error.background }]}
      >
        {t('auth.logout')}
      </BodyText>
    </TouchableOpacity>
  </View>
);

// ─── SectionLabel ─────────────────────────────────────────────────────────────

interface SectionLabelProps {
  title: string;
  styles: ReturnType<typeof getStyles>;
  theme: ThemeColors;
}

const SectionLabel: React.FC<SectionLabelProps> = ({
  title,
  styles,
  theme,
}) => (
  <CaptionText style={[styles.sectionLabel, { color: theme.text.tertiary }]}>
    {title.toUpperCase()}
  </CaptionText>
);

// ─── MoreListScreen ───────────────────────────────────────────────────────────

const MoreListScreen: React.FC = () => {
  const { user, isGuest, logout, exitGuestMode } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MoreListScreenNavigationProp>();
  const [_editModalVisible, setEditModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const isLoggedIn = !isGuest && user !== null;
  const styles = useMemo(() => getStyles(theme, isDark), [theme, isDark]);

  const LANG_NAMES: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
  };
  const currentLang = getCurrentLanguage();
  const currentLangLabel = LANG_NAMES[currentLang] ?? currentLang.toUpperCase();

  const handleSignIn = () => exitGuestMode('signIn');
  const handleSignUp = () => exitGuestMode('signUp');
  const handleAbout = () => navigation.navigate('About');
  const handleFAQ = () => navigation.navigate('FAQ');
  const handleFeedback = () => navigation.navigate('Feedback');
  const handleSettings = () => navigation.navigate('Settings');
  const handleSecurityPrivacy = () => {
    showInfo({
      title: t('more.securityPrivacy'),
      message: 'Your privacy and security settings',
    });
  };

  const handleClearLocalData = () => {
    setModal({
      variant: 'confirm',
      title: t('settings.clearLocalData'),
      message: 'This will clear all local app data.',
      confirmLabel: 'Clear',
      onConfirm: () => {
        showInfo({
          title: 'Info',
          message: 'Clear data functionality to be implemented',
        });
      },
    });
  };

  const handleLogout = () => {
    setModal({
      variant: 'confirm',
      title: t('more.logoutConfirmTitle'),
      message: t('more.logoutConfirmMessage'),
      confirmLabel: t('more.logoutConfirmButton'),
      onConfirm: async () => {
        await logout();
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background.primary }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile row / Guest banner */}
        {isLoggedIn && user ? (
          <ProfileRow
            user={user}
            onPress={() => setEditModalVisible(true)}
            styles={styles}
            theme={theme}
          />
        ) : (
          <GuestBanner
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            styles={styles}
            t={t}
          />
        )}

        {/* Quick tabs — logged-in only */}
        {isLoggedIn && (
          <QuickTabsRow
            onAboutPress={handleAbout}
            onFAQPress={handleFAQ}
            onSettingsPress={handleSettings}
            styles={styles}
            theme={theme}
            t={t}
          />
        )}

        {/* Account section — logged-in only */}
        {isLoggedIn && (
          <>
            <SectionLabel
              title={t('more.sectionAccount')}
              styles={styles}
              theme={theme}
            />
            <SectionGroup styles={styles} theme={theme}>
              <SettingsRow
                icon="shield-check"
                label={t('more.securityPrivacy')}
                onPress={handleSecurityPrivacy}
                styles={styles}
                theme={theme}
              />
              <ToggleRow
                icon="bell-outline"
                iconTint={theme.text.link}
                label={t('navigation.notifications')}
                value={notificationsEnabled}
                onToggle={setNotificationsEnabled}
                styles={styles}
                theme={theme}
              />
              <SettingsRow
                icon="language"
                label={t('settings.language')}
                onPress={() => setLangModalVisible(true)}
                valueLabel={currentLangLabel}
                isLast
                styles={styles}
                theme={theme}
              />
            </SectionGroup>
          </>
        )}

        {/* Preferences section */}
        <SectionLabel
          title={t('more.sectionPreferences')}
          styles={styles}
          theme={theme}
        />
        <SectionGroup styles={styles} theme={theme}>
          <ToggleRow
            icon={isDark ? 'moon' : 'sun'}
            iconTint={theme.text.link}
            label={t('more.appearance')}
            value={isDark}
            onToggle={toggleTheme}
            styles={styles}
            theme={theme}
          />
          {!isLoggedIn && (
            <SettingsRow
              icon="language"
              label={t('settings.language')}
              onPress={() => setLangModalVisible(true)}
              valueLabel={currentLangLabel}
              styles={styles}
              theme={theme}
            />
          )}
          <SettingsRow
            icon="info-circle"
            label={t('navigation.about')}
            onPress={handleAbout}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="info"
            label={t('more.faqHelp')}
            onPress={handleFAQ}
            isLast={!(!isLoggedIn)}
            styles={styles}
            theme={theme}
          />
          {!isLoggedIn && (
            <SettingsRow
              icon="trash"
              label={t('settings.clearLocalData')}
              onPress={handleClearLocalData}
              isLast
              styles={styles}
              theme={theme}
            />
          )}
        </SectionGroup>

        {/* Support section */}
        <SectionLabel
          title={t('more.sectionSupport')}
          styles={styles}
          theme={theme}
        />
        <SectionGroup styles={styles} theme={theme}>
          <SettingsRow
            customIcon={<FeedbackIcon size={18} color={theme.text.secondary} />}
            label={t('more.feedback')}
            onPress={handleFeedback}
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon="star-circle"
            label={t('more.rateApp')}
            onPress={() => {}}
            isLast
            styles={styles}
            theme={theme}
          />
        </SectionGroup>

        {/* Logout — logged-in only */}
        {isLoggedIn && (
          <LogoutRow
            onPress={handleLogout}
            styles={styles}
            theme={theme}
            t={t}
          />
        )}
      </ScrollView>

      {/* Edit Profile Modal — wired when UserProfile type is unified */}

      {/* Language Selector — mounts to open, unmounts on close */}
      {langModalVisible && (
        <LanguageSelectorModal
          currentLang={currentLang}
          onSelect={code => changeLanguage(code)}
          onClose={() => setLangModalVisible(false)}
        />
      )}
      <AppModal config={modal} onClose={() => setModal(null)} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (theme: ThemeColors, _isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      paddingTop: 10,
    },
    header: {
      // paddingTop set dynamically via insets.top
    },
    headerInner: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 14,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: BaseColors.white,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    scrollContent: {
      paddingTop: 8,
    },

    // Menu label
    menuLabel: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 13,
      letterSpacing: 0.3,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },

    // Profile card
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 16,
      gap: 14,
      shadowColor: theme.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    avatarCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: BaseColors.merckPurple,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      color: BaseColors.white,
      fontFamily: getFontStyle('h3').fontFamily,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 24,
    },
    profileInfo: {
      flex: 1,
      gap: 4,
    },
    profileName: {
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 20,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      backgroundColor: BaseColors.merckPurpleLight + '22',
    },
    roleBadgeText: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 11,
      color: BaseColors.merckPurpleLight,
      fontWeight: '600',
    },
    profileEmailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    profileEmail: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 12,
      lineHeight: 16,
    },

    // Guest banner
    guestCard: {
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 20,
      backgroundColor: BaseColors.merckPurple,
      gap: 8,
    },
    guestIconRow: {
      marginBottom: 4,
      flexDirection: 'row',
    },
    guestLogo: {
      width: 36,
      height: 36,
    },
    guestTitle: {
      fontFamily: getFontStyle('h3').fontFamily,
      fontSize: 18,
      color: BaseColors.white,
      lineHeight: 24,
    },
    guestHeaderTitle: {
      paddingTop: 8,
      paddingLeft: 12,
    },
    guestSubtitle: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 13,
      color: 'rgba(255,255,255,0.72)',
      lineHeight: 18,
      marginBottom: 4,
    },
    guestButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    guestBtn: {
      flex: 1,
      backgroundColor: BaseColors.white,
    },
    guestSignInText: {
      color: BaseColors.merckPurple,
      fontWeight: '700',
    },
    guestOutlineBtn: {
      backgroundColor: 'transparent',
      borderColor: BaseColors.white,
      borderWidth: 1.5,
    },
    guestOutlineText: {
      color: BaseColors.white,
      fontWeight: '600',
    },

    // Quick tabs
    quickTabsRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 14,
      gap: 10,
    },
    quickTab: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 6,
    },
    quickTabLabel: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 11,
      fontWeight: '600',
    },

    // Section label
    sectionLabel: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 6,
    },

    // Section group
    sectionGroup: {
      marginHorizontal: 16,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
    },

    // Settings row
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 13,
      gap: 12,
    },
    rowIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: {
      flex: 1,
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 15,
      lineHeight: 20,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    rowValue: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 13,
    },
  });

export default MoreListScreen;
