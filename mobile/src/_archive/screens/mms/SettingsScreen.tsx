import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AppModal, ModalConfig } from '@components/modals';
import { useTranslation } from 'react-i18next';
import Icon from '@components/icons/Icon';
import {
  Heading3,
  BodyText,
  ButtonText,
  CaptionText,
} from '@components/common/CustomText';
import { useTheme } from '@theme/index';
import { useAuth } from '@context/AuthContext';
import { showSuccess, showError } from '@utils/toast';
import { useSettings } from '@hooks/useSettings';
import { CustomToggle } from '@components/common/CustomToggle';

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'IT', label: 'Italy' },
  { code: 'ES', label: 'Spain' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'BE', label: 'Belgium' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'AT', label: 'Austria' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
  { code: 'FI', label: 'Finland' },
  { code: 'PL', label: 'Poland' },
  { code: 'CZ', label: 'Czech Republic' },
  { code: 'RU', label: 'Russia' },
  { code: 'CN', label: 'China' },
  { code: 'JP', label: 'Japan' },
  { code: 'IN', label: 'India' },
  { code: 'AU', label: 'Australia' },
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'BR', label: 'Brazil' },
  { code: 'ZA', label: 'South Africa' },
];

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, logout, deleteAccount } = useAuth();
  const { settings, updateSettings, isLoading, isSaving, isError } = useSettings();

  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    settings?.validityAreaLanguage?.validityArea || 'US',
  );

  useEffect(() => {
    if (settings?.validityAreaLanguage?.validityArea) {
      setSelectedCountryCode(settings.validityAreaLanguage.validityArea);
    }
  }, [settings]);

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

  const handleToggle = useCallback(
    (
      section: 'home' | 'articleDetails' | 'dataPrivacy' | 'location',
      key: string,
      value: boolean,
    ) => {
      if (!settings) return;

      if (section === 'home') {
        updateSettings({
          ...settings,
          home: { ...settings.home, [key]: value },
        });
      } else if (section === 'articleDetails') {
        updateSettings({
          ...settings,
          articleDetails: { ...settings.articleDetails, [key]: value },
        });
      } else if (section === 'dataPrivacy') {
        updateSettings({
          ...settings,
          dataPrivacy: { ...settings.dataPrivacy, [key]: value },
        });
      } else if (section === 'location') {
        updateSettings({
          ...settings,
          location: { ...settings.location, [key]: value },
        });
      }
    },
    [settings, updateSettings],
  );

  const handleSectionToggle = (index: number, value: boolean) => {
    if (!settings) return;
    const sections = [...settings.sections];
    sections[index] = value;
    updateSettings({ ...settings, sections });
  };

  const handleCountrySelect = (countryCode: string) => {
    if (!settings) return;
    setSelectedCountryCode(countryCode);
    setShowCountryPicker(false);
    updateSettings({
      ...settings,
      validityAreaLanguage: {
        ...settings.validityAreaLanguage,
        validityArea: countryCode,
      },
    });
  };

  // Memoized callbacks for each toggle to prevent unnecessary re-renders
  const handleBarcodeToggle = useCallback(
    (v: boolean) => handleToggle('home', 'barcodeScanner', v),
    [handleToggle],
  );
  const handleSdsToggle = useCallback(
    (v: boolean) => handleToggle('articleDetails', 'safetyDataSheet', v),
    [handleToggle],
  );
  const handleEhsToggle = useCallback(
    (v: boolean) => handleToggle('articleDetails', 'ehs', v),
    [handleToggle],
  );
  const handleTransportToggle = useCallback(
    (v: boolean) => handleToggle('articleDetails', 'transportInformation', v),
    [handleToggle],
  );
  const handleFavoritesToggle = useCallback(
    (v: boolean) => handleToggle('dataPrivacy', 'favourites', v),
    [handleToggle],
  );
  const handleCustomerDataToggle = useCallback(
    (v: boolean) => handleToggle('dataPrivacy', 'customerData', v),
    [handleToggle],
  );
  const handleAskLocationToggle = useCallback(
    (v: boolean) => handleToggle('location', 'askLocationAgain', v),
    [handleToggle],
  );
  const handleAutoUpdateLocationToggle = useCallback(
    (v: boolean) => handleToggle('location', 'locationUpdate', v),
    [handleToggle],
  );

  const styles = useMemo(() => getStyles(theme), [theme]);

  if (isLoading && !settings) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.button.primary.background} />
        <BodyText color={theme.text.secondary} style={styles.loadingTextMargin}>
          {t('common.loading')}
        </BodyText>
      </View>
    );
  }

  if (isError && !settings) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="warning" size={40} color={theme.text.error} />
        <BodyText color={theme.text.primary} style={styles.loadingTextMargin}>
          {t('common.somethingWentWrong', { defaultValue: 'Something went wrong' })}
        </BodyText>
        <BodyText color={theme.text.secondary} style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
          {t('common.tryAgainLater', { defaultValue: 'Unable to load settings. Please try again later.' })}
        </BodyText>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {settings && (
          <>
            {/* Home Settings */}
            <View style={styles.sectionGroup}>
              <BodyText style={styles.sectionTitle}>{t('settings.home')}</BodyText>
              <ToggleRowComponent
                icon="barcode"
                label={t('settings.barcodeScanner')}
                value={settings.home.barcodeScanner}
                onToggle={handleBarcodeToggle}
                disabled={isSaving}
                isLast
                theme={theme}
              />
            </View>

            {/* Article Details */}
            <View style={styles.sectionGroup}>
              <BodyText style={styles.sectionTitle}>
                {t('settings.articleDetails')}
              </BodyText>
              <ToggleRowComponent
                icon="file-text"
                label={t('settings.safetyDataSheet')}
                value={settings.articleDetails.safetyDataSheet}
                onToggle={handleSdsToggle}
                disabled={isSaving}
                theme={theme}
              />
              <ToggleRowComponent
                icon="file-text"
                label={t('settings.ehs')}
                value={settings.articleDetails.ehs}
                onToggle={handleEhsToggle}
                disabled={isSaving}
                theme={theme}
              />
              <ToggleRowComponent
                icon="file-text"
                label={t('settings.transportInformation')}
                value={settings.articleDetails.transportInformation}
                onToggle={handleTransportToggle}
                disabled={isSaving}
                isLast
                theme={theme}
              />
            </View>

            {/* Data & Privacy */}
            <View style={styles.sectionGroup}>
              <BodyText style={styles.sectionTitle}>
                {t('settings.dataPrivacy')}
              </BodyText>
              <ToggleRowComponent
                icon="heart"
                label={t('settings.favourites')}
                value={settings.dataPrivacy.favourites}
                onToggle={handleFavoritesToggle}
                disabled={isSaving}
                theme={theme}
              />
              <ToggleRowComponent
                icon="shield-check"
                label={t('settings.customerData')}
                value={settings.dataPrivacy.customerData}
                onToggle={handleCustomerDataToggle}
                disabled={isSaving}
                isLast
                theme={theme}
              />
            </View>

            {/* SDS Sections */}
            <View style={styles.sectionGroup}>
              <BodyText style={styles.sectionTitle}>
                {t('settings.sdsSections')}
              </BodyText>
              {settings.sections.map((enabled, idx) => (
                <ToggleRowComponent
                  key={idx}
                  icon="document"
                  label={t(`sds.section${idx + 1}`)}
                  value={enabled}
                  onToggle={v => handleSectionToggle(idx, v)}
                  disabled={isSaving}
                  isLast={idx === settings.sections.length - 1}
                  theme={theme}
                />
              ))}
            </View>

            {/* Language & Location */}
            <View style={styles.sectionGroup}>
              <BodyText style={styles.sectionTitle}>
                {t('settings.languageSettings')}
              </BodyText>

              {/* Country Selector */}
              <TouchableOpacity
                style={[styles.settingsRow, styles.countryRow]}
                onPress={() => setShowCountryPicker(true)}
              >
                <View style={styles.rowContent}>
                  <BodyText style={styles.rowLabel}>
                    {t('settings.validityArea')}
                  </BodyText>
                  <CaptionText style={styles.rowValue}>
                    {COUNTRIES.find(c => c.code === selectedCountryCode)?.label}
                  </CaptionText>
                </View>
                <Icon
                  name="chevron-right"
                  size={16}
                  color={theme.text.tertiary}
                />
              </TouchableOpacity>

              {/* Language */}
              <View
                style={[
                  styles.settingsRow,
                  {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border.secondary,
                  },
                ]}
              >
                <View style={styles.rowContent}>
                  <BodyText style={styles.rowLabel}>
                    {t('settings.language')}
                  </BodyText>
                  <CaptionText style={styles.rowValue}>
                    {settings.validityAreaLanguage?.language}
                  </CaptionText>
                </View>
              </View>

              {/* Location Permission */}
              <ToggleRowComponent
                icon="location"
                label={t('settings.askLocationAgain')}
                value={settings.location.askLocationAgain}
                onToggle={handleAskLocationToggle}
                disabled={isSaving}
                theme={theme}
              />

              {/* Auto Update Location */}
              {!settings.location.askLocationAgain && (
                <ToggleRowComponent
                  icon="location"
                  label={t('settings.autoUpdateLocation')}
                  value={settings.location.locationUpdate}
                  onToggle={handleAutoUpdateLocationToggle}
                  disabled={isSaving}
                  isLast
                  theme={theme}
                />
              )}

              {/* GPS Error Status */}
              {settings.location.askLocationAgain && (
                <View style={[styles.settingsRow, styles.gpsStatus]}>
                  <CaptionText style={styles.gpsText}>
                    {t(`settings.gpsCode.${settings.location.error}`)}
                  </CaptionText>
                </View>
              )}
            </View>

            {/* App Language */}
            <View style={styles.sectionGroup}>
              <View style={[styles.settingsRow, styles.appLangRow]}>
                <BodyText style={styles.rowLabel}>
                  {t('settings.appLanguage')}
                </BodyText>
                <CaptionText style={styles.rowValue}>
                  {settings.appLanguage.toUpperCase()}
                </CaptionText>
              </View>
            </View>

            {/* User & Account */}
            <View style={styles.sectionGroup}>
              <BodyText style={styles.sectionTitle}>
                {t('settings.userData')}
              </BodyText>

              <SettingsRowComponent
                icon="delete-profile"
                label={t('settings.deleteAccount')}
                onPress={() => {
                  setModal({
                    variant: 'destructive',
                    title: t('settings.deleteAccountTitle'),
                    message: t('settings.deleteAccountWarning'),
                    confirmLabel: t('settings.deleteAccount'),
                    cancelLabel: t('common.cancel'),
                    onConfirm: async () => {
                      try {
                        await deleteAccount();
                        showSuccess({
                          title: t('settings.deleteAccountSuccess'),
                          message: t('settings.deleteAccountSuccessMessage'),
                        });
                      } catch (error) {
                        showError({
                          title: t('settings.deleteAccountError'),
                          message: t('settings.deleteAccountErrorMessage'),
                        });
                      }
                    },
                  });
                }}
                isLast
                theme={theme}
              />
            </View>
          </>
        )}

        {/* Logout Button */}
        {user && (
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={[styles.sectionGroup, styles.logoutButton]}
              onPress={handleLogout}
            >
              <View style={styles.logoutContent}>
                <Icon name="logout" size={20} color={theme.button.error.text} />
                <ButtonText color={theme.button.error.text}>
                  {t('auth.logout')}
                </ButtonText>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isSaving && (
          <View style={styles.savingContainer}>
            <ActivityIndicator
              size="small"
              color={theme.button.primary.background}
            />
          </View>
        )}
      </ScrollView>

      <AppModal config={modal} onClose={() => setModal(null)} />

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <View style={styles.countryPickerOverlay}>
          <View style={[styles.sectionGroup, styles.countryPickerModal]}>
            <Heading3 style={styles.countryPickerTitle}>
              {t('settings.validityArea')}
            </Heading3>
            <ScrollView style={styles.countryList}>
              {COUNTRIES.map((country, idx) => (
                <TouchableOpacity
                  key={country.code}
                  onPress={() => handleCountrySelect(country.code)}
                  style={[
                    styles.countryItem,
                    idx !== COUNTRIES.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.border.secondary,
                    },
                  ]}
                >
                  <BodyText
                    style={
                      selectedCountryCode === country.code
                        ? styles.countryLabelSelected
                        : styles.countryLabel
                    }
                  >
                    {country.label}
                  </BodyText>
                  {selectedCountryCode === country.code && (
                    <Icon
                      name="checkmark-circle"
                      size={20}
                      color={theme.text.link}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowCountryPicker(false)}
              style={[styles.sectionGroup, styles.countryCloseButton]}
            >
              <ButtonText style={styles.countryCloseText}>
                {t('common.close')}
              </ButtonText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

// ─── Toggle Row Component ─────────────────────────────────────────────────────

interface ToggleRowComponentProps {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
  theme: any;
}

const ToggleRowComponent: React.FC<ToggleRowComponentProps> = React.memo(({
  icon,
  label,
  value,
  onToggle,
  disabled,
  isLast,
  theme,
}) => {
  return (
    <View
      style={[
        getStyles(theme).settingsRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border.secondary,
        },
      ]}
    >
      <Icon name={icon as any} size={20} color={theme.text.secondary} />
      <BodyText style={getStyles(theme).rowLabel}>{label}</BodyText>
      <CustomToggle
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        size={56}
      />
    </View>
  );
});

// ─── Settings Row Component ──────────────────────────────────────────────────

interface SettingsRowComponentProps {
  icon: string;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  theme: any;
}

const SettingsRowComponent: React.FC<SettingsRowComponentProps> = ({
  icon,
  label,
  onPress,
  isLast,
  theme,
}) => {
  const styles = getStyles(theme);
  return (
    <TouchableOpacity
      style={[
        styles.settingsRow,
        styles.destructiveRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border.secondary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon as any} size={20} color={theme.text.error} />
      <ButtonText color={theme.text.error} style={styles.rowLabel}>
        {label}
      </ButtonText>
      <Icon name="chevron-right" size={16} color={theme.text.error} />
    </TouchableOpacity>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

function getStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    contentContainer: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background.primary,
    },
    loadingTextMargin: {
      marginTop: 16,
    },
    sectionGroup: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    profileSection: {
      marginBottom: 24,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    profileContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatarCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.button.primary.background,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      color: theme.text.primary,
      marginBottom: 4,
    },
    profileEmail: {
      color: theme.text.secondary,
    },
    sectionTitle: {
      color: theme.text.secondary,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      fontSize: 12,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    destructiveRow: {
      backgroundColor: theme.text.error + '08',
    },
    rowContent: {
      flex: 1,
    },
    rowLabel: {
      color: theme.text.primary,
      flex: 1,
    },
    rowValue: {
      color: theme.text.secondary,
      marginTop: 2,
    },
    countryRow: {
      justifyContent: 'space-between',
    },
    appLangRow: {
      justifyContent: 'space-between',
    },
    gpsStatus: {
      paddingVertical: 8,
      backgroundColor: theme.background.secondary,
    },
    gpsText: {
      color: theme.text.secondary,
    },
    logoutContainer: {
      marginBottom: 32,
    },
    logoutButton: {
      paddingVertical: 12,
    },
    logoutContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    savingContainer: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    countryPickerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    countryPickerModal: {
      maxHeight: '80%',
      marginHorizontal: 32,
    },
    countryPickerTitle: {
      color: theme.text.primary,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      textAlign: 'center',
    },
    countryList: {
      maxHeight: 300,
      paddingHorizontal: 0,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    countryLabel: {
      color: theme.text.primary,
    },
    countryLabelSelected: {
      color: theme.text.link,
    },
    countryCloseButton: {
      marginHorizontal: 0,
      marginTop: 12,
      borderRadius: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      paddingVertical: 12,
      backgroundColor: theme.button.primary.background,
    },
    countryCloseText: {
      textAlign: 'center',
      color: theme.button.primary.text,
    },
  });
}

export default SettingsScreen;
