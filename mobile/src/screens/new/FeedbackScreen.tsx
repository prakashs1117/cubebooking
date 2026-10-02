import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path, Line, Circle, Polyline } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { MERCK_TOKENS } from '@theme/merckTokens';
import CustomText from '@components/common/CustomText';
import CustomHeader from '@components/navigation/CustomHeader';
import { useDrawerNavigation } from '@hooks/useDrawerNavigation';
import { feedbackService } from '@services/api/feedback.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_IDS = [
  { id: 'easy-to-use',       key: 'feedback.tags.easyToUse',       emoji: '✨' },
  { id: 'powerful',          key: 'feedback.tags.powerful',          emoji: '⚡' },
  { id: 'fast',              key: 'feedback.tags.fast',              emoji: '🚀' },
  { id: 'great-design',      key: 'feedback.tags.greatDesign',       emoji: '🎨' },
  { id: 'great-for-teams',   key: 'feedback.tags.greatForTeams',     emoji: '🤝' },
  { id: 'needs-improvement', key: 'feedback.tags.needsImprovement',  emoji: '🔧' },
  { id: 'missing-features',  key: 'feedback.tags.missingFeatures',   emoji: '💡' },
  { id: 'confusing',         key: 'feedback.tags.confusing',         emoji: '🤔' },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function ThumbUpIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <Path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </Svg>
  );
}

function ThumbDownIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <Path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </Svg>
  );
}

function CheckIcon({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

function MessageIcon({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FeedbackScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const drawerNav = useDrawerNavigation();
  const queryClient = useQueryClient();

  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['feedback-status'],
    queryFn: () => feedbackService.myStatus(),
    staleTime: 60_000,
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      feedbackService.submit({
        reaction: reaction!,
        tags: Array.from(selectedTags),
        message: message.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-status'] });
      setSubmitted(true);
    },
    onError: () => {
      Alert.alert(t('common.error'), t('errors.api.unknown'));
    },
  });

  const toggleTag = useCallback((id: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const canSubmit = reaction !== null && !isPending;

  // Already submitted this session or previously
  if (submitted || status?.hasSubmitted) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <CustomHeader variant="merck" showHamburger onHamburgerPress={() => drawerNav.openDrawer()} />
        <View style={styles.successWrap}>
          <View style={[styles.successIcon, { backgroundColor: MERCK_TOKENS.green + '18' }]}>
            <CheckIcon color={MERCK_TOKENS.green} size={40} />
          </View>
          <CustomText variant="h3" style={[styles.successTitle, { color: theme.text.primary }]}>
            {t('feedback.thankYou')}
          </CustomText>
          <CustomText variant="body" style={[styles.successSubtitle, { color: theme.text.secondary }]}>
            {t('feedback.thankYouMessage')}
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <CustomHeader variant="merck" showHamburger onHamburgerPress={() => drawerNav.openDrawer()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.heroSection, { backgroundColor: MERCK_TOKENS.green + '12', borderColor: MERCK_TOKENS.green + '30' }]}>
            <View style={[styles.heroIconWrap, { backgroundColor: MERCK_TOKENS.green + '20' }]}>
              <MessageIcon color={MERCK_TOKENS.green} size={36} />
            </View>
            <CustomText variant="h3" style={[styles.heroTitle, { color: theme.text.primary }]}>
              {t('feedback.title')}
            </CustomText>
            <CustomText variant="caption" style={[styles.heroSubtitle, { color: theme.text.secondary }]}>
              {t('feedback.subtitle')}
            </CustomText>
          </View>

          {/* Reaction */}
          <View style={[styles.section, { borderColor: theme.border.primary, backgroundColor: theme.background.card ?? theme.background.secondary }]}>
            <CustomText variant="bodyMedium" style={[styles.sectionLabel, { color: theme.text.primary }]}>
              {t('feedback.howsExperience')}
            </CustomText>
            <View style={styles.reactionRow}>
              <TouchableOpacity
                style={[
                  styles.reactionBtn,
                  {
                    borderColor: reaction === 'up' ? MERCK_TOKENS.green : theme.border.primary,
                    backgroundColor: reaction === 'up' ? MERCK_TOKENS.green + '12' : theme.background.secondary,
                  },
                ]}
                onPress={() => setReaction(reaction === 'up' ? null : 'up')}
                activeOpacity={0.75}
              >
                <ThumbUpIcon color={reaction === 'up' ? MERCK_TOKENS.green : theme.text.secondary} size={26} />
                <CustomText variant="caption" style={[styles.reactionLabel, { color: reaction === 'up' ? MERCK_TOKENS.green : theme.text.secondary }]}>
                  {t('feedback.lovingIt')}
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reactionBtn,
                  {
                    borderColor: reaction === 'down' ? '#EF4444' : theme.border.primary,
                    backgroundColor: reaction === 'down' ? 'rgba(239,68,68,0.1)' : theme.background.secondary,
                  },
                ]}
                onPress={() => setReaction(reaction === 'down' ? null : 'down')}
                activeOpacity={0.75}
              >
                <ThumbDownIcon color={reaction === 'down' ? '#EF4444' : theme.text.secondary} size={26} />
                <CustomText variant="caption" style={[styles.reactionLabel, { color: reaction === 'down' ? '#EF4444' : theme.text.secondary }]}>
                  {t('feedback.needsWork')}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View style={[styles.section, { borderColor: theme.border.primary, backgroundColor: theme.background.card ?? theme.background.secondary }]}>
            <CustomText variant="bodyMedium" style={[styles.sectionLabel, { color: theme.text.primary }]}>
              {t('feedback.whatDescribes')}
            </CustomText>
            <View style={styles.tagsGrid}>
              {TAG_IDS.map(tag => {
                const active = selectedTags.has(tag.id);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagPill,
                      {
                        borderColor: active ? MERCK_TOKENS.green : theme.border.primary,
                        backgroundColor: active ? MERCK_TOKENS.green + '12' : theme.background.secondary,
                      },
                    ]}
                    onPress={() => toggleTag(tag.id)}
                    activeOpacity={0.75}
                  >
                    <CustomText variant="caption" style={styles.tagEmoji}>{tag.emoji}</CustomText>
                    <CustomText variant="caption" style={[styles.tagLabel, { color: active ? MERCK_TOKENS.green : theme.text.secondary }]}>
                      {t(tag.key)}
                    </CustomText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Message */}
          <View style={[styles.section, { borderColor: theme.border.primary, backgroundColor: theme.background.card ?? theme.background.secondary }]}>
            <CustomText variant="bodyMedium" style={[styles.sectionLabel, { color: theme.text.primary }]}>
              {t('feedback.anythingElse')}
            </CustomText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={t('feedback.placeholder')}
              placeholderTextColor={theme.text.tertiary ?? theme.text.secondary}
              style={[
                styles.textArea,
                {
                  color: theme.text.primary,
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.primary,
                },
              ]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={2000}
            />
            <CustomText variant="caption" style={[styles.charCount, { color: theme.text.tertiary ?? theme.text.secondary }]}>
              {message.length}/2000
            </CustomText>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: canSubmit ? MERCK_TOKENS.green : theme.border.primary,
                opacity: canSubmit ? 1 : 0.55,
              },
            ]}
            onPress={() => canSubmit && submit()}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <CustomText variant="bodyMedium" style={styles.submitText}>
                {t('feedback.send')}
              </CustomText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 14, paddingTop: 16 },

  heroSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionLabel: { fontSize: 15, fontWeight: '600' },

  reactionRow: { flexDirection: 'row', gap: 12 },
  reactionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  reactionLabel: { fontSize: 13, fontWeight: '600' },

  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagEmoji: { fontSize: 13 },
  tagLabel: { fontSize: 12, fontWeight: '500' },

  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
  },
  charCount: { fontSize: 11, textAlign: 'right' },

  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  successSubtitle: { fontSize: 15, lineHeight: 23, textAlign: 'center' },
});
