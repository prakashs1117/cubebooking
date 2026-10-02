import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AppText from '@components/common/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, FEInput, FEButton } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { useFeAuthStore } from '@stores/feAuthStore';
import { FE_FONT_FAMILY } from '@demand/shared/fe';
import { sendPhoneOTP, verifyPhoneOTP } from '@services/fe/firebaseAuth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

type PhoneAuthPhase = 'phone' | 'otp';

const phoneOk = (p: string) => /^\+?[0-9]{10,}$/.test(p.replace(/\D/g, ''));

export default function PhoneAuthStep() {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const { setSession } = useFeAuthStore();

  const [phase, setPhase] = useState<PhoneAuthPhase>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [errors, setErrors] = useState<{ phone?: string; otp?: string; firstName?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const handleSendOTP = async () => {
    const e: typeof errors = {};
    if (!phoneOk(phone)) e.phone = 'Enter a valid phone number';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setErrors({});
    try {
      const result = await sendPhoneOTP(phone);
      setConfirmationResult(result);
      setPhase('otp');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to send OTP' });
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOTP = async () => {
    const e: typeof errors = {};
    if (otp.length < 6) e.otp = 'Enter 6-digit OTP';
    if (!firstName.trim()) e.firstName = 'Enter your name';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setErrors({});
    try {
      if (!confirmationResult) throw new Error('Confirmation not initialized');
      const { user } = await verifyPhoneOTP(confirmationResult, otp, firstName.trim());
      setSession(user);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to verify OTP' });
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'phone') {
    return (
      <AppBackground>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flex: 1, gap: 24 }}>
              <View>
                <AppText style={[styles.title, { color: t.text }]}>Sign in with phone</AppText>
                <AppText style={[styles.sub, { color: t.text2 }]}>We'll send you an OTP to verify</AppText>
              </View>

              <View style={{ gap: 14 }}>
                <FEInput
                  label="Phone number"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 234 567 8900"
                  error={errors.phone}
                  keyboardType="phone-pad"
                />

                {errors.form ? <AppText style={styles.formError}>{errors.form}</AppText> : null}

                <FEButton
                  label="Send OTP"
                  onPress={handleSendOTP}
                  loading={busy}
                  disabled={busy || !phoneOk(phone)}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, gap: 24 }}>
            <View>
              <AppText style={[styles.title, { color: t.text }]}>Verify OTP</AppText>
              <AppText style={[styles.sub, { color: t.text2 }]}>Enter the 6-digit code sent to {phone}</AppText>
            </View>

            <View style={{ gap: 14 }}>
              <FEInput
                label="Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your name"
                error={errors.firstName}
                autoCapitalize="words"
              />

              <FEInput
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                error={errors.otp}
                keyboardType="number-pad"
                maxLength={6}
              />

              {errors.form ? <AppText style={styles.formError}>{errors.form}</AppText> : null}

              <FEButton
                label="Verify & Sign in"
                onPress={handleVerifyOTP}
                loading={busy}
                disabled={busy || otp.length < 6 || !firstName.trim()}
              />

              <FEButton
                label="Change phone number"
                onPress={() => {
                  setPhase('phone');
                  setOtp('');
                  setErrors({});
                }}
                variant="ghost"
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
});
