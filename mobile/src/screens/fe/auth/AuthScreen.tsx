import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AppText from '@components/common/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, Segmented, FEInput, FEButton, Pressable } from '@components/fe';
import SocialAuthIconButtons from '@components/fe/organisms/SocialAuthIconButtons';
import { useFETheme } from '@theme/useFETheme';
import { useFeAuthStore } from '@stores/feAuthStore';
import { FE_FONT_FAMILY } from '@demand/shared/fe';
import { FE_DEMO_CREDENTIALS as DEMO } from '@services/fe/feApi';
import { googleSignup, facebookSignup } from '@services/fe/firebaseAuth';
import PhoneAuthStep from '@screens/fe/auth/PhoneAuthStep';

type Mode = 'signin' | 'signup';
type AuthMethod = 'email' | 'phone';

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e);

export default function AuthScreen() {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const { login, register, setSession } = useFeAuthStore();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [mode, setMode] = useState<Mode>('signin');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (mode === 'signup' && firstName.trim().length < 2) e.firstName = 'Enter your name';
    if (!emailOk(email)) e.email = 'Enter a valid email';
    if (password.length < 8) e.password = 'At least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    setErrors({});
    try {
      if (mode === 'signin') await login(email.trim(), password);
      else await register({ email: email.trim(), password, firstName: firstName.trim() });
      // On success the auth store flips to 'authed' → RootNavigator swaps to the app.
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setBusy(false);
    }
  };

  const continueAsGuest = async () => {
    setBusy(true);
    setErrors({});
    try {
      await login(DEMO.email, DEMO.password);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Could not start demo' });
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignup = async () => {
    setBusy(true);
    setErrors({});
    try {
      const { user } = await googleSignup();
      setSession(user);
      // Store will flip to 'authed' → RootNavigator swaps to the app
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Google sign-up failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleFacebookSignup = async () => {
    setBusy(true);
    setErrors({});
    try {
      const { user } = await facebookSignup();
      setSession(user);
      // Store will flip to 'authed' → RootNavigator swaps to the app
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Facebook sign-up failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    setBusy(true);
    setErrors({});
    try {
      // Skip auth - go directly to app with demo user
      await continueAsGuest();
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Could not skip' });
    } finally {
      setBusy(false);
    }
  };

  // Show phone auth step if selected
  if (authMethod === 'phone') {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.methodSwitcher, { paddingTop: insets.top, paddingHorizontal: 24 }]}>
          <Pressable onPress={() => setAuthMethod('email')} disabled={busy} style={{ padding: 8 }}>
            <AppText style={[styles.methodLink, { color: t.text2 }]}>← Back to Email</AppText>
          </Pressable>
          <Pressable onPress={handleSkip} disabled={busy} style={{ padding: 8 }}>
            <AppText style={[styles.skipButton, { color: t.text2 }]}>Skip</AppText>
          </Pressable>
        </View>
        <PhoneAuthStep />
      </View>
    );
  }

  return (
    <AppBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.title, { color: t.text }]}>
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </AppText>
              <AppText style={[styles.sub, { color: t.text2 }]}>Start your daily speaking practice</AppText>
            </View>
            <Pressable onPress={handleSkip} disabled={busy} style={{ padding: 8 }}>
              <AppText style={[styles.skipButton, { color: t.text2 }]}>Skip</AppText>
            </Pressable>
          </View>

          <View style={{ marginTop: 24, marginBottom: 20 }}>
            <Segmented
              options={[
                { id: 'signin', label: 'Sign in' },
                { id: 'signup', label: 'Sign up' },
              ]}
              value={mode}
              onChange={(id) => {
                setMode(id as Mode);
                setErrors({});
              }}
            />
          </View>

          <View style={{ gap: 14 }}>
            {mode === 'signup' && (
              <FEInput label="Full name" value={firstName} onChangeText={setFirstName} placeholder="Arun Kumar" error={errors.firstName} autoCapitalize="words" />
            )}
            <FEInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <FEInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" error={errors.password} secureTextEntry />

            {errors.form ? <AppText style={styles.formError}>{errors.form}</AppText> : null}

            <FEButton label={mode === 'signin' ? 'Sign in' : 'Create account'} onPress={submit} loading={busy} style={{ marginTop: 6 }} />

            <View style={{ gap: 12, marginTop: 16 }}>
              <AppText style={[styles.dividerText, { color: t.text2 }]}>Or continue with</AppText>
              <SocialAuthIconButtons
                onGoogle={handleGoogleSignup}
                onFacebook={handleFacebookSignup}
                disabled={busy}
                loading={busy}
                size="medium"
              />
            </View>

            <View style={{ gap: 8, marginTop: 12 }}>
              <FEButton
                label="Sign in with phone"
                onPress={() => setAuthMethod('phone')}
                variant="ghost"
                disabled={busy}
              />
              <FEButton
                label="Continue as guest"
                variant="ghost"
                onPress={continueAsGuest}
                disabled={busy}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 24, flexGrow: 1 },
  title: { fontFamily: FE_FONT_FAMILY, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  sub: { fontFamily: FE_FONT_FAMILY, fontSize: 14, fontWeight: '500', marginTop: 4 },
  formError: { fontFamily: FE_FONT_FAMILY, fontSize: 13, color: '#E11D48', textAlign: 'center' },
  dividerText: { fontFamily: FE_FONT_FAMILY, fontSize: 12, fontWeight: '500', textAlign: 'center', marginTop: 8 },
  skipButton: { fontFamily: FE_FONT_FAMILY, fontSize: 14, fontWeight: '600' },
  methodSwitcher: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 },
  methodLink: { fontFamily: FE_FONT_FAMILY, fontSize: 14, fontWeight: '600' },
});
