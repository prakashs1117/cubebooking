import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { AppModal, ModalConfig } from '@components/modals';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getFontStyle } from '@utils/fonts';
import { useAuth } from '@context/AuthContext';
import { validation } from '@utils/validation';
import { RootStackParamList } from '@/types/navigation';
import {
  handleApiError,
  parseApiError,
  getErrorTitle,
} from '@utils/apiErrorHandler';
import Icon from '@components/icons/Icon';
import AuthTabletHeroPanel from '@components/auth/AuthTabletHeroPanel';
import { BaseColors, useTheme } from '@theme/index';
import type { ThemeColors } from '@theme/colors';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreenTablet: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword } = useAuth();
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const isFormValid = email.trim().length > 0;

  const handleSubmit = async () => {
    setEmailError('');
    const errorKey = validation.getEmailError(email);
    if (errorKey) { setEmailError(t(errorKey)); return; }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setModal({
        variant: 'success',
        title: t('common.success'),
        message: t('auth.resetCodeSentTo', { email: email.substring(0, 3) + '***' }),
        confirmLabel: t('common.ok'),
        onConfirm: () => navigation.navigate('ResetPassword', { email }),
      });
    } catch (error) {
      const apiError = parseApiError(error);
      const errorMessage = handleApiError(error);
      setModal({ variant: 'error', title: getErrorTitle(apiError), message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const styles = getStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <AuthTabletHeroPanel
        titleKey="auth.tabletHeroForgotTitle"
        subtitleKey="auth.tabletHeroForgotSubtitle"
        features={[
          { icon: 'shield-check', textKey: 'auth.tabletHeroForgotFeature1' },
          { icon: 'mail', textKey: 'auth.tabletHeroForgotFeature2' },
          { icon: 'checkmark-circle', textKey: 'auth.tabletHeroForgotFeature3' },
        ]}
      />

      <View style={styles.rightColumn}>
        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-left" size={20} color={isDark ? '#FFFFFF' : BaseColors.merckPurple} />
          </TouchableOpacity>

          <Text style={styles.formTitle}>{t('auth.forgotPassword', { defaultValue: 'Forgot Password' })}</Text>
          <Text style={styles.subtitle}>{t('auth.forgotPasswordInstructions', { defaultValue: "Enter your email and we'll send you reset instructions." })}</Text>

          <View style={[styles.inputBox, styles.inputSpaced, emailError ? styles.inputBoxError : null]}>
            <Icon name="mail" size={18} color={theme.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={t('auth.enterEmail', { defaultValue: 'Enter email address' })}
              placeholderTextColor={theme.text.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, (!isFormValid || isLoading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{t('auth.sendResetInstructions', { defaultValue: 'Send Reset Instructions' })}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>{t('auth.rememberPassword', { defaultValue: 'Remember your password?' })}{' '}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
              <Text style={styles.signInLink}>{t('auth.signIn', { defaultValue: 'Sign In' })}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </View>
  );
};

function getStyles(theme: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.background.primary,
    },
    rightColumn: {
      flex: 1,
      backgroundColor: theme.background.primary,
      paddingHorizontal: 40,
      paddingVertical: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    formScroll: { flexGrow: 1, justifyContent: 'center', width: '100%' },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDE9F8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    formTitle: {
      fontFamily: getFontStyle('h2').fontFamily,
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 12,
    },
    subtitle: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 15,
      color: theme.text.secondary,
      lineHeight: 22,
      marginBottom: 24,
    },
    inputBox: {
      height: 52,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDE9F8',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 4,
      width: '100%',
    },
    inputSpaced: { marginTop: 16 },
    inputBoxError: { borderWidth: 1.5, borderColor: theme.text.error },
    textInput: {
      flex: 1,
      fontFamily: getFontStyle('input').fontFamily,
      fontSize: 15,
      color: theme.text.primary,
      height: '100%',
    },
    inputIcon: { marginRight: 10 },
    errorText: {
      fontFamily: getFontStyle('error').fontFamily,
      fontSize: 12,
      color: theme.text.error,
      marginBottom: 4,
      marginLeft: 4,
    },
    submitButton: {
      height: 52,
      borderRadius: 8,
      backgroundColor: BaseColors.merckPurple,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
      marginBottom: 20,
    },
    buttonDisabled: { opacity: 0.5 },
    submitButtonText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    footerPrompt: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      color: theme.text.primary,
    },
    signInLink: {
      fontFamily: getFontStyle('link').fontFamily,
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : BaseColors.merckPurple,
    },
  });
}

export default ForgotPasswordScreenTablet;
