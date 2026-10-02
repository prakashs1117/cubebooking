import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AppText from '@components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '@context/AuthContext';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Spacing, Radius } from '@theme/spacing';
import type { AuthStackParamList } from '@navigation/types';
import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';
import { tokenStorage } from '@services/storage/tokenStorage';
import { useAuthStore } from '@stores/authStore';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

// ─── Icons ─────────────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

function EmailIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="3" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" />
      <Path d="M2 8l10 6 10-6" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="3" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill={MERCK_TOKENS.tabInactive} />
    </Svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" />
          <Circle cx="12" cy="12" r="3" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" />
        </>
      ) : (
        <>
          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" strokeLinecap="round" />
          <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" strokeLinecap="round" />
          <Path d="M1 1l22 22" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.7" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────

function InputField({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[s.inputRow, focused && s.inputRowFocused]}>
      <View style={s.inputIcon}>{icon}</View>
      <TextInput
        style={s.textInput}
        placeholder={placeholder}
        placeholderTextColor={MERCK_TOKENS.tabInactive}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <EyeIcon visible={showPassword} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────

interface RegisterResponse {
  success: boolean;
  data: {
    user: { id: string; email: string; firstName: string; lastName: string; role: string };
    accessToken: string;
    refreshToken: string;
  };
}

export default function SignUpScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<NavProp>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clear = () => setError('');

  const validate = () => {
    if (!firstName.trim()) { setError('First name is required'); return false; }
    if (!lastName.trim()) { setError('Last name is required'); return false; }
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Enter a valid email address'); return false; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await apiClient.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });
      const { user: apiUser, accessToken, refreshToken } = response.data.data;
      const user = {
        id: apiUser.id,
        email: apiUser.email,
        name: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
        position: apiUser.role ?? null,
        country: null,
        alternateEmail: null,
        username: apiUser.email,
      };
      await tokenStorage.saveTokens(accessToken, refreshToken ?? accessToken);
      await tokenStorage.saveUser(user);
      useAuthStore.getState().login(user, accessToken);
      setSuccess('Account created! Signing you in…');
      setTimeout(() => {
        login({ email: email.trim().toLowerCase(), password });
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={MERCK_TOKENS.bgApp} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={s.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 5l-7 7 7 7" stroke={MERCK_TOKENS.tabInactive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <AppText style={s.backText}>Back</AppText>
            </TouchableOpacity>

            {/* Logo */}
            <View style={s.logoWrap}>
              <LinearGradient
                colors={['#2ED9A0', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.logoGradient}
              >
                <AppText style={s.logoLetter}>M</AppText>
              </LinearGradient>
            </View>

            <AppText style={s.title}>Create account</AppText>
            <AppText style={s.subtitle}>Join MerckConnect today</AppText>

            {/* Form */}
            <View style={s.form}>
              {/* Name row */}
              <View style={s.nameRow}>
                <View style={s.nameField}>
                  <InputField
                    placeholder="First name"
                    value={firstName}
                    onChangeText={t => { setFirstName(t); clear(); }}
                    icon={<UserIcon />}
                    autoCapitalize="words"
                  />
                </View>
                <View style={s.nameField}>
                  <InputField
                    placeholder="Last name"
                    value={lastName}
                    onChangeText={t => { setLastName(t); clear(); }}
                    icon={<UserIcon />}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <InputField
                placeholder="Work email"
                value={email}
                onChangeText={t => { setEmail(t); clear(); }}
                icon={<EmailIcon />}
                keyboardType="email-address"
              />

              <InputField
                placeholder="Password (min 8 characters)"
                value={password}
                onChangeText={t => { setPassword(t); clear(); }}
                icon={<LockIcon />}
                secureTextEntry
              />

              <InputField
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={t => { setConfirmPassword(t); clear(); }}
                icon={<LockIcon />}
                secureTextEntry
              />

              {!!error && (
                <View style={s.errorBox}>
                  <AppText style={s.errorText}>{error}</AppText>
                </View>
              )}

              {!!success && (
                <View style={s.successBox}>
                  <AppText style={s.successText}>{success}</AppText>
                </View>
              )}

              <TouchableOpacity
                style={[s.primaryBtn, isLoading && s.btnDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator color={MERCK_TOKENS.bgApp} />
                  : <AppText style={s.primaryBtnText}>Create Account</AppText>
                }
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={s.footer}>
              <AppText style={s.footerText}>Already have an account? </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <AppText style={s.footerLink}>Sign in</AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: MERCK_TOKENS.bgApp },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  backText: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.md,
  },

  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontSize: 24,
    fontWeight: FontWeight.bold,
  },

  title: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: 28,
  },

  form: { gap: 12 },

  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameField: { flex: 1 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MERCK_TOKENS.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    height: 52,
    paddingHorizontal: 14,
  },
  inputRowFocused: {
    borderColor: MERCK_TOKENS.green,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
    width: 20,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.md,
    fontFamily: 'Poppins-Medium',
    padding: 0,
  },
  eyeBtn: { marginLeft: 8, padding: 2 },

  errorBox: {
    backgroundColor: MERCK_TOKENS.error + '20',
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.error + '40',
  },
  errorText: {
    color: MERCK_TOKENS.error,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: MERCK_TOKENS.green + '20',
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.green + '40',
  },
  successText: {
    color: MERCK_TOKENS.green,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },

  primaryBtn: {
    backgroundColor: MERCK_TOKENS.green,
    borderRadius: Radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: {
    color: MERCK_TOKENS.bgApp,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: { color: MERCK_TOKENS.tabInactive, fontSize: FontSize.md },
  footerLink: { color: MERCK_TOKENS.green, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
