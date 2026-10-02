import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import { BaseColors } from '@theme/colors';
import { analytics } from '@services/analyticsService';

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedbackCategory = 'bug' | 'feature' | 'ux' | 'performance' | 'other';
type MoodValue = 1 | 2 | 3 | 4;

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  /** iOS App Store URL, e.g. "itms-apps://apps.apple.com/app/id<YOUR_APP_ID>" */
  appStoreUrl?: string;
  /** Play Store URL, e.g. "market://details?id=<YOUR_PACKAGE_NAME>" */
  playStoreUrl?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAR_LABELS = ['', 'Terrible', 'Not Good', 'Okay', 'Good', 'Amazing!'];

const MOOD_OPTIONS: { value: MoodValue; emoji: string; label: string }[] = [
  { value: 1, emoji: '😞', label: 'Sad' },
  { value: 2, emoji: '😐', label: 'Neutral' },
  { value: 3, emoji: '😊', label: 'Happy' },
  { value: 4, emoji: '😍', label: 'Love it' },
];

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'ux', label: 'UI / UX' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' },
];

const STAR_GOLD = '#FFCC00';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarRow: React.FC<{ rating: number; onRate: (n: number) => void }> = ({
  rating,
  onRate,
}) => {
  const scales = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(1)),
  ).current;

  const handlePress = (index: number) => {
    const star = index + 1;
    onRate(star);
    Animated.sequence([
      Animated.timing(scales[index], {
        toValue: 1.45,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scales[index], {
        toValue: 1,
        useNativeDriver: true,
        damping: 6,
      }),
    ]).start();
  };

  return (
    <View style={starStyles.row}>
      {Array.from({ length: 5 }, (_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => handlePress(i)}
          activeOpacity={0.8}
        >
          <Animated.Text
            style={[starStyles.star, { transform: [{ scale: scales[i] }] }]}
          >
            {i < rating ? '★' : '☆'}
          </Animated.Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  star: { fontSize: 40, color: STAR_GOLD },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  appStoreUrl = 'itms-apps://apps.apple.com/app/id0000000000',
  playStoreUrl = 'market://details?id=com.yourcompany.yourapp',
}) => {
  const { theme } = useTheme();

  // Form state
  const [starRating, setStarRating] = useState(0);
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(600)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  // Open / close animations
  useEffect(() => {
    if (visible) {
      setSubmitted(false);
      setStarRating(0);
      setMood(null);
      setCategory(null);
      setComment('');
      successScale.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(sheetY, {
          toValue: 0,
          damping: 20,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: 600,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, sheetY, successScale]);

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
    // Log analytics for feedback submitted with message length
    analytics.logFeedbackSubmit(
      starRating,
      category ?? undefined,
      comment.length > 0 ? comment.length : undefined,
    );
    // TODO: wire up your API call here
    setSubmitted(true);
    Animated.spring(successScale, {
      toValue: 1,
      damping: 12,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
    setTimeout(onClose, 2200);
  }, [onClose, successScale, category, starRating, comment]);

  const openStore = useCallback(async () => {
    const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    }
  }, [appStoreUrl, playStoreUrl]);

  const canSubmit = starRating > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: theme.background.overlay,
            },
          ]}
          pointerEvents="none"
        />
      </Pressable>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardWrapper}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background.modal,
              transform: [{ translateY: sheetY }],
            },
          ]}
        >
          {/* Drag handle */}
          <View
            style={[styles.handle, { backgroundColor: theme.border.primary }]}
          />

          {/* ── Success state ── */}
          {submitted ? (
            <View style={styles.successContainer}>
              <Animated.View style={{ transform: [{ scale: successScale }] }}>
                <View
                  style={[
                    styles.successCircle,
                    { backgroundColor: BaseColors.success + '1A' },
                  ]}
                >
                  <Icon
                    name="checkmark-circle"
                    size={64}
                    color={BaseColors.success}
                  />
                </View>
              </Animated.View>
              <Text
                style={[styles.successTitle, { color: theme.text.primary }]}
              >
                Thank you!
              </Text>
              <Text
                style={[
                  styles.successSubtitle,
                  { color: theme.text.secondary },
                ]}
              >
                Your feedback helps us improve.
              </Text>
            </View>
          ) : (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.title, { color: theme.text.primary }]}>
                    Share Your Experience
                  </Text>
                  <Text
                    style={[styles.subtitle, { color: theme.text.secondary }]}
                  >
                    We read every review
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.background.tertiary },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={18} color={theme.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* ── Stars ── */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: theme.text.secondary }]}
                >
                  How would you rate us?
                </Text>
                <StarRow rating={starRating} onRate={setStarRating} />
                {starRating > 0 && (
                  <Text style={[styles.ratingLabel, { color: STAR_GOLD }]}>
                    {STAR_LABELS[starRating]}
                  </Text>
                )}
              </View>

              {/* ── Mood ── */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: theme.text.secondary }]}
                >
                  How are you feeling?
                </Text>
                <View style={styles.moodRow}>
                  {MOOD_OPTIONS.map(item => {
                    const selected = mood === item.value;
                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.moodBtn,
                          selected && {
                            backgroundColor:
                              theme.button.primary.background + '18',
                            borderColor: theme.button.primary.background,
                          },
                          !selected && { borderColor: theme.border.primary },
                        ]}
                        onPress={() => setMood(item.value)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.moodEmoji}>{item.emoji}</Text>
                        <Text
                          style={[
                            styles.moodText,
                            {
                              color: selected
                                ? theme.button.primary.background
                                : theme.text.secondary,
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ── Category chips ── */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: theme.text.secondary }]}
                >
                  What's your feedback about?
                </Text>
                <View style={styles.chipsRow}>
                  {CATEGORIES.map(cat => {
                    const selected = category === cat.value;
                    return (
                      <TouchableOpacity
                        key={cat.value}
                        style={[
                          styles.chip,
                          {
                            borderColor: theme.border.primary,
                            backgroundColor: theme.background.secondary,
                          },
                          selected && {
                            backgroundColor: theme.button.primary.background,
                            borderColor: theme.button.primary.background,
                          },
                        ]}
                        onPress={() => setCategory(cat.value)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: selected
                                ? '#FFFFFF'
                                : theme.text.secondary,
                            },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ── Comment ── */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: theme.text.secondary }]}
                >
                  Tell us more (optional)
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.text.primary,
                      backgroundColor: theme.background.secondary,
                      borderColor: theme.border.primary,
                    },
                  ]}
                  placeholder="Describe your experience..."
                  placeholderTextColor={theme.text.placeholder}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  value={comment}
                  onChangeText={setComment}
                />
                <Text
                  style={[styles.charCount, { color: theme.text.tertiary }]}
                >
                  {comment.length}/500
                </Text>
              </View>

              {/* ── Store rating CTA ── */}
              <TouchableOpacity
                style={[
                  styles.storeBtn,
                  {
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.primary,
                  },
                ]}
                onPress={openStore}
                activeOpacity={0.75}
              >
                <Icon
                  name={Platform.OS === 'ios' ? 'apple' : 'star'}
                  size={20}
                  color={theme.button.primary.background}
                />
                <View style={styles.storeBtnText}>
                  <Text
                    style={[
                      styles.storeBtnTitle,
                      { color: theme.text.primary },
                    ]}
                  >
                    {Platform.OS === 'ios'
                      ? 'Rate on App Store'
                      : 'Rate on Play Store'}
                  </Text>
                  <Text
                    style={[
                      styles.storeBtnSub,
                      { color: theme.text.secondary },
                    ]}
                  >
                    Leave a public review — it really helps!
                  </Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={18}
                  color={theme.text.tertiary}
                />
              </TouchableOpacity>

              {/* ── Submit ── */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: canSubmit
                      ? theme.button.primary.background
                      : theme.border.primary,
                  },
                ]}
                onPress={canSubmit ? handleSubmit : undefined}
                activeOpacity={canSubmit ? 0.85 : 1}
              >
                <Icon name="star" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Submit Feedback</Text>
              </TouchableOpacity>

              {!canSubmit && (
                <Text
                  style={[styles.submitHint, { color: theme.text.tertiary }]}
                >
                  Please select a star rating to continue
                </Text>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  keyboardWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  } as any,
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontFamily: getFontStyle('h2').fontFamily,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  // Rating label
  ratingLabel: {
    fontFamily: getFontStyle('h3').fontFamily,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },

  // Mood
  moodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 26,
  },
  moodText: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 11,
    fontWeight: '500',
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },

  // Text input
  textInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },

  // Store button
  storeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    marginBottom: 16,
  },
  storeBtnText: {
    flex: 1,
    gap: 2,
  },
  storeBtnTitle: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 15,
    fontWeight: '600',
  },
  storeBtnSub: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
  },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 8,
    marginBottom: 10,
  },
  submitBtnText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitHint: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },

  // Success
  successContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: getFontStyle('h2').fontFamily,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FeedbackModal;
