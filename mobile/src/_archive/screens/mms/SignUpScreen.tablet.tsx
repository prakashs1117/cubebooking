import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
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
import OTPBottomSheet from '@components/auth/OTPBottomSheet';
import AuthTabletHeroPanel from '@components/auth/AuthTabletHeroPanel';
import { BaseColors, useTheme } from '@theme/index';
import type { ThemeColors } from '@theme/colors';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignUp'
>;

const SignUpScreenTablet: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { register, fetchCaptcha } = useAuth();
  const { theme, isDark } = useTheme();

  const [showOTPSheet, setShowOTPSheet] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaIdentifier, setCaptchaIdentifier] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [agreementError, setAgreementError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const loadCaptcha = useCallback(async () => {
    setIsCaptchaLoading(true);
    setCaptchaAnswer('');
    setCaptchaError('');
    try {
      const result = await fetchCaptcha();
      setCaptchaImage(result.image);
      setCaptchaIdentifier(result.identifier);
    } catch {
      setCaptchaError(
        t('auth.captchaLoadFailed', { defaultValue: 'Failed to load captcha. Tap refresh.' }),
      );
    } finally {
      setIsCaptchaLoading(false);
    }
  }, [fetchCaptcha, t]);

  useEffect(() => { loadCaptcha(); }, [loadCaptcha]);

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    captchaAnswer.trim().length > 0 &&
    agreementAccepted;

  const handleSignUp = async () => {
    if (!agreementAccepted) {
      setAgreementError(
        t('auth.agreementRequired', {
          defaultValue: 'You must accept the Privacy Policy to continue',
        }),
      );
      return;
    }

    setAgreementError('');
    setNameError(''); setEmailError(''); setPasswordError('');
    setConfirmPasswordError(''); setCaptchaError('');

    let hasError = false;

    if (!name.trim()) {
      setNameError(t('validation.nameRequired', { defaultValue: 'Name is required' }));
      hasError = true;
    }
    const emailErrKey = validation.getEmailError(email);
    if (emailErrKey) { setEmailError(t(emailErrKey)); hasError = true; }

    const passwordErrKey = validation.getPasswordError(password, true);
    if (passwordErrKey) { setPasswordError(t(passwordErrKey)); hasError = true; }

    const confirmErrKey = validation.getPasswordConfirmError(password, confirmPassword);
    if (confirmErrKey) { setConfirmPasswordError(t(confirmErrKey)); hasError = true; }

    if (!captchaAnswer.trim()) {
      setCaptchaError(t('auth.captchaRequired', { defaultValue: 'Please enter the captcha' }));
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await register({ email, name, password, agreement: true, recaptchaToken: captchaAnswer, identifier: captchaIdentifier });
      setRegisteredEmail(email);
      setShowOTPSheet(true);
    } catch (error) {
      const apiError = parseApiError(error);
      const errorMessage = handleApiError(error);
      setModal({ variant: 'error', title: getErrorTitle(apiError), message: errorMessage });
      loadCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const styles = getStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <AuthTabletHeroPanel
        titleKey="auth.tabletHeroSignUpTitle"
        subtitleKey="auth.tabletHeroSignUpSubtitle"
        features={[
          { icon: 'shield-check', textKey: 'auth.tabletHeroSignUpFeature1' },
          { icon: 'checkmark-circle', textKey: 'auth.tabletHeroSignUpFeature2' },
          { icon: 'bookmark', textKey: 'auth.tabletHeroSignUpFeature3' },
        ]}
      />

      <View style={styles.rightColumn}>
        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>{t('auth.createAccount', { defaultValue: 'Create Account' })}</Text>

          <View style={[styles.inputBox, nameError ? styles.inputBoxError : null]}>
            <Icon name="user" size={18} color={theme.text.secondary} style={styles.inputIcon} />
            <TextInput style={styles.textInput} placeholder={t('auth.namePlaceholder', { defaultValue: 'Full name' })} placeholderTextColor={theme.text.placeholder} value={name} onChangeText={setName} autoCapitalize="words" autoCorrect={false} />
          </View>
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <View style={[styles.inputBox, styles.inputSpaced, emailError ? styles.inputBoxError : null]}>
            <Icon name="mail" size={18} color={theme.text.secondary} style={styles.inputIcon} />
            <TextInput style={styles.textInput} placeholder={t('auth.enterEmail', { defaultValue: 'Enter email address' })} placeholderTextColor={theme.text.placeholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={[styles.inputBox, styles.inputSpaced, passwordError ? styles.inputBoxError : null]}>
            <TextInput style={styles.textInput} placeholder={t('auth.password', { defaultValue: 'Password' })} placeholderTextColor={theme.text.placeholder} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggle}>
              <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <View style={[styles.inputBox, styles.inputSpaced, confirmPasswordError ? styles.inputBoxError : null]}>
            <TextInput style={styles.textInput} placeholder={t('auth.confirmPassword', { defaultValue: 'Confirm password' })} placeholderTextColor={theme.text.placeholder} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} autoCapitalize="none" autoCorrect={false} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeToggle}>
              <Icon name={showConfirmPassword ? 'eye' : 'eye-slash'} size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

          <View style={styles.captchaSection}>
            <View style={styles.captchaRow}>
              <View style={styles.captchaImageBox}>
                {isCaptchaLoading ? (
                  <ActivityIndicator color={isDark ? '#FFFFFF' : BaseColors.merckPurple} />
                ) : captchaImage ? (
                  <Image source={{ uri: captchaImage }} style={styles.captchaImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.captchaPlaceholder}>{t('auth.captchaLoadFailed', { defaultValue: 'Failed to load' })}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.captchaRefresh} onPress={loadCaptcha} disabled={isCaptchaLoading} activeOpacity={0.7}>
                <Icon name="refresh-square" size={32} color={isDark ? '#FFFFFF' : BaseColors.merckPurple} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputBox, styles.inputSpaced, captchaError ? styles.inputBoxError : null]}>
              <Icon name="shield-check" size={18} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder={t('auth.captchaPlaceholder', { defaultValue: 'Enter captcha' })} placeholderTextColor={theme.text.placeholder} value={captchaAnswer} onChangeText={setCaptchaAnswer} autoCapitalize="none" autoCorrect={false} />
            </View>
            {captchaError ? <Text style={styles.errorText}>{captchaError}</Text> : null}
          </View>

          {/* Agreement Row */}
          <View style={styles.agreementRow}>
            <TouchableOpacity
              onPress={() => setAgreementAccepted(!agreementAccepted)}
              style={styles.agreementCheckbox}
              activeOpacity={0.7}
            >
              <Icon
                name={agreementAccepted ? 'check-square' : 'square'}
                size={20}
                color={
                  agreementAccepted
                    ? BaseColors.merckPurple
                    : theme.border.primary
                }
              />
            </TouchableOpacity>
            <View style={styles.agreementTextContainer}>
              <Text style={styles.agreementText}>
                {t('auth.iAgreeTo', { defaultValue: 'I agree to the ' })}
                <Text
                  style={styles.agreementLink}
                  onPress={() => setShowLegalModal(true)}
                >
                  {t('auth.privacyPolicy', {
                    defaultValue: 'Privacy Policy',
                  })}
                </Text>
                {t('auth.and', { defaultValue: ' and ' })}
                <Text
                  style={styles.agreementLink}
                  onPress={() => setShowLegalModal(true)}
                >
                  {t('auth.disclaimer', {
                    defaultValue: 'Disclaimer',
                  })}
                </Text>
              </Text>
            </View>
          </View>
          {agreementError ? (
            <Text style={styles.errorText}>{agreementError}</Text>
          ) : null}

          <TouchableOpacity style={[styles.signUpButton, (!isFormValid || isLoading) && styles.buttonDisabled]} onPress={handleSignUp} disabled={!isFormValid || isLoading} activeOpacity={0.85}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signUpButtonText}>{t('auth.signUp', { defaultValue: 'Create Account' })}</Text>}
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInPrompt}>{t('auth.alreadyHaveAccount', { defaultValue: 'Already have an account?' })}{' '}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
              <Text style={styles.signInLink}>{t('auth.signIn', { defaultValue: 'Sign In' })}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <AppModal config={modal} onClose={() => setModal(null)} />

      <TermsAndPrivacyModal
        visible={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        onAccept={() => {
          setAgreementAccepted(true);
          setAgreementError('');
          setShowLegalModal(false);
        }}
        requireAcceptance={true}
      />

      {showOTPSheet && <OTPBottomSheet email={registeredEmail} onClose={() => setShowOTPSheet(false)} />}
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
    formTitle: {
      fontFamily: getFontStyle('h2').fontFamily,
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 24,
      textAlign: 'center',
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
    inputSpaced: { marginTop: 12 },
    inputBoxError: { borderWidth: 1.5, borderColor: theme.text.error },
    textInput: {
      flex: 1,
      fontFamily: getFontStyle('input').fontFamily,
      fontSize: 15,
      color: theme.text.primary,
      height: '100%',
    },
    eyeToggle: { paddingLeft: 8 },
    inputIcon: { marginRight: 10 },
    errorText: {
      fontFamily: getFontStyle('error').fontFamily,
      fontSize: 12,
      color: theme.text.error,
      marginBottom: 4,
      marginLeft: 4,
    },
    captchaSection: { marginTop: 16 },
    captchaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    captchaImageBox: {
      flex: 1,
      height: 60,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDE9F8',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    captchaImage: { width: '100%', height: '100%' },
    captchaPlaceholder: { fontSize: 12, color: theme.text.secondary },
    captchaRefresh: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDE9F8',
      alignItems: 'center',
      justifyContent: 'center',
    },
    agreementRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 16,
      marginBottom: 12,
      gap: 10,
    },
    agreementCheckbox: {
      width: 24,
      height: 24,
      marginTop: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    agreementTextContainer: {
      flex: 1,
    },
    agreementText: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 13,
      color: theme.text.primary,
      lineHeight: 18,
    },
    agreementLink: {
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : BaseColors.merckPurple,
      textDecorationLine: 'underline',
    },
    signUpButton: {
      height: 52,
      borderRadius: 8,
      backgroundColor: BaseColors.merckPurple,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
      marginBottom: 16,
    },
    buttonDisabled: { opacity: 0.5 },
    signUpButtonText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    signInRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    signInPrompt: {
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

export default SignUpScreenTablet;
