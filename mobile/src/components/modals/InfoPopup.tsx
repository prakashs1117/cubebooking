/**
 * InfoPopup
 *
 * Reusable center-screen modal for informational messages, confirmations,
 * and simple action prompts. Supports a configurable icon, title, message,
 * and one or more action buttons.
 *
 * Animation uses Reanimated 3 (not RN core Animated):
 *  - Open: backdrop fades in (200 ms), card eases in from scale 0.92 → 1 (200 ms)
 *  - Close: backdrop fades out (160 ms), card eases out to 0.95 + fades (150 ms),
 *           then fires onClose after animation completes
 *
 * Usage:
 *   <InfoPopup
 *     visible={showInfo}
 *     onClose={() => setShowInfo(false)}
 *     title="Important Notice"
 *     message="Please review the safety data sheet before proceeding."
 *     actions={[
 *       { label: 'View SDS', onPress: openSDS, style: 'primary' },
 *       { label: 'Dismiss',  onPress: () => setShowInfo(false), style: 'secondary' },
 *     ]}
 *   />
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { BaseColors } from '@theme/colors';
import type { IconName } from '@components/icons/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InfoPopupAction {
  label: string;
  onPress: () => void;
  style?: 'primary' | 'secondary';
}

export interface InfoPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Icon name from the icon registry. Defaults to 'info-circle' */
  iconName?: IconName;
  /** Icon and primary-button accent color. Defaults to BaseColors.merckPurple */
  iconColor?: string;
  /** Buttons rendered below the message. If empty, a single 'Got it' button is shown */
  actions?: InfoPopupAction[];
}

// ─── Animation constants ──────────────────────────────────────────────────────

const BACKDROP_OPEN_DURATION = 200;
const BACKDROP_CLOSE_DURATION = 160;
const CARD_OPEN_DURATION = 200;
const CARD_CLOSE_DURATION = 150;
const CARD_CLOSE_SCALE = 0.95;
const CARD_OPEN_SCALE = 1;
const CARD_INITIAL_SCALE = 0.92;
const EASE_OUT = { easing: Easing.out(Easing.ease) } as const;
const EASE_IN = { easing: Easing.in(Easing.ease) } as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function InfoPopup({
  visible,
  onClose,
  title,
  message,
  iconName = 'info-circle',
  iconColor = BaseColors.merckPurple,
  actions,
}: InfoPopupProps) {
  const { theme } = useTheme();

  // ── Closing-guard ref (prevents double-firing onClose) ───────────────────
  const isClosing = useRef(false);

  // ── Shared animation values ──────────────────────────────────────────────
  const backdropOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(CARD_INITIAL_SCALE);

  // ── Animated styles ──────────────────────────────────────────────────────
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  // ── Animate out then fire onClose ────────────────────────────────────────
  const animateOut = useCallback(() => {
    isClosing.current = true;
    backdropOpacity.value = withTiming(0, { duration: BACKDROP_CLOSE_DURATION });
    cardOpacity.value = withTiming(0, { duration: CARD_CLOSE_DURATION, ...EASE_IN });
    cardScale.value = withTiming(
      CARD_CLOSE_SCALE,
      { duration: CARD_CLOSE_DURATION, ...EASE_IN },
      () => runOnJS(onClose)(),
    );
  }, [onClose, backdropOpacity, cardOpacity, cardScale]);

  // ── Drive animations from the visible prop ───────────────────────────────
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      // Reset to initial values before animating in
      backdropOpacity.value = 0;
      cardScale.value = CARD_INITIAL_SCALE;
      cardOpacity.value = 0;

      backdropOpacity.value = withTiming(1, { duration: BACKDROP_OPEN_DURATION });
      cardScale.value = withTiming(CARD_OPEN_SCALE, { duration: CARD_OPEN_DURATION, ...EASE_OUT });
      cardOpacity.value = withTiming(1, { duration: CARD_OPEN_DURATION, ...EASE_OUT });
    } else if (!isClosing.current) {
      // Programmatic close (parent set visible=false externally)
      // Animate out without calling onClose (parent already changed state)
      backdropOpacity.value = withTiming(0, { duration: BACKDROP_CLOSE_DURATION });
      cardOpacity.value = withTiming(0, { duration: CARD_CLOSE_DURATION, ...EASE_IN });
      cardScale.value = withTiming(CARD_CLOSE_SCALE, { duration: CARD_CLOSE_DURATION, ...EASE_IN });
    }
  }, [visible, backdropOpacity, cardOpacity, cardScale]);

  // ── Default actions ──────────────────────────────────────────────────────
  const resolvedActions = useMemo<InfoPopupAction[]>(
    () =>
      actions && actions.length > 0
        ? actions
        : [{ label: 'Got it', onPress: animateOut, style: 'primary' as const }],
    [actions, animateOut],
  );

  // ── Icon badge background: iconColor + '18' (hex opacity ~9%) ───────────
  const iconBadgeBg = `${iconColor}18`;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={animateOut}
    >
      {/* Backdrop — tapping it dismisses */}
      <Pressable style={StyleSheet.absoluteFill} onPress={animateOut}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            backdropStyle,
          ]}
          pointerEvents="none"
        />
      </Pressable>

      {/* Centered card wrapper */}
      <View style={styles.centreWrapper} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.background.modal },
            cardStyle,
          ]}
        >
          {/* Top-right close button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.background.tertiary }]}
            onPress={animateOut}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon name="close" size={16} color={theme.text.secondary} />
          </TouchableOpacity>

          {/* Icon badge */}
          <View style={[styles.iconBadge, { backgroundColor: iconBadgeBg }]}>
            <Icon name={iconName} size={32} color={iconColor} />
          </View>

          {/* Title */}
          <CustomText
            variant="h3"
            style={[styles.title, { color: theme.text.primary }]}
          >
            {title}
          </CustomText>

          {/* Message */}
          <CustomText
            variant="bodyMedium"
            style={[styles.message, { color: theme.text.secondary }]}
          >
            {message}
          </CustomText>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            {resolvedActions.map((action) => {
              const isPrimary = action.style !== 'secondary';
              return isPrimary ? (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.btn, { backgroundColor: iconColor }]}
                  onPress={action.onPress}
                  activeOpacity={0.82}
                >
                  <CustomText variant="button" style={styles.btnPrimaryText}>
                    {action.label}
                  </CustomText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.btn,
                    styles.btnSecondary,
                    { borderColor: theme.border.primary },
                  ]}
                  onPress={action.onPress}
                  activeOpacity={0.75}
                >
                  <CustomText
                    variant="button"
                    style={{ color: theme.text.secondary }}
                  >
                    {action.label}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
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
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 18,
  },
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
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  btn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
});
