import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, Ring, FEGlyph, FEInput, FEButton, Pressable, Avatar } from '@components/fe';
import SocialAuthIconButtons from '@components/fe/organisms/SocialAuthIconButtons';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';
import { googleSignup, facebookSignup } from '@services/fe/firebaseAuth';

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e);

export default function SignupStep({
  score,
  onRegister,
  onBack,
  onSocialLogin,
  onSkip,
}: {
  score: number;
  onRegister: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  onSocialLogin?: (user: any) => void;
  onSkip?: () => void;
}) {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e: typeof err = {};
    if (!emailOk(email)) e.email = 'Enter a valid email';
    if (password.length < 8) e.password = 'At least 8 characters';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await onRegister(email.trim(), password);
    } catch (ex) {
      setErr({ form: ex instanceof Error ? ex.message : 'Could not create account' });
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignup = async () => {
    setBusy(true);
    setErr({});
    try {
      const { user } = await googleSignup();
      onSocialLogin?.(user);
    } catch (ex) {
      setErr({ form: ex instanceof Error ? ex.message : 'Google sign-up failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleFacebookSignup = async () => {
    setBusy(true);
    setErr({});
    try {
      const { user } = await facebookSignup();
      onSocialLogin?.(user);
    } catch (ex) {
      setErr({ form: ex instanceof Error ? ex.message : 'Facebook sign-up failed' });
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    setBusy(true);
    try {
      onSkip?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppBackground>
      <View style={[styles.pad, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onBack} scale={0.9} style={[styles.back, { backgroundColor: t.card, borderColor: t.stroke }]}>
          <FEGlyph name="back" size={18} color={t.text2} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24, flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', gap: 14 }}>
          <View>
            <Ring value={score} size={128} stroke={11} label={String(score)} sublabel="YOUR SCORE" />
            <View style={[styles.lockBadge, { backgroundColor: t.sheet, borderColor: t.stroke2 }]}>
              <FEGlyph name="lock" size={16} color={t.aText} />
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.h1, { color: t.text }]}>Save your score & plan</Text>
            <Text style={[styles.sub, { color: t.text2 }]}>
              Create a free account so your 30-day path, streak and recordings are waiting when you come back.
            </Text>
          </View>
        </View>

        {!showForm ? (
          <View style={{ gap: 20, marginTop: 26 }}>
            <FEButton label="Sign up with email" onPress={() => setShowForm(true)} />
            {err.form ? <Text style={styles.formErr}>{err.form}</Text> : null}

            <View style={{ gap: 12, alignItems: 'center' }}>
              <Text style={[styles.dividerText, { color: t.text2 }]}>Or continue with</Text>
              <SocialAuthIconButtons
                onGoogle={handleGoogleSignup}
                onFacebook={handleFacebookSignup}
                disabled={busy}
                loading={busy}
                size="medium"
              />
            </View>

            {handleSkip && (
              <FEButton label="Skip for now" onPress={handleSkip} variant="ghost" />
            )}
          </View>
        ) : (
          <View style={{ gap: 12, marginTop: 22 }}>
            <FEInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" error={err.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <FEInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" error={err.password} secureTextEntry />
            {err.form ? <Text style={styles.formErr}>{err.form}</Text> : null}
            <FEButton label="Create account" onPress={submit} loading={busy} style={{ marginTop: 4 }} />
          </View>
        )}

        <View style={styles.proof}>
          <View style={{ flexDirection: 'row' }}>
            {['Priya', 'Karthik', 'Meera', 'Sam'].map((n, i) => (
              <View key={n} style={{ marginLeft: i ? -8 : 0 }}>
                <Avatar name={n} size={26} />
              </View>
            ))}
          </View>
          <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text2, fontWeight: '600' }}>
            Join <Text style={{ color: t.text, fontWeight: '700' }}>40,000+</Text> speakers
          </Text>
        </View>
      </ScrollView>
      <Text style={[styles.terms, { color: t.text3, paddingBottom: insets.bottom + 12 }]}>
        By continuing you agree to our Terms & Privacy Policy.
      </Text>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 24 },
  back: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  lockBadge: { position: 'absolute', bottom: 4, right: 4, width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: FE_FONT_FAMILY, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 28, textAlign: 'center' },
  sub: { fontFamily: FE_FONT_FAMILY, fontSize: 14, marginTop: 8, lineHeight: 21, textAlign: 'center', maxWidth: 290 },
  formErr: { fontFamily: FE_FONT_FAMILY, fontSize: 13, color: '#E11D48', textAlign: 'center' },
  dividerText: { fontFamily: FE_FONT_FAMILY, fontSize: 12, fontWeight: '500', textAlign: 'center' },
  proof: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 22 },
  terms: { fontFamily: FE_FONT_FAMILY, fontSize: 11, textAlign: 'center', paddingHorizontal: 24 },
});
