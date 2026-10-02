/**
 * Settings Screen with Tabs
 *
 * Tabbed settings interface with role-based feature flag access
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  AppModal,
  ModalConfig,
  LanguageSelectorModal,
} from '@components/modals';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { changeLanguage } from '@localization/i18n';
import Icon from '@components/icons/Icon';
import {
  Heading1,
  Heading3,
  BodyText,
  ButtonText,
  CaptionText,
} from '@components/common/CustomText';
import { useTheme } from '@theme/index';
import { useAuth } from '@context/AuthContext';
import { showSuccess, showError, showInfo } from '@utils/toast';
import { resetOnboarding } from '@services/onboardingService';
import { getOnboardingConfig } from '@utils/platformConfig';
import { useUserStore, useIsAdmin } from '@stores/userStore';
import {
  useFeatureFlagsStore,
  FeatureFlagCategory,
  FeatureFlag,
} from '@stores/featureFlagsStore';
import {
  useFeatureFlagActions,
  useHasFeatureFlagOverrides,
} from '@hooks/useFeatureFlag';
import { userService } from '@services/api/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import EditProfileModal from '@components/profile/EditProfileModal';
import { UserProfile } from '@/types/user.types';
import { useHideTabBarOnScroll } from '@context/TabBarVisibilityContext';

type TabType = 'general' | 'features' | 'account';

// Categories accessible to regular users
const USER_ACCESSIBLE_CATEGORIES: FeatureFlagCategory[] = ['ui'];

// Categories only accessible to admins
const ADMIN_ONLY_CATEGORIES: FeatureFlagCategory[] = [
  'feature',
  'social',
  'analytics',
  'experimental',
  'debug',
];

const CATEGORY_LABELS: Record<FeatureFlagCategory, string> = {
  ui: '🎨 UI & Appearance',
  feature: '⭐ Features',
  social: '🔗 Social',
  analytics: '📊 Analytics',
  experimental: '🧪 Experimental',
  debug: '🐛 Debug',
};

const SettingsScreenTabbed: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // User role
  const isAdmin = useIsAdmin();
  const currentUser = useUserStore(state => state.currentUser);

  // Feature flags
  const flags = useFeatureFlagsStore(state => state.flags);
  const overrides = useFeatureFlagsStore(state => state.overrides);
  const isFeatureEnabled = useFeatureFlagsStore(
    state => state.isFeatureEnabled,
  );
  const setFeatureFlagOverride = useFeatureFlagsStore(
    state => state.setFeatureFlagOverride,
  );
  const clearOverride = useFeatureFlagsStore(state => state.clearOverride);
  const { clearAllOverrides } = useFeatureFlagActions();
  const hasOverrides = useHasFeatureFlagOverrides();

  const tabBarScrollHandler = useHideTabBarOnScroll();
  const currentLang = i18n.language;

  // Fetch user profile from API
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: userService.getProfile,
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  const userProfile = profileData?.user;

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile: Partial<UserProfile>) =>
      userService.updateProfile(updatedProfile),
    onSuccess: data => {
      // Update the cache with new data
      queryClient.setQueryData(['userProfile'], data);
      showSuccess({
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
      });
      setIsEditModalVisible(false);
    },
    onError: (error: any) => {
      showError({
        title: 'Update Failed',
        message:
          error?.message || 'Failed to update profile. Please try again.',
      });
    },
  });

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  // Handle save profile
  const handleSaveProfile = (updatedProfile: Partial<UserProfile>) => {
    updateProfileMutation.mutate(updatedProfile);
  };

  const handleLogout = () => {
    setModal({
      variant: 'confirm',
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmLabel: 'Logout',
      onConfirm: async () => {
        try {
          await logout();
          showSuccess({
            title: 'Logged Out',
            message: 'You have been successfully logged out',
          });
        } catch {
          showError({
            title: 'Logout Failed',
            message: 'Failed to logout. Please try again.',
          });
        }
      },
    });
  };

  const handleResetOnboarding = () => {
    setModal({
      variant: 'confirm',
      title: 'Reset Onboarding',
      message:
        'This will show the first launch guide again on next app restart. Continue?',
      confirmLabel: 'Reset',
      onConfirm: async () => {
        try {
          await resetOnboarding();
          showInfo({
            title: 'Onboarding Reset',
            message: 'First launch guide will show on next app restart',
          });
        } catch {
          showError({
            title: 'Reset Failed',
            message: 'Failed to reset onboarding. Please try again.',
          });
        }
      },
    });
  };

  const handleToggleFlag = (flagKey: string, currentValue: boolean) => {
    setFeatureFlagOverride(flagKey, !currentValue);
  };

  const handleClearOverride = (flagKey: string) => {
    clearOverride(flagKey);
  };

  const handleClearAllOverrides = () => {
    setModal({
      variant: 'confirm',
      title: 'Clear All Overrides',
      message: 'This will clear all feature flag overrides. Continue?',
      confirmLabel: 'Clear',
      onConfirm: () => {
        clearAllOverrides();
        showSuccess({
          title: 'Overrides Cleared',
          message: 'All feature flag overrides have been cleared',
        });
      },
    });
  };

  const handleLanguageChange = () => {
    setLangModalVisible(true);
  };

  const handleLanguageSelect = async (code: string) => {
    const names: Record<string, string> = {
      en: 'English',
      fr: 'Français',
      ar: 'العربية',
      de: 'Deutsch',
      it: 'Italiano',
      es: 'Español',
      zh: '中文',
      ja: '日本語',
      pt: 'Português',
    };
    // Close the drawer before changing language so it's never visible during the transition
    navigation.dispatch(DrawerActions.closeDrawer());
    try {
      await changeLanguage(code);
      showSuccess({
        title: t('settings.languageChanged'),
        message: `Language changed to ${names[code]}`,
      });
    } catch {
      showError({
        title: 'Error',
        message: 'Failed to change language. Please try again.',
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.secondary,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.background.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
      paddingHorizontal: 8,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.button.primary.background,
    },
    tabText: {
      fontSize: 14,
      color: theme.text.secondary,
      fontWeight: '500',
    },
    activeTabText: {
      color: theme.button.primary.background,
      fontWeight: '600',
    },
    scrollContainer: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: 24,
      backgroundColor: theme.background.card,
      padding: 20,
      borderRadius: 12,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.button.primary.background,
      marginBottom: 12,
    },
    roleBadge: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 8,
    },
    adminBadge: {
      backgroundColor: theme.button.warning.background,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    card: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    lastListItem: {
      borderBottomWidth: 0,
    },
    listItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    listItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    categoryCard: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    categoryHeader: {
      padding: 16,
      backgroundColor: theme.background.secondary,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
    },
    flagItem: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
    flagHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    flagName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      flex: 1,
      marginRight: 8,
    },
    flagDescription: {
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    flagMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    metaBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: theme.background.secondary,
    },
    metaBadgeText: {
      fontSize: 11,
      color: theme.text.secondary,
    },
    overrideBadge: {
      backgroundColor: theme.button.warning.background,
    },
    overrideBadgeText: {
      color: theme.button.warning.text,
      fontWeight: '600',
    },
    flagInfoCard: {
      backgroundColor: theme.button.info.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    infoText: {
      fontSize: 13,
      color: theme.button.info.text,
      lineHeight: 18,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.button.primary.background,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    actionButtonDanger: {
      backgroundColor: theme.button.danger.background,
    },
    actionButtonText: {
      color: theme.button.primary.text,
      fontSize: 13,
      fontWeight: '600',
    },
    errorButton: {
      backgroundColor: theme.button.error.background,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    dangerSection: {
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
    dangerSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    logoutCard: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 10,
    },
    logoutButtonPressed: {
      backgroundColor: theme.background.secondary,
    },
    logoutIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.button.error.background + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.button.error.background,
    },
    profileHeaderCard: {
      backgroundColor: theme.background.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    profileHeaderContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    avatarLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 2,
      borderColor: theme.button.primary.background,
    },
    headerInfo: {
      flex: 1,
    },
    headerName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    usernameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 8,
    },
    usernameText: {
      fontSize: 13,
    },
    roleBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    roleBadgeInline: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    adminBadgeInline: {
      backgroundColor: '#F59E0B',
    },
    roleBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#10B98115',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    verifiedText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#10B981',
    },
    actionButtonsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    editButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.button.primary.background,
      backgroundColor: theme.button.primary.background + '10',
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    logoutButtonTop: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.button.error.background,
      backgroundColor: theme.button.error.background + '10',
    },
    logoutButtonTopText: {
      fontSize: 14,
      fontWeight: '600',
    },
    sectionTitleText: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    infoCard: {
      backgroundColor: theme.background.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border.primary,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
    },
    infoIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.button.primary.background + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    infoContent: {
      flex: 1,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '500',
      marginTop: 2,
    },
    userIdText: {
      fontFamily: 'monospace',
      fontSize: 12,
      marginTop: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: theme.background.secondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    button: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
  });

  const renderFlagItem = (flag: FeatureFlag) => {
    const isEnabled = isFeatureEnabled(flag.key);
    const hasOverride = flag.key in overrides;

    return (
      <View key={flag.key} style={styles.flagItem}>
        <View style={styles.flagHeader}>
          <BodyText style={styles.flagName}>{flag.name || flag.key}</BodyText>
          <Switch
            value={isEnabled}
            onValueChange={() => handleToggleFlag(flag.key, isEnabled)}
            trackColor={{
              false: theme.border.secondary,
              true: theme.button.success.background,
            }}
            thumbColor={
              isEnabled ? theme.button.success.text : theme.text.secondary
            }
          />
        </View>

        <CaptionText style={styles.flagDescription}>
          {flag.description}
        </CaptionText>

        <View style={styles.flagMeta}>
          <View style={styles.metaBadge}>
            <CaptionText style={styles.metaBadgeText}>
              {flag.targeting.rolloutPercentage}% rollout
            </CaptionText>
          </View>
          {hasOverride && (
            <TouchableOpacity
              style={[styles.metaBadge, styles.overrideBadge]}
              onPress={() => handleClearOverride(flag.key)}
            >
              <CaptionText
                style={[styles.metaBadgeText, styles.overrideBadgeText]}
              >
                CUSTOM (tap to reset)
              </CaptionText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderCategory = (category: FeatureFlagCategory) => {
    const categoryFlags = flags.filter(flag => flag.category === category);

    if (!categoryFlags || categoryFlags.length === 0) {
      return null;
    }

    return (
      <View key={category} style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <BodyText style={styles.categoryTitle}>
            {CATEGORY_LABELS[category]}
          </BodyText>
        </View>
        {categoryFlags.map(flag => renderFlagItem(flag))}
      </View>
    );
  };

  const renderGeneralTab = () => {
    const languageNames: Record<string, string> = {
      en: 'English',
      fr: 'Français',
      ar: 'العربية',
      de: 'Deutsch',
      it: 'Italiano',
      es: 'Español',
      zh: '中文',
      ja: '日本語',
      pt: 'Português',
    };

    const settingsOptions = [
      {
        key: 'language',
        title: t('settings.language'),
        icon: 'language' as const,
        value: languageNames[currentLang] || currentLang.toUpperCase(),
        onPress: handleLanguageChange,
      },
      {
        key: 'theme',
        title: t('settings.theme'),
        icon: isDark ? ('moon' as const) : ('sun' as const),
        value: isDark ? 'Dark' : 'Light',
        component: (
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border.primary, true: theme.text.link }}
            thumbColor={theme.background.card}
          />
        ),
      },
      {
        key: 'notifications',
        title: t('settings.notifications'),
        icon: 'bell' as const,
        component: (
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: theme.border.primary, true: theme.text.link }}
            thumbColor={theme.background.card}
          />
        ),
      },
    ];

    const onboardingConfig = getOnboardingConfig();
    if (onboardingConfig.enabled) {
      settingsOptions.push({
        key: 'reset_onboarding',
        title: 'Reset First Launch Guide',
        icon: 'refresh' as const,
        value: '',
      });
    }

    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        onScroll={tabBarScrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Icon name="settings" size={20} color={theme.text.primary} />
            <Heading3 color={theme.text.primary}>General Settings</Heading3>
          </View>

          <View style={styles.card}>
            {settingsOptions.map((option, index) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.listItem,
                  index === settingsOptions.length - 1 && styles.lastListItem,
                ]}
                onPress={
                  option.key === 'reset_onboarding'
                    ? handleResetOnboarding
                    : option.key === 'language'
                    ? handleLanguageChange
                    : undefined
                }
                disabled={
                  option.key !== 'reset_onboarding' && option.key !== 'language'
                }
              >
                <View style={styles.listItemLeft}>
                  <Icon name={option.icon} size={24} color={theme.text.link} />
                  <BodyText color={theme.text.primary}>{option.title}</BodyText>
                </View>
                <View style={styles.listItemRight}>
                  {option.component || (
                    <>
                      <CaptionText color={theme.text.secondary}>
                        {option.value}
                      </CaptionText>
                      {option.key === 'language' && (
                        <Icon
                          name="arrow-right-small"
                          size={20}
                          color={theme.text.secondary}
                        />
                      )}
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dev Mode - Admin Toggle */}
        {__DEV__ && (
          <View style={styles.section}>
            <View style={styles.flagInfoCard}>
              <BodyText style={styles.infoText}>
                🔧 Dev Mode: Feature flags can be customized per user
              </BodyText>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderFeaturesTab = () => {
    const accessibleCategories = isAdmin
      ? [...USER_ACCESSIBLE_CATEGORIES, ...ADMIN_ONLY_CATEGORIES]
      : USER_ACCESSIBLE_CATEGORIES;

    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        onScroll={tabBarScrollHandler}
        scrollEventThrottle={16}
      >
        {!isAdmin && (
          <View style={styles.flagInfoCard}>
            <BodyText style={styles.infoText}>
              💡 These are user-customizable UI features. Admin users can access
              additional feature flags.
            </BodyText>
          </View>
        )}

        {isAdmin && hasOverrides && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={handleClearAllOverrides}
            >
              <ButtonText style={styles.actionButtonText}>
                Clear All Overrides
              </ButtonText>
            </TouchableOpacity>
          </View>
        )}

        {accessibleCategories.map(renderCategory)}

        {!isAdmin && (
          <View style={[styles.flagInfoCard, { marginTop: 8 }]}>
            <BodyText style={styles.infoText}>
              🔒 Additional feature flags are available to admin users only
            </BodyText>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderAccountTab = () => {
    // Show loading state
    if (isLoadingProfile) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.button.primary.background}
          />
          <BodyText color={theme.text.secondary} style={{ marginTop: 12 }}>
            Loading profile...
          </BodyText>
        </View>
      );
    }

    // Show error state
    if (profileError && !userProfile) {
      return (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          onScroll={tabBarScrollHandler}
          scrollEventThrottle={16}
        >
          <View style={styles.errorContainer}>
            <Icon
              name="alert-circle"
              size={48}
              color={theme.button.error.background}
            />
            <BodyText
              color={theme.text.secondary}
              style={{ marginTop: 12, textAlign: 'center' }}
            >
              Failed to load profile
            </BodyText>
            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]}
              onPress={() => refetchProfile()}
            >
              <ButtonText color={theme.button.primary.text}>Retry</ButtonText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        onScroll={tabBarScrollHandler}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarLarge}>
              <Icon
                name="user"
                size={48}
                color={theme.button.primary.background}
              />
            </View>

            <View style={styles.headerInfo}>
              <Heading1 color={theme.text.primary} style={styles.headerName}>
                {userProfile?.firstName && userProfile?.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile?.username ||
                    currentUser?.name ||
                    user?.username ||
                    'Guest'}
              </Heading1>

              {userProfile?.username && (
                <View style={styles.usernameRow}>
                  <Icon
                    name="user-outline"
                    size={14}
                    color={theme.text.tertiary}
                  />
                  <CaptionText
                    color={theme.text.tertiary}
                    style={styles.usernameText}
                  >
                    @{userProfile.username}
                  </CaptionText>
                </View>
              )}

              <View style={styles.roleBadgeRow}>
                <View
                  style={[
                    styles.roleBadgeInline,
                    userProfile?.role === 'ADMIN' && styles.adminBadgeInline,
                  ]}
                >
                  <CaptionText style={styles.roleBadgeText}>
                    {userProfile?.role === 'ADMIN'
                      ? '👑 Admin'
                      : userProfile?.role === 'MODERATOR'
                      ? '⚡ Moderator'
                      : '👤 User'}
                  </CaptionText>
                </View>

                {userProfile?.emailVerifiedAt && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="shield-check" size={12} color="#10B981" />
                    <CaptionText style={styles.verifiedText}>
                      Verified
                    </CaptionText>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Icon
                name="settings"
                size={16}
                color={theme.button.primary.background}
              />
              <ButtonText
                color={theme.button.primary.background}
                style={styles.editButtonText}
              >
                Edit Profile
              </ButtonText>
            </TouchableOpacity>

            {user && (
              <TouchableOpacity
                style={styles.logoutButtonTop}
                onPress={handleLogout}
              >
                <Icon
                  name="logout"
                  size={16}
                  color={theme.button.error.background}
                />
                <ButtonText
                  color={theme.button.error.background}
                  style={styles.logoutButtonTopText}
                >
                  Sign Out
                </ButtonText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contact Information */}
        {userProfile && (
          <View style={styles.section}>
            <Heading3
              color={theme.text.primary}
              style={styles.sectionTitleText}
            >
              Contact Information
            </Heading3>

            <View style={styles.infoCard}>
              {userProfile.email && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Icon
                      name="mail"
                      size={20}
                      color={theme.button.primary.background}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <CaptionText color={theme.text.tertiary}>
                      Email Address
                    </CaptionText>
                    <BodyText
                      color={theme.text.primary}
                      style={styles.infoValue}
                    >
                      {userProfile.email}
                    </BodyText>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Professional Information */}
        {userProfile &&
          (userProfile.company ||
            userProfile.department ||
            userProfile.designation ||
            userProfile.specialization ||
            (userProfile.experienceYears &&
              userProfile.experienceYears > 0)) && (
            <View style={styles.section}>
              <Heading3
                color={theme.text.primary}
                style={styles.sectionTitleText}
              >
                Professional Details
              </Heading3>

              <View style={styles.infoCard}>
                {userProfile.company && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Icon
                        name="merck"
                        size={20}
                        color={theme.button.primary.background}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <CaptionText color={theme.text.tertiary}>
                        Company
                      </CaptionText>
                      <BodyText
                        color={theme.text.primary}
                        style={styles.infoValue}
                      >
                        {userProfile.company}
                      </BodyText>
                    </View>
                  </View>
                )}

                {userProfile.department && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Icon
                        name="component"
                        size={20}
                        color={theme.button.primary.background}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <CaptionText color={theme.text.tertiary}>
                        Department
                      </CaptionText>
                      <BodyText
                        color={theme.text.primary}
                        style={styles.infoValue}
                      >
                        {userProfile.department}
                      </BodyText>
                    </View>
                  </View>
                )}

                {userProfile.designation && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Icon
                        name="achievement"
                        size={20}
                        color={theme.button.primary.background}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <CaptionText color={theme.text.tertiary}>
                        Job Title
                      </CaptionText>
                      <BodyText
                        color={theme.text.primary}
                        style={styles.infoValue}
                      >
                        {userProfile.designation}
                      </BodyText>
                    </View>
                  </View>
                )}

                {userProfile.specialization && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Icon
                        name="star"
                        size={20}
                        color={theme.button.primary.background}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <CaptionText color={theme.text.tertiary}>
                        Specialization
                      </CaptionText>
                      <BodyText
                        color={theme.text.primary}
                        style={styles.infoValue}
                      >
                        {userProfile.specialization}
                      </BodyText>
                    </View>
                  </View>
                )}

                {userProfile.experienceYears !== undefined &&
                  userProfile.experienceYears > 0 && (
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icon
                          name="sparkle"
                          size={20}
                          color={theme.button.primary.background}
                        />
                      </View>
                      <View style={styles.infoContent}>
                        <CaptionText color={theme.text.tertiary}>
                          Experience
                        </CaptionText>
                        <BodyText
                          color={theme.text.primary}
                          style={styles.infoValue}
                        >
                          {userProfile.experienceYears}{' '}
                          {userProfile.experienceYears === 1 ? 'year' : 'years'}
                        </BodyText>
                      </View>
                    </View>
                  )}
              </View>
            </View>
          )}

        {/* Account Information */}
        {userProfile && (
          <View style={styles.section}>
            <Heading3
              color={theme.text.primary}
              style={styles.sectionTitleText}
            >
              Account Details
            </Heading3>

            <View style={styles.infoCard}>
              {userProfile.createdAt && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Icon
                      name="calendar"
                      size={20}
                      color={theme.button.primary.background}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <CaptionText color={theme.text.tertiary}>
                      Member Since
                    </CaptionText>
                    <BodyText
                      color={theme.text.primary}
                      style={styles.infoValue}
                    >
                      {new Date(userProfile.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </BodyText>
                  </View>
                </View>
              )}

              {userProfile.id && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Icon
                      name="shield-check"
                      size={20}
                      color={theme.button.primary.background}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <CaptionText color={theme.text.tertiary}>
                      User ID
                    </CaptionText>
                    <CaptionText
                      color={theme.text.secondary}
                      style={styles.userIdText}
                    >
                      {userProfile.id.substring(0, 20)}...
                    </CaptionText>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <BodyText
            style={[
              styles.tabText,
              activeTab === 'general' && styles.activeTabText,
            ]}
          >
            General
          </BodyText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'features' && styles.activeTab]}
          onPress={() => setActiveTab('features')}
        >
          <BodyText
            style={[
              styles.tabText,
              activeTab === 'features' && styles.activeTabText,
            ]}
          >
            Features
          </BodyText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.activeTab]}
          onPress={() => setActiveTab('account')}
        >
          <BodyText
            style={[
              styles.tabText,
              activeTab === 'account' && styles.activeTabText,
            ]}
          >
            Account
          </BodyText>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'general' && renderGeneralTab()}
      {activeTab === 'features' && renderFeaturesTab()}
      {activeTab === 'account' && renderAccountTab()}

      {/* Edit Profile Modal - Rendered at top level */}
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        userProfile={userProfile || null}
        onSave={handleSaveProfile}
        isLoading={updateProfileMutation.isPending}
      />

      {/* Confirmation / info modals */}
      <AppModal config={modal} onClose={() => setModal(null)} />

      {/* Language selector — mounts to open, unmounts on close */}
      {langModalVisible && (
        <LanguageSelectorModal
          currentLang={currentLang}
          onSelect={handleLanguageSelect}
          onClose={() => setLangModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default SettingsScreenTabbed;
