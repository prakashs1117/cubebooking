import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { getFontStyle } from '@utils/fonts';
import { isRTLLanguage } from '@utils/rtlUtils';
import { useDeviceType } from '@hooks/useDeviceType';
import Icon from '@components/icons/Icon';

type ScreenHint = 'signin' | 'signup' | 'forgot';

interface AuthLayoutProps {
  children: ReactNode;
  screenHint?: ScreenHint;
}

const getScreenContent = (screenHint?: ScreenHint) => {
  const content: Record<ScreenHint, { title: string; subtitle: string }> = {
    signin: {
      title: 'Welcome Back',
      subtitle: 'Sign in to access your safety data',
    },
    signup: {
      title: 'Join My M Safety',
      subtitle: 'Create your account to get started',
    },
    forgot: {
      title: 'Reset Password',
      subtitle: 'We\'ll help you get back in safely',
    },
  };
  return content[screenHint || 'signin'];
};

const features = [
  { icon: 'shield', text: 'Access 500,000+ Safety Data Sheets' },
  { icon: 'qrcode', text: 'Scan barcodes to find chemicals instantly' },
  { icon: 'star', text: 'Save your favourites for quick access' },
  { icon: 'globe', text: 'Available across EU, NA & CN regions' },
];

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, screenHint }) => {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const { isTablet } = useDeviceType();
  const isRTL = isRTLLanguage(i18n.language);
  const screenContent = getScreenContent(screenHint);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      flexDirection: isTablet ? (isRTL ? 'row-reverse' : 'row') : 'column',
    },
    welcomeSection: {
      flex: isTablet ? 1 : 0,
      backgroundColor: BaseColors.merckPurpleDark,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 60 : 40,
      paddingVertical: isTablet ? 60 : 40,
      display: isTablet ? 'flex' : 'none',
    },
    decorativeCircle: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      top: -150,
      right: isRTL ? undefined : -150,
      left: isRTL ? -150 : undefined,
    },
    decorativeCircle2: {
      position: 'absolute',
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      bottom: -80,
      left: isRTL ? undefined : -80,
      right: isRTL ? -80 : undefined,
    },
    decorativeCircle3: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      bottom: 100,
      right: isRTL ? undefined : 50,
      left: isRTL ? 50 : undefined,
    },
    welcomeContent: {
      maxWidth: 380,
      alignItems: 'center',
      zIndex: 1,
    },
    logoBg: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    logoImage: {
      width: 70,
      height: 70,
      tintColor: '#FFFFFF',
    },
    welcomeTitle: {
      fontFamily: getFontStyle('h1').fontFamily,
      fontSize: 32,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    welcomeSubtitleText: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.85)',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    featuresList: {
      width: '100%',
      marginBottom: 36,
    },
    featureRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      gap: 12,
    },
    featureIcon: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
      flexShrink: 0,
    },
    featureText: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 20,
      flex: 1,
    },
    tagline: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    formSection: {
      flex: isTablet ? 1 : 1,
      backgroundColor: theme.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isTablet ? 60 : 20,
      paddingVertical: isTablet ? 40 : 12,
      justifyContent: isTablet ? 'center' : undefined,
      maxWidth: isTablet ? 480 : undefined,
      alignSelf: isTablet ? 'center' : undefined,
      width: isTablet ? '100%' : undefined,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentContainer}>
          {isTablet && (
            <View style={styles.welcomeSection}>
              <View style={styles.decorativeCircle} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.decorativeCircle3} />

              <View style={styles.welcomeContent}>
                <View style={styles.logoBg}>
                  <Image
                    source={require('@assets/merck-logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.welcomeTitle}>{screenContent.title}</Text>
                <Text style={styles.welcomeSubtitleText}>
                  {screenContent.subtitle}
                </Text>

                <View style={styles.featuresList}>
                  {features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <View style={styles.featureIcon}>
                        <Icon
                          name={feature.icon as any}
                          size={20}
                          color="rgba(255, 255, 255, 0.75)"
                        />
                      </View>
                      <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.tagline}>
                  "Keeping you safe, wherever you work"
                </Text>
              </View>
            </View>
          )}

          <View style={styles.formSection}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthLayout;
