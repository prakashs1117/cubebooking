import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
// import {isRTL} from '../localization/i18n';

interface LocalizationDemoProps {}

const LocalizationDemo: React.FC<LocalizationDemoProps> = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    // Force RTL layout for Arabic
    const isArabic = language === 'ar';
    if (I18nManager.isRTL !== isArabic) {
      I18nManager.allowRTL(isArabic);
      I18nManager.forceRTL(isArabic);
      // In a real app, you'd want to restart the app here
      // RNRestart.restart();
    }
  };

  const currentLang = i18n.language;
  const isCurrentRTL = currentLang === 'ar';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.secondary,
    },
    rtlContainer: {
      // RTL specific container styles can be added here
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
      backgroundColor: theme.background.card,
      padding: 20,
      borderRadius: 10,
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 10,
      textAlign: 'center',
      fontFamily: getFontStyle('h2').fontFamily,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      fontFamily: getFontStyle('body').fontFamily,
    },
    section: {
      backgroundColor: theme.background.card,
      padding: 20,
      marginBottom: 15,
      borderRadius: 10,
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 15,
      fontFamily: getFontStyle('h3').fontFamily,
    },
    description: {
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 22,
      fontFamily: getFontStyle('body').fontFamily,
    },
    languageButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: 10,
    },
    languageButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
      backgroundColor: theme.background.tertiary,
      borderWidth: 1,
      borderColor: theme.border.primary,
      minWidth: 80,
      alignItems: 'center',
    },
    activeButton: {
      backgroundColor: theme.button.primary.background,
      borderColor: theme.button.primary.border,
    },
    buttonText: {
      fontSize: 14,
      color: theme.text.primary,
      fontWeight: '500',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    activeButtonText: {
      color: theme.button.primary.text,
    },
    navItems: {
      marginTop: 10,
    },
    navItem: {
      fontSize: 16,
      color: theme.text.primary,
      marginBottom: 8,
      fontFamily: getFontStyle('body').fontFamily,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    actionButton: {
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: theme.button.success.background,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.button.error.background,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    cancelButtonText: {
      color: '#FFFFFF',
    },
    authDemo: {
      marginTop: 10,
    },
    formLabel: {
      fontSize: 14,
      color: theme.text.primary,
      marginBottom: 8,
      fontWeight: '500',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    authButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 15,
    },
    authButton: {
      paddingHorizontal: 25,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: theme.button.primary.background,
      minWidth: 90,
      alignItems: 'center',
    },
    registerButton: {
      backgroundColor: theme.button.secondary.background,
    },
    authButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    rtlText: {
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    faqSection: {
      marginTop: 10,
    },
    faqButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: theme.text.link,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    faqButtonIcon: {
      marginRight: isCurrentRTL ? 0 : 10,
      marginLeft: isCurrentRTL ? 10 : 0,
    },
    faqButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    faqDescription: {
      fontSize: 13,
      color: theme.text.tertiary,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 18,
      fontFamily: getFontStyle('caption').fontFamily,
    },
  });

  return (
    <ScrollView
      style={[styles.container, isCurrentRTL && styles.rtlContainer]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={[styles.title, isCurrentRTL && styles.rtlText]}>
          {t('home.welcome')}
        </Text>
        <Text style={[styles.subtitle, isCurrentRTL && styles.rtlText]}>
          {t('home.subtitle')}
        </Text>
      </View>

      {/* Current Language Display */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isCurrentRTL && styles.rtlText]}>
          {t('home.currentLanguage')}: {currentLang.toUpperCase()}
        </Text>
        <Text style={[styles.description, isCurrentRTL && styles.rtlText]}>
          {t('home.description')}
        </Text>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isCurrentRTL && styles.rtlText]}>
          {t('home.changeLanguage')}
        </Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              currentLang === 'en' && styles.activeButton,
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text
              style={[
                styles.buttonText,
                currentLang === 'en' && styles.activeButtonText,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              currentLang === 'fr' && styles.activeButton,
            ]}
            onPress={() => changeLanguage('fr')}
          >
            <Text
              style={[
                styles.buttonText,
                currentLang === 'fr' && styles.activeButtonText,
              ]}
            >
              Français
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Items Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isCurrentRTL && styles.rtlText]}>
          {t('navigation.home')} - {t('settings.title')}
        </Text>
        <View style={styles.navItems}>
          <Text style={[styles.navItem, isCurrentRTL && styles.rtlText]}>
            • {t('navigation.home')}
          </Text>
          <Text style={[styles.navItem, isCurrentRTL && styles.rtlText]}>
            • {t('navigation.settings')}
          </Text>
          <Text style={[styles.navItem, isCurrentRTL && styles.rtlText]}>
            • {t('navigation.profile')}
          </Text>
          <Text style={[styles.navItem, isCurrentRTL && styles.rtlText]}>
            • {t('navigation.about')}
          </Text>
        </View>
      </View>

      {/* Common Actions Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isCurrentRTL && styles.rtlText]}>
          {t('common.submit')} - {t('common.cancel')}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{t('common.submit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Auth Demo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isCurrentRTL && styles.rtlText]}>
          {t('auth.login')} / {t('auth.register')}
        </Text>
        <View style={styles.authDemo}>
          <Text style={[styles.formLabel, isCurrentRTL && styles.rtlText]}>
            {t('auth.email')}
          </Text>
          <Text style={[styles.formLabel, isCurrentRTL && styles.rtlText]}>
            {t('auth.password')}
          </Text>
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.authButton}>
              <Text style={styles.authButtonText}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authButton, styles.registerButton]}
            >
              <Text style={styles.authButtonText}>{t('auth.signUp')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* FAQ Navigation */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isCurrentRTL && styles.rtlText]}>
          Need Help?
        </Text>
        <View style={styles.faqSection}>
          <TouchableOpacity
            style={styles.faqButton}
            onPress={() => navigation.navigate('FAQ')}
            activeOpacity={0.8}
          >
            <Icon
              name="info-circle"
              size={24}
              color="#FFFFFF"
              style={styles.faqButtonIcon}
            />
            <Text style={styles.faqButtonText}>View FAQ</Text>
          </TouchableOpacity>
          <Text style={[styles.faqDescription, isCurrentRTL && styles.rtlText]}>
            Find answers to frequently asked questions
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default LocalizationDemo;
