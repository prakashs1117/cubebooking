import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { useDeviceType } from '@hooks/useDeviceType';
import type { CardSectionData, CardItem } from './types';

const { fontFamily: h3FontFamily } = getFontStyle('h3');
const { fontFamily: h4FontFamily } = getFontStyle('h4');
const { fontFamily: captionFontFamily } = getFontStyle('caption');

// ─── Per-card sub-component to isolate image-error state ─────────────────────
interface CardProps {
  card: CardItem;
  isDark: boolean;
  theme: any;
  cardWidth: number;
  cardHeight: number;
}

const HorizontalCard: React.FC<CardProps> = ({
  card,
  isDark,
  theme,
  cardWidth,
  cardHeight,
}) => {
  const [imageError, setImageError] = useState(false);

  const showPlaceholder = !card.image || imageError;

  // Themed placeholder colours
  const placeholderBg = isDark ? '#1A2436' : '#C2D0E0';
  const placeholderIcon = isDark
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.14)';
  const overlayBg = isDark ? 'rgba(14,14,14,0.82)' : 'rgba(0,0,0,0.60)';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
          backgroundColor: showPlaceholder
            ? placeholderBg
            : theme.background.card,
        },
      ]}
      activeOpacity={0.85}
    >
      {/* ── Image or themed placeholder ─────────────────── */}
      {showPlaceholder ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.placeholder,
            { backgroundColor: placeholderBg },
          ]}
        >
          {/* Simple image-placeholder icon */}
          <View
            style={[styles.placeholderFrame, { borderColor: placeholderIcon }]}
          >
            <View
              style={[
                styles.placeholderCircle,
                { backgroundColor: placeholderIcon },
              ]}
            />
            <View
              style={[
                styles.placeholderMountain,
                { borderBottomColor: placeholderIcon },
              ]}
            />
          </View>
        </View>
      ) : (
        <Image
          source={{ uri: card.image }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* ── Text overlay (fixed min-height keeps cards visually even) ── */}
      <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
        <Text style={[styles.category, { color: card.categoryColor }]}>
          {card.category}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
          {card.title}
        </Text>
        {card.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            {card.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
interface Props {
  section: CardSectionData;
}

const HorizontalCardsSection: React.FC<Props> = ({ section }) => {
  const { theme, isDark } = useTheme();
  const { isTablet, width: SW } = useDeviceType();

  // Tablet (>= 768 pt): show ~3 full cards + a partial 4th so users know it scrolls.
  // Phone: keep original proportions.
  const cardWidth = isTablet ? Math.round((SW - 40) / 3.3) : SW * 0.58;
  const cardHeight = isTablet ? Math.round(cardWidth * 1.1) : SW * 0.8;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {section.title}
          </Text>
          <View
            style={[
              styles.accent,
              { backgroundColor: theme.button.primary.background },
            ]}
          />
        </View>
        {section.seeAllLabel && (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: theme.text.link }]}>
              {section.seeAllLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {section.items.map(card => (
          <HorizontalCard
            key={card.id}
            card={card}
            isDark={isDark}
            theme={theme}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  title: {
    fontFamily: h3FontFamily,
    fontSize: getFontStyle('h3').fontSize,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  accent: {
    marginTop: 6,
    width: 24,
    height: 3,
    borderRadius: 99,
  },
  seeAll: {
    fontFamily: captionFontFamily,
    fontSize: getFontStyle('caption').fontSize,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  row: {
    gap: 14,
    paddingRight: 4,
    alignItems: 'flex-start', // keeps all cards top-aligned, prevents stretch misalignment
  },

  // Card — width/height applied as inline styles (computed per device)
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },

  // Placeholder (shown when no image or load error)
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderFrame: {
    width: 52,
    height: 44,
    borderWidth: 2,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  placeholderCircle: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  placeholderMountain: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 2,
  },

  // Overlay (fixed minHeight prevents visual height jumps between cards)
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 88, // enough for 2-line title + category + subtitle
    padding: 16,
    paddingTop: 32,
    justifyContent: 'flex-end',
  },
  category: {
    fontFamily: captionFontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#ffffff',
    fontFamily: h4FontFamily,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: captionFontFamily,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
});

export default HorizontalCardsSection;
