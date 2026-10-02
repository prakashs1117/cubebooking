/**
 * QuickRatePopup
 *
 * Compact 2-phase dialog shown only after qualifying user actions.
 *
 * Phase 1 — Star rating + optional one-line comment → Submit
 *   onResponded() is called here so storage is marked immediately.
 *
 * Phase 2 — "Thank you!" + prompt to open App Store / Play Store
 *   "Open Store" → openURL then close (already responded)
 *   "Maybe Later" → close (already responded in phase 1)
 *
 * If user closes via X or backdrop (phase 1 only) → onDismissed()
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Linking,
  Modal,
  Platform,
  Pressable,
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
import type { RatePromptContext } from '@hooks/useRatePrompt';

// ─── Store URLs — replace with real IDs before release ───────────────────────

const APP_STORE_URL = 'itms-apps://apps.apple.com/app/id0000000000';
const PLAY_STORE_URL = 'market://details?id=com.yourcompany.yourapp';

// ─── Context-aware copy ───────────────────────────────────────────────────────

interface PromptCopy {
  title: string;
  subtitle: string;
}

const COPY: Record<RatePromptContext, PromptCopy> = {
  language_changed: {
    title: 'Enjoying the app in your language?',
    subtitle: 'Your feedback helps us support even more languages.',
  },
  settings_changed: {
    title: 'You customised your experience!',
    subtitle: 'Quick question — how are we doing overall?',
  },
  event_viewed: {
    title: 'Enjoying the events?',
    subtitle: 'Hope you found what you were looking for!',
  },
  notification_interacted: {
    title: 'Stay informed with notifications!',
    subtitle: 'How would you rate your experience so far?',
  },
  form_submitted: {
    title: 'Action completed!',
    subtitle: 'While we have your attention — how are we doing?',
  },
  general: {
    title: 'Enjoying the app?',
    subtitle: 'It takes just 5 seconds — promise!',
  },
};

const STAR_LABEL: Record<number, string> = {
  1: 'Terrible',
  2: 'Not Good',
  3: 'Okay',
  4: 'Good',
  5: 'Amazing!',
};

const STAR_GOLD = '#FFCC00';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface QuickRatePopupProps {
  visible: boolean;
  promptContext: RatePromptContext;
  /** Called when user submits feedback — marks storage as responded */
  onResponded: () => void;
  /** Called when user dismisses without engaging (X / backdrop in phase 1) */
  onDismissed: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const QuickRatePopup: React.FC<QuickRatePopupProps> = ({
  visible,
  promptContext,
  onResponded,
  onDismissed,
}) => {
  const { theme } = useTheme();

  const [phase, setPhase] = useState<'rating' | 'confirm'>('rating');
  const [starRating, setStarRating] = useState(0);
  const [comment, setComment] = useState('');

  // Card entrance animation
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Per-star bounce
  const starScales = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(1)),
  ).current;

  // Phase-2 success icon
  const checkScale = useRef(new Animated.Value(0)).current;

  // ── Open / close animations ─────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setPhase('rating');
      setStarRating(0);
      setComment('');
      checkScale.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          damping: 18,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.88,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, cardScale, cardOpacity, checkScale]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleStarPress = useCallback(
    (index: number) => {
      setStarRating(index + 1);
      Animated.sequence([
        Animated.timing(starScales[index], {
          toValue: 1.55,
          duration: 85,
          useNativeDriver: true,
        }),
        Animated.spring(starScales[index], {
          toValue: 1,
          damping: 6,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [starScales],
  );

  /** Phase 1 submit — user gave their in-app rating, mark responded */
  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
    // TODO: send `{ starRating, comment, context: promptContext }` to your API
    setPhase('confirm');
    Animated.spring(checkScale, {
      toValue: 1,
      damping: 11,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
    // Mark as responded as soon as they submit — even if they skip the store step
    onResponded();
  }, [checkScale, onResponded]);

  /** Open the appropriate store URL then close */
  const openStore = useCallback(async () => {
    const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
    } catch {
      /* Linking errors are non-fatal */
    }
    // onResponded already called in handleSubmit; just close the popup now
    onResponded();
  }, [onResponded]);

  /** Backdrop / X tap while still in phase 1 — soft dismiss */
  const handleDismiss = useCallback(() => {
    if (phase === 'rating') {
      onDismissed();
    } else {
      // Phase 2: user already responded; just close cleanly
      onResponded();
    }
  }, [phase, onDismissed, onResponded]);

  const copy = COPY[promptContext];
  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Play Store';

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* Backdrop — tapping it dismisses */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: backdropOpacity,
              backgroundColor: theme.background.overlay,
            },
          ]}
          pointerEvents="none"
        />
      </Pressable>

      {/* Centred card */}
      <View style={styles.centreWrapper} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.background.modal,
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* X close button */}
          <TouchableOpacity
            style={[
              styles.closeBtn,
              { backgroundColor: theme.background.tertiary },
            ]}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={16} color={theme.text.secondary} />
          </TouchableOpacity>

          {/* ── Phase 1: Rating ───────────────────────────────────────────── */}
          {phase === 'rating' && (
            <>
              {/* Icon accent */}
              <View
                style={[
                  styles.topIcon,
                  { backgroundColor: theme.button.primary.background + '1A' },
                ]}
              >
                <Icon
                  name="star"
                  size={30}
                  color={theme.button.primary.background}
                />
              </View>

              <Text style={[styles.title, { color: theme.text.primary }]}>
                {copy.title}
              </Text>
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                {copy.subtitle}
              </Text>

              {/* Stars */}
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }, (_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleStarPress(i)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Animated.Text
                      style={[
                        styles.star,
                        i < starRating && styles.starActive,
                        { transform: [{ scale: starScales[i] }] },
                      ]}
                    >
                      {i < starRating ? '★' : '☆'}
                    </Animated.Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rating label */}
              <Text style={[styles.ratingLabel, { color: STAR_GOLD }]}>
                {starRating > 0 ? STAR_LABEL[starRating] : ' '}
              </Text>

              {/* Optional comment */}
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text.primary,
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.primary,
                  },
                ]}
                placeholder="Any quick thoughts? (optional)"
                placeholderTextColor={theme.text.placeholder}
                value={comment}
                onChangeText={setComment}
                maxLength={140}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              {/* Divider hint */}
              <Text style={[styles.hintText, { color: theme.text.tertiary }]}>
                {starRating === 0
                  ? 'Select a star to continue'
                  : `${STAR_LABEL[starRating]} — tap Submit to send`}
              </Text>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor:
                      starRating > 0
                        ? theme.button.primary.background
                        : theme.border.secondary,
                  },
                ]}
                onPress={starRating > 0 ? handleSubmit : undefined}
                activeOpacity={starRating > 0 ? 0.85 : 1}
              >
                <Text style={styles.primaryBtnText}>Submit Feedback</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Phase 2: Store redirect ───────────────────────────────────── */}
          {phase === 'confirm' && (
            <>
              {/* Animated success badge */}
              <Animated.View
                style={[
                  styles.successCircle,
                  {
                    backgroundColor: BaseColors.success + '1A',
                    transform: [{ scale: checkScale }],
                  },
                ]}
              >
                <Icon
                  name="checkmark-circle"
                  size={56}
                  color={BaseColors.success}
                />
              </Animated.View>

              <Text style={[styles.title, { color: theme.text.primary }]}>
                Thank you!
              </Text>
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                Your feedback genuinely helps us improve.{'\n'}
                Would you also like to leave a public review on the{' '}
                <Text style={{ fontWeight: '700', color: theme.text.primary }}>
                  {storeName}
                </Text>
                ? It helps others discover the app.
              </Text>

              {/* Stars decoration */}
              <View style={styles.storeStarsRow}>
                {['★', '★', '★', '★', '★'].map((s, i) => (
                  <Text key={i} style={styles.storeStar}>
                    {s}
                  </Text>
                ))}
              </View>

              {/* Open store */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: theme.button.primary.background },
                ]}
                onPress={openStore}
                activeOpacity={0.85}
              >
                <Icon
                  name={Platform.OS === 'ios' ? 'apple' : 'star'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.primaryBtnText}>Open {storeName}</Text>
              </TouchableOpacity>

              {/* Maybe later */}
              <TouchableOpacity
                style={[styles.ghostBtn, { borderColor: theme.border.primary }]}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.ghostBtnText, { color: theme.text.secondary }]}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centreWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 18,
  },

  // Close
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Phase 1
  topIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: getFontStyle('h2').fontFamily,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  star: {
    fontSize: 38,
    color: '#D1D5DB',
  },
  starActive: {
    color: STAR_GOLD,
  },
  ratingLabel: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    minHeight: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 14,
    marginBottom: 10,
  },
  hintText: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    marginBottom: 18,
    textAlign: 'center',
  },

  // Buttons
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 10,
  },
  primaryBtnText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ghostBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  ghostBtnText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 15,
    fontWeight: '600',
  },

  // Phase 2
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  storeStarsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 20,
  },
  storeStar: {
    fontSize: 26,
    color: STAR_GOLD,
  },
});

export default QuickRatePopup;
