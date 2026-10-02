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

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

// ─── Icons ─────────────────────────────────────────────────────────────────

function EmailIcon({ focused }: { focused: boolean }) {
  const color = focused ? MERCK_TOKENS.green : MERCK_TOKENS.tabInactive;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.7" />
      <Path d="M2 8l10 6 10-6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon({ focused }: { focused: boolean }) {
  const color = focused ? MERCK_TOKENS.green : MERCK_TOKENS.tabInactive;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="3" stroke={color} strokeWidth="1.7" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
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

function MicrosoftIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <Rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <Rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <Rect x="13" y="13" width="9" height="9" fill="#FFB900" />
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

export default function SignInScreen() {
  const { login, loginWithSso, isLoading } = useAuth();
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState(__DEV__ ? 'prakash@merckgroup.com' : '');
  const [password, setPassword] = useState(__DEV__ ? 'SecurePass123!' : '');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Sign in failed. Please check your credentials.');
    }
  };

  const handleDevDirectFetch = async () => {
    setError('');
    try {
      const res = await fetch('https://merck-connect.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      console.log('[DEV fetch] status:', res.status, 'body:', JSON.stringify(json));
      setError(`[DEV] status:${res.status} — ${JSON.stringify(json).slice(0, 120)}`);
    } catch (err: any) {
      console.error('[DEV fetch] error:', err);
      setError(`[DEV fetch error] ${err?.message}`);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={MERCK_TOKENS.bgApp} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.kav}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo mark */}
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

            {/* Heading */}
            <AppText style={s.title}>Welcome back</AppText>
            <AppText style={s.subtitle}>Sign in to MerckConnect</AppText>

            {/* Form */}
            <View style={s.form}>
              <InputField
                placeholder="Work email"
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                icon={<EmailIcon focused={false} />}
                keyboardType="email-address"
              />
              <InputField
                placeholder="Password"
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                icon={<LockIcon focused={false} />}
                secureTextEntry
              />

              {/* Forgot password */}
              <TouchableOpacity style={s.forgotRow} activeOpacity={0.7}>
                <AppText style={s.forgotText}>Forgot password?</AppText>
              </TouchableOpacity>

              {/* Error */}
              {!!error && (
                <View style={s.errorBox}>
                  <AppText style={s.errorText}>{error}</AppText>
                </View>
              )}

              {/* Sign in button */}
              <TouchableOpacity
                style={[s.primaryBtn, isLoading && s.btnDisabled]}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator color={MERCK_TOKENS.bgApp} />
                  : <AppText style={s.primaryBtnText}>Sign In</AppText>
                }
              </TouchableOpacity>

              {/* Divider */}
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <AppText style={s.dividerLabel}>or continue with</AppText>
                <View style={s.dividerLine} />
              </View>

              {/* SSO */}
              <TouchableOpacity style={s.ssoBtn} onPress={loginWithSso} activeOpacity={0.8}>
                <MicrosoftIcon />
                <AppText style={s.ssoBtnText}>Microsoft SSO</AppText>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={s.footer}>
              <AppText style={s.footerText}>Don't have an account? </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <AppText style={s.footerLink}>Sign up</AppText>
              </TouchableOpacity>
            </View>

            {/* DEV shortcut */}
            {__DEV__ && (
              <>
                <TouchableOpacity
                  style={s.devHint}
                  onPress={() => { setEmail('admin@merckgroup.com'); setPassword('Demo1234!'); setError(''); }}
                >
                  <AppText style={s.devHintText}>DEV — tap to fill credentials</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.devHint, { marginTop: 8, borderColor: '#f59e0b' }]}
                  onPress={handleDevDirectFetch}
                >
                  <AppText style={[s.devHintText, { color: '#f59e0b' }]}>DEV — raw fetch (bypass apiClient)</AppText>
                </TouchableOpacity>
              </>
            )}
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontSize: 28,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },

  // Heading
  title: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize['5xl'],
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: 32,
  },

  // Form
  form: { gap: 12 },

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
  eyeBtn: {
    marginLeft: 8,
    padding: 2,
  },

  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: {
    color: MERCK_TOKENS.green,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

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

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: MERCK_TOKENS.borderDefault,
  },
  dividerLabel: {
    color: MERCK_TOKENS.tabInactive,
    fontSize: FontSize.xs,
    marginHorizontal: 12,
  },

  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MERCK_TOKENS.bgSurface,
    borderRadius: Radius.md,
    height: 52,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    gap: 10,
  },
  ssoBtnText: {
    color: MERCK_TOKENS.headerText,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: { color: MERCK_TOKENS.tabInactive, fontSize: FontSize.md },
  footerLink: { color: MERCK_TOKENS.green, fontSize: FontSize.md, fontWeight: FontWeight.bold },

  devHint: {
    marginTop: 20,
    padding: 12,
    backgroundColor: MERCK_TOKENS.bgSurface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: MERCK_TOKENS.borderDefault,
    alignItems: 'center',
  },
  devHintText: { color: MERCK_TOKENS.tabInactive, fontSize: FontSize.xs },
});
