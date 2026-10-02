import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { useTheme } from '@theme/index';
import { MERCK_TOKENS } from '@theme/merckTokens';
import CustomText from '@components/common/CustomText';
import CustomHeader from '@components/navigation/CustomHeader';
import { useDrawerNavigation } from '@hooks/useDrawerNavigation';

// ─── Icons ────────────────────────────────────────────────────────────────────

function MessageIcon({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function CheckIcon({ color, size = 44 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

function SendIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Line x1="22" y1="2" x2="11" y2="13" />
      <Path d="M22 2L15 22 11 13 2 9l20-7z" />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ContactScreen() {
  const { theme } = useTheme();
  const drawerNav = useDrawerNavigation();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});

  const validate = () => {
    const e: { subject?: string; message?: string } = {};
    if (!subject.trim()) e.subject = 'Subject is required.';
    if (!message.trim()) e.message = 'Message is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    await new Promise<void>(r => setTimeout(r, 800)); // TODO: wire to POST /api/v1/contact
    setSending(false);
    setSent(true);
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setErrors({});
    setSent(false);
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <CustomHeader variant="merck" showHamburger onHamburgerPress={() => drawerNav.openDrawer()} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={[styles.hero, { backgroundColor: MERCK_TOKENS.green + '12', borderColor: MERCK_TOKENS.green + '30' }]}>
            <View style={[styles.heroIcon, { backgroundColor: MERCK_TOKENS.green + '20' }]}>
              <MessageIcon color={MERCK_TOKENS.green} size={36} />
            </View>
            <CustomText variant="h3" style={[styles.heroTitle, { color: theme.text.primary }]}>
              Contact Us
            </CustomText>
            <CustomText variant="caption" style={[styles.heroSub, { color: theme.text.secondary }]}>
              Have a question or need help? We'll get back to you shortly.
            </CustomText>
          </View>

          {sent ? (
            /* ── Success ── */
            <View style={[styles.successCard, { backgroundColor: theme.background.card ?? theme.background.secondary, borderColor: theme.border.primary }]}>
              <View style={[styles.successIcon, { backgroundColor: MERCK_TOKENS.green + '18' }]}>
                <CheckIcon color={MERCK_TOKENS.green} size={40} />
              </View>
              <CustomText variant="h3" style={[styles.successTitle, { color: theme.text.primary }]}>
                Message sent!
              </CustomText>
              <CustomText variant="caption" style={[styles.successSub, { color: theme.text.secondary }]}>
                Thanks for reaching out. We'll get back to you as soon as possible.
              </CustomText>
              <TouchableOpacity
                style={[styles.resetBtn, { backgroundColor: MERCK_TOKENS.green }]}
                onPress={handleReset}
                activeOpacity={0.85}
              >
                <CustomText variant="bodyMedium" style={styles.resetBtnText}>Send another message</CustomText>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Form ── */
            <View style={[styles.formCard, { backgroundColor: theme.background.card ?? theme.background.secondary, borderColor: theme.border.primary }]}>

              {/* Subject */}
              <View style={styles.field}>
                <CustomText variant="caption" style={[styles.label, { color: theme.text.primary }]}>
                  Subject <CustomText variant="caption" style={{ color: '#EF4444' }}>*</CustomText>
                </CustomText>
                <TextInput
                  value={subject}
                  onChangeText={v => { setSubject(v); if (errors.subject) setErrors(p => ({ ...p, subject: undefined })); }}
                  placeholder="e.g. Feature request, bug report…"
                  placeholderTextColor={theme.text.tertiary ?? theme.text.secondary}
                  style={[
                    styles.input,
                    {
                      color: theme.text.primary,
                      backgroundColor: theme.background.secondary,
                      borderColor: errors.subject ? '#EF4444' : theme.border.primary,
                    },
                  ]}
                  returnKeyType="next"
                  autoCorrect={false}
                />
                {errors.subject && (
                  <CustomText variant="caption" style={styles.errorText}>{errors.subject}</CustomText>
                )}
              </View>

              {/* Message */}
              <View style={styles.field}>
                <CustomText variant="caption" style={[styles.label, { color: theme.text.primary }]}>
                  Message <CustomText variant="caption" style={{ color: '#EF4444' }}>*</CustomText>
                </CustomText>
                <TextInput
                  value={message}
                  onChangeText={v => { setMessage(v); if (errors.message) setErrors(p => ({ ...p, message: undefined })); }}
                  placeholder="Tell us how we can help…"
                  placeholderTextColor={theme.text.tertiary ?? theme.text.secondary}
                  style={[
                    styles.textArea,
                    {
                      color: theme.text.primary,
                      backgroundColor: theme.background.secondary,
                      borderColor: errors.message ? '#EF4444' : theme.border.primary,
                    },
                  ]}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <CustomText variant="caption" style={[styles.charCount, { color: theme.text.tertiary ?? theme.text.secondary }]}>
                  {message.length}/2000
                </CustomText>
                {errors.message && (
                  <CustomText variant="caption" style={styles.errorText}>{errors.message}</CustomText>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: sending ? MERCK_TOKENS.green + 'AA' : MERCK_TOKENS.green }]}
                onPress={handleSubmit}
                disabled={sending}
                activeOpacity={0.85}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.submitInner}>
                    <SendIcon color="#fff" size={16} />
                    <CustomText variant="bodyMedium" style={styles.submitText}>Send Message</CustomText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },

  hero: {
    borderRadius: 16, borderWidth: 1,
    padding: 20, alignItems: 'center', gap: 8,
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroSub: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  formCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 16, gap: 16,
  },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, minHeight: 120,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 2 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 2 },

  submitBtn: {
    height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  submitInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  successCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 28, alignItems: 'center', gap: 12,
  },
  successIcon: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  successTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  resetBtn: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 14, alignItems: 'center',
  },
  resetBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
