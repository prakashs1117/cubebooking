import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { getFontStyle } from '@utils/fonts';
import type { HeroSlide } from './types';

const { width: SW } = Dimensions.get('window');
const SURFACE = '#0e0e0e';

const { fontFamily: headlineFontFamily } = getFontStyle('h1');
const { fontFamily: bodyFontFamily } = getFontStyle('body');
const { fontFamily: captionFontFamily } = getFontStyle('caption');
const { fontFamily: buttonFontFamily } = getFontStyle('button');

interface Props {
  item: HeroSlide;
  index: number;
  carouselHeight: number;
  contentBottom: number;
  showDots: boolean;
  activeIndex: number;
  totalSlides: number;
}

const HeroSlideItem: React.FC<Props> = ({
  item,
  index,
  carouselHeight,
  contentBottom,
  showDots,
  activeIndex,
  totalSlides,
}) => {
  const badgeColor = item.badgeColor ?? '#679cff';
  const scrimId = `scrim_${index}`;
  const topId = `top_${index}`;

  return (
    <View style={{ width: SW, height: carouselHeight }}>
      <Image
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Dual SVG scrim: bottom-up for content + top-down for header readability */}
      <Svg
        width={SW}
        height={carouselHeight}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={SURFACE} stopOpacity="0" />
            <Stop offset="0.38" stopColor={SURFACE} stopOpacity="0.18" />
            <Stop offset="0.68" stopColor={SURFACE} stopOpacity="0.72" />
            <Stop offset="1" stopColor={SURFACE} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id={topId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.45" />
            <Stop offset="0.3" stopColor="#000000" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={SW}
          height={carouselHeight}
          fill={`url(#${scrimId})`}
        />
        <Rect
          x="0"
          y="0"
          width={SW}
          height={carouselHeight}
          fill={`url(#${topId})`}
        />
      </Svg>

      {/* Editorial content */}
      <View style={[styles.content, { paddingBottom: contentBottom }]}>
        {item.badge ? (
          <View style={styles.badgeChip}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {item.badge.toUpperCase()}
            </Text>
          </View>
        ) : null}

        <Text style={styles.headline}>{item.headline}</Text>

        {item.subtitle ? (
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        ) : null}

        {item.ctaLabel ? (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={item.onCtaPress}
            activeOpacity={0.82}
          >
            <Text style={styles.ctaText}>{item.ctaLabel}</Text>
          </TouchableOpacity>
        ) : null}

        {showDots && totalSlides > 1 && (
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 10,
  },
  badgeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(14, 14, 14, 0.55)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(72, 72, 72, 0.18)',
  },
  badgeText: {
    fontFamily: captionFontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  headline: {
    color: '#ffffff',
    fontFamily: headlineFontFamily,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontFamily: bodyFontFamily,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: '82%',
  },
  ctaButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#679cff',
  },
  ctaText: {
    color: '#ffffff',
    fontFamily: buttonFontFamily,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    height: 4,
    borderRadius: 99,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#679cff',
  },
  dotInactive: {
    width: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});

export default HeroSlideItem;
