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
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getFontStyle } from '@utils/fonts';
import AppleIcon from '@assets/icon-apple';
import { useAuth } from '@context/AuthContext';
import { validation } from '@utils/validation';
import { RootStackParamList } from '@/types/navigation';
import Icon from '@components/icons/Icon';
import AuthTabletHeroPanel from '@components/auth/AuthTabletHeroPanel';
import { BaseColors, useTheme } from '@theme/index';
import type { ThemeColors } from '@theme/colors';

const LinkedInIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M7.1 9.5H4.6V19h2.5V9.5zm-1.25-4a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9zM19.4 13.2c0-2.3-1.2-3.7-3.1-3.7-1 0-1.9.5-2.3 1.2V9.5h-2.5V19H14v-5.1c0-1.1.6-1.8 1.6-1.8.9 0 1.4.6 1.4 1.8V19h2.5v-5.8z" />
  </Svg>
);

// Separate component to isolate button re-renders
const SignInButton: React.FC<{
  isLoading: boolean;
  isFormValid: boolean;
  onPress: () => void;
  theme: ThemeColors;
}> = ({ isLoading, isFormValid, onPress, theme }) => {
  const { t } = useTranslation();
  const styles = getStyles(theme, false);

  return (
    <TouchableOpacity
      style={[styles.logInButton, (!isFormValid || isLoading) && styles.logInButtonDisabled]}
      onPress={onPress}
      disabled={!isFormValid || isLoading}
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.logInButtonText}>{t('auth.logIn', { defaultValue: 'Log In' })}</Text>
      )}
    </TouchableOpacity>
  );
};

const GuestIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = BaseColors.merckPurple,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G>
      <Circle cx="12" cy="8" r="4" fill={color} />
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

type SignInScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignIn'
>;

const SignInScreenTablet: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { login, continueAsGuest } = useAuth();
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = async () => {
    // Clear field-level errors immediately
    setEmailError('');
    setPasswordError('');

    let hasError = false;

    const emailErrKey = validation.getEmailError(email);
    if (emailErrKey) {
      setEmailError(t(emailErrKey));
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError(t('validation.passwordRequired'));
      hasError = true;
    }

    if (hasError) return;

    // Only clear API error AFTER we've validated inputs and we're about to make the request
    setApiError('');
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (error: any) {
      let errorMsg = 'An error occurred. Please try again.';
      const status = error?.response?.status;
      const responseData = error?.response?.data;

      // Priority 1: Check status code for standard messages
      if (status === 403) {
        errorMsg = 'Your account has been disabled. Please contact support.';
      } else if (status === 401) {
        errorMsg = 'Invalid email or password. Please try again.';
      }
      // Priority 2: Try to get error from API response
      else if (responseData?.error && typeof responseData.error === 'string') {
        errorMsg = responseData.error;
      } else if (responseData?.message && typeof responseData.message === 'string') {
        errorMsg = responseData.message;
      }
      // Priority 3: Fallback to error message
      else if (error?.message && typeof error.message === 'string') {
        errorMsg = error.message;
      }

      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = () => {};
  const handleLinkedInSignIn = () => {};
  const handleContinueWithoutRegistering = () => { continueAsGuest(); };
  const handleForgotPassword = () => { navigation.navigate('ForgotPassword'); };
  const handleSignUp = () => { navigation.navigate('SignUp'); };

  const styles = getStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <AuthTabletHeroPanel
        titleKey="auth.tabletHeroSignInTitle"
        subtitleKey="auth.tabletHeroSignInSubtitle"
        features={[
          { icon: 'document', textKey: 'auth.tabletHeroSignInFeature1' },
          { icon: 'barcode', textKey: 'auth.tabletHeroSignInFeature2' },
          { icon: 'bookmark', textKey: 'auth.tabletHeroSignInFeature3' },
        ]}
      />

      <View style={styles.rightColumn}>
        <ScrollView
          contentContainerStyle={styles.formScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formTitle}>
            {t('auth.logIn', { defaultValue: 'Log In' })}
          </Text>

          <View style={[styles.inputBox, emailError ? styles.inputBoxError : null]}>
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

          <View style={[styles.inputBox, styles.inputBoxSpaced, passwordError ? styles.inputBoxError : null]}>
            <TextInput
              style={styles.textInput}
              placeholder={t('auth.password', { defaultValue: 'Password' })}
              placeholderTextColor={theme.text.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.visibilityToggle} activeOpacity={0.7}>
              <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity style={styles.forgotPasswordRow} onPress={handleForgotPassword} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>
              {t('auth.forgotPassword', { defaultValue: 'Forgot password?' })}
            </Text>
          </TouchableOpacity>

          {apiError ? (
            <Text style={styles.apiErrorText}>{apiError}</Text>
          ) : null}

          <SignInButton
            isLoading={isLoading}
            isFormValid={isFormValid}
            onPress={handleSignIn}
            theme={theme}
          />

          <View style={styles.signUpRow}>
            <Text style={styles.signUpPrompt}>
              {t('auth.dontHaveAccount', { defaultValue: "Don't Have an account?" })}{' '}
            </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.createAccountLink}>
                {t('auth.createAccount', { defaultValue: 'Create Account' })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>{t('auth.orContinueWith', { defaultValue: 'Or continue with' })}</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleAppleSignIn} activeOpacity={0.8}>
              <View style={[styles.socialIcon, { backgroundColor: isDark ? '#3A3A3C' : '#1C1C1E' }]}>
                <AppleIcon size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialLabel}>{t('auth.apple', { defaultValue: 'Apple' })}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} onPress={handleLinkedInSignIn} activeOpacity={0.8}>
              <View style={[styles.socialIcon, { backgroundColor: '#007AB3' }]}>
                <LinkedInIcon size={22} />
              </View>
              <Text style={styles.socialLabel}>{t('auth.linkedin', { defaultValue: 'LinkedIn' })}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} onPress={handleContinueWithoutRegistering} activeOpacity={0.8}>
              <View style={[styles.socialIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F0FA' }]}>
                <GuestIcon size={22} color={isDark ? '#FFFFFF' : BaseColors.merckPurple} />
              </View>
              <Text style={styles.socialLabel}>{t('auth.guest', { defaultValue: 'Guest' })}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
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
    formScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      width: '100%',
    },
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
    inputBoxSpaced: { marginTop: 12 },
    inputBoxError: { borderWidth: 1.5, borderColor: theme.text.error },
    textInput: {
      flex: 1,
      fontFamily: getFontStyle('input').fontFamily,
      fontSize: 15,
      color: theme.text.primary,
      height: '100%',
    },
    inputIcon: { marginRight: 10 },
    visibilityToggle: { paddingLeft: 8 },
    errorText: {
      fontFamily: getFontStyle('error').fontFamily,
      fontSize: 12,
      color: theme.text.error,
      marginBottom: 4,
      marginLeft: 4,
    },
    apiErrorText: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      color: theme.text.error,
      marginBottom: 16,
      marginTop: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(220, 54, 54, 0.1)' : 'rgba(220, 54, 54, 0.08)',
      textAlign: 'center',
      lineHeight: 20,
    },
    forgotPasswordRow: {
      alignSelf: 'flex-end',
      marginBottom: 20,
      marginTop: 8,
    },
    forgotPasswordText: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : BaseColors.merckPurple,
    },
    logInButton: {
      height: 52,
      borderRadius: 8,
      backgroundColor: BaseColors.merckPurple,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    logInButtonDisabled: { opacity: 0.5 },
    logInButtonText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    signUpRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    signUpPrompt: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      color: theme.text.primary,
    },
    createAccountLink: {
      fontFamily: getFontStyle('link').fontFamily,
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : BaseColors.merckPurple,
    },
    orRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 10,
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border.primary,
    },
    orText: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 13,
      color: theme.text.secondary,
    },
    socialRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
      marginBottom: 8,
    },
    socialBtn: { alignItems: 'center', gap: 6 },
    socialIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    socialLabel: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 12,
      fontWeight: '500',
      color: theme.text.secondary,
    },
  });
}

export default SignInScreenTablet;
