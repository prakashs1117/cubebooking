/**
 * RateUsBanner
 *
 * A slim, attractive horizontal banner that can be dropped into any ScrollView.
 * Calls `showRatePopup()` from QuickRateContext when tapped.
 *
 * Variants:
 *  - 'card'    → full card with description (HomeScreen)
 *  - 'compact' → single-row slim bar (EventsScreen, etc.)
 */
import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import { useQuickRate } from '@context/QuickRateContext';
import { BaseColors } from '@theme/colors';

interface RateUsBannerProps {
  variant?: 'card' | 'compact';
}

const RateUsBanner: React.FC<RateUsBannerProps> = ({ variant = 'card' }) => {
  const { theme } = useTheme();
  const { showRatePopup } = useQuickRate();

  // Subtle press scale animation
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(pressScale, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 20,
    }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 14,
    }).start();

  // ── Compact variant ──────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <TouchableOpacity
          style={[
            styles.compactRow,
            {
              backgroundColor: theme.background.card,
              borderColor: theme.border.secondary,
            },
          ]}
          onPress={showRatePopup}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.85}
        >
          {/* Stars */}
          <View
            style={[
              styles.compactIconWrap,
              { backgroundColor: BaseColors.warning + '20' },
            ]}
          >
            <Text style={styles.compactEmoji}>⭐</Text>
          </View>

          <View style={styles.compactTextWrap}>
            <Text style={[styles.compactTitle, { color: theme.text.primary }]}>
              Enjoying the app?
            </Text>
            <Text style={[styles.compactSub, { color: theme.text.secondary }]}>
              Rate us — takes 5 seconds!
            </Text>
          </View>

          <View
            style={[
              styles.compactBtn,
              { backgroundColor: theme.button.primary.background },
            ]}
          >
            <Text style={styles.compactBtnText}>Rate</Text>
            <Icon name="chevron-right" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Card variant ─────────────────────────────────────────────────────────
  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.button.primary.background },
        ]}
        onPress={showRatePopup}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
      >
        {/* Left content */}
        <View style={styles.cardLeft}>
          <View style={styles.cardStars}>
            {['★', '★', '★', '★', '★'].map((s, i) => (
              <Text key={i} style={styles.cardStar}>
                {s}
              </Text>
            ))}
          </View>
          <Text style={styles.cardTitle}>Love the app?</Text>
          <Text style={styles.cardSub}>
            Leave a quick rating — it helps the team!
          </Text>
        </View>

        {/* Right CTA */}
        <View style={styles.cardRight}>
          <View style={styles.cardCTAWrap}>
            <Icon name="star" size={20} color="#FFFFFF" />
            <Text style={styles.cardCTAText}>Rate Us</Text>
          </View>
        </View>

        {/* Decorative circles */}
        <View style={[styles.decCircle, styles.decCircle1]} />
        <View style={[styles.decCircle, styles.decCircle2]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginVertical: 4,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 6,
  },
  cardStar: {
    fontSize: 16,
    color: '#FFCC00',
  },
  cardTitle: {
    fontFamily: getFontStyle('h3').fontFamily,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSub: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 17,
  },
  cardRight: {
    marginLeft: 16,
  },
  cardCTAWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cardCTAText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Decorative circles
  decCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decCircle1: {
    width: 100,
    height: 100,
    bottom: -30,
    right: 60,
  },
  decCircle2: {
    width: 70,
    height: 70,
    top: -20,
    right: 10,
  },

  // ── Compact ───────────────────────────────────────────────────────────────
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  compactIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactEmoji: {
    fontSize: 20,
  },
  compactTextWrap: {
    flex: 1,
    gap: 2,
  },
  compactTitle: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  compactSub: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
  },
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  compactBtnText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default RateUsBanner;
