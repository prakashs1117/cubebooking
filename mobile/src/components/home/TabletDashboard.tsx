/**
 * TabletDashboard
 *
 * iPad / large-screen layout for HomeScreen (device width >= 768 pt).
 * Phone layout is completely untouched.
 *
 * Structure — simple vertical scroll, every section is a horizontal list:
 *   1. Compact featured banner  (static image, no auto-scroll carousel)
 *   2. Recommended For You      (HorizontalCardsSection — tablet card widths)
 *   3. Daily Insights           (horizontal scroll, card-style)
 *   4. Upcoming Events          (UpcomingEventsCarousel — tablet card widths)
 *   5. Bottom bar               (language switcher + rate us)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@localization/i18n';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import { useRatePrompt } from '@hooks/useRatePrompt';
import { analytics } from '@services/analyticsService';
import HorizontalCardsSection from '@components/home/HorizontalCardsSection';
import UpcomingEventsCarousel from '@components/events/UpcomingEventsCarousel';
import type { HeroSlide } from '@components/common/HeroCarouselHeader';
import type { CardSectionData, InsightSectionData } from './types';

const { width: SW } = Dimensions.get('window');

// ─── Insight card width: shows ~3 full cards + partial 4th ───────────────────
const INSIGHT_CARD_W = Math.round((SW - 40) / 3.2);
const INSIGHT_CARD_GAP = 12;

// ─── Font aliases ─────────────────────────────────────────────────────────────
const h2Font = getFontStyle('h2').fontFamily;
const h3Font = getFontStyle('h3').fontFamily;
const h4Font = getFontStyle('h4').fontFamily;
const bodyFont = getFontStyle('body').fontFamily;
const capFont = getFontStyle('caption').fontFamily;
const btnFont = getFontStyle('button').fontFamily;

interface Props {
  heroSlides: HeroSlide[];
  cardSection?: CardSectionData;
  insightSection?: InsightSectionData;
}

const TabletDashboard: React.FC<Props> = ({
  heroSlides,
  cardSection,
  insightSection,
}) => {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { triggerRatePrompt } = useRatePrompt();
  const currentLang = i18n.language;

  // Manual slide index for the compact banner (no auto-scroll)
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = heroSlides[activeSlide];
  const cycleSlide = (dir: 1 | -1) =>
    setActiveSlide(
      prev => (prev + dir + heroSlides.length) % heroSlides.length,
    );

  const s = getStyles(theme, isDark);

  // ── 1. Compact featured banner ─────────────────────────────────────────────
  const renderBanner = () => (
    <View style={s.bannerWrap}>
      <ImageBackground
        source={{ uri: slide.image }}
        style={s.banner}
        imageStyle={s.bannerImg}
        resizeMode="cover"
      >
        <View style={s.bannerScrim} />

        <View style={s.bannerContent}>
          {slide.badge && (
            <View
              style={[
                s.badgeChip,
                { borderColor: slide.badgeColor ?? '#679cff' },
              ]}
            >
              <Text
                style={[s.badgeText, { color: slide.badgeColor ?? '#679cff' }]}
              >
                {slide.badge.toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={s.bannerHeadline} numberOfLines={2}>
            {slide.headline}
          </Text>
          {slide.subtitle && (
            <Text style={s.bannerSubtitle} numberOfLines={2}>
              {slide.subtitle}
            </Text>
          )}
          {slide.ctaLabel && (
            <TouchableOpacity
              style={s.bannerCta}
              onPress={slide.onCtaPress}
              activeOpacity={0.85}
            >
              <Text style={s.bannerCtaText}>{slide.ctaLabel}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Manual prev / next — no auto-scroll */}
        {heroSlides.length > 1 && (
          <View style={s.bannerNav}>
            <TouchableOpacity
              onPress={() => cycleSlide(-1)}
              style={s.navBtn}
              activeOpacity={0.7}
            >
              <Icon name="chevron-left" size={16} color="#fff" />
            </TouchableOpacity>
            <Text style={s.navCounter}>
              {activeSlide + 1} / {heroSlides.length}
            </Text>
            <TouchableOpacity
              onPress={() => cycleSlide(1)}
              style={s.navBtn}
              activeOpacity={0.7}
            >
              <Icon name="chevron-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </View>
  );

  // ── 3. Horizontal insights list ────────────────────────────────────────────
  // VerticalInsightsSection renders vertically; on tablet we swap it to a
  // horizontal scroll with the same data, using compact card-style items.
  const renderInsights = () => {
    if (!insightSection) return null;
    return (
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <View>
            <Text style={[s.sectionTitle, { color: theme.text.primary }]}>
              {insightSection.title}
            </Text>
            <View
              style={[
                s.accent,
                { backgroundColor: theme.button.primary.background },
              ]}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.insightRow}
        >
          {insightSection.items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                s.insightCard,
                { backgroundColor: theme.background.card },
              ]}
              activeOpacity={0.8}
            >
              {/* Thumbnail */}
              <Image
                source={{ uri: item.image }}
                style={[
                  s.insightThumb,
                  { backgroundColor: theme.background.tertiary },
                ]}
                resizeMode="cover"
              />
              {/* Text body */}
              <View style={s.insightBody}>
                <View style={s.insightMeta}>
                  <View
                    style={[s.dot, { backgroundColor: item.categoryColor }]}
                  />
                  <Text
                    style={[s.insightCategory, { color: theme.text.tertiary }]}
                  >
                    {item.category}
                  </Text>
                </View>
                <Text
                  style={[s.insightTitle, { color: theme.text.primary }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  style={[s.insightReadMeta, { color: theme.text.secondary }]}
                >
                  {item.meta}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // ── 5. Bottom bar ──────────────────────────────────────────────────────────
  const renderBottomBar = () => (
    <View
      style={[
        s.bottomBar,
        {
          backgroundColor: theme.background.secondary,
          borderTopColor: theme.border.secondary,
        },
      ]}
    >
      {/* Language */}
      <View style={s.langGroup}>
        <Text style={[s.langLabel, { color: theme.text.secondary }]}>
          {t('home.changeLanguage')}
        </Text>
        <View style={s.langBtns}>
          {(['en', 'fr'] as const).map(lang => (
            <TouchableOpacity
              key={lang}
              style={[
                s.langBtn,
                {
                  borderColor: theme.border.primary,
                  backgroundColor: theme.background.card,
                },
                currentLang === lang && {
                  backgroundColor: theme.button.primary.background,
                  borderColor: theme.button.primary.background,
                },
              ]}
              onPress={() => {
                changeLanguage(lang);
                triggerRatePrompt('language_changed');
                analytics.logLanguageChanged(lang);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  s.langBtnText,
                  {
                    color:
                      currentLang === lang
                        ? theme.button.primary.text
                        : theme.text.primary,
                  },
                ]}
              >
                {lang === 'en' ? '🇺🇸 EN' : lang === 'fr' ? '🇫🇷 FR' : '🇸🇦 AR'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rate us compact pill */}
      <TouchableOpacity
        style={[
          s.ratePill,
          {
            backgroundColor: isDark
              ? 'rgba(102,56,255,0.12)'
              : 'rgba(102,56,255,0.08)',
            borderColor: isDark
              ? 'rgba(102,56,255,0.28)'
              : 'rgba(102,56,255,0.2)',
          },
        ]}
        activeOpacity={0.8}
      >
        <Icon name="star-filled" size={15} color={BaseColors.merckPurple} />
        <Text
          style={[
            s.rateText,
            { color: isDark ? '#a98bff' : BaseColors.merckPurple },
          ]}
        >
          Rate the app
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={[s.root, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Compact static banner */}
      {renderBanner()}

      {/* 2. Recommended For You — HorizontalCardsSection uses tablet widths internally */}
      {cardSection && <HorizontalCardsSection section={cardSection} />}

      {/* 3. Daily Insights — horizontal card scroll */}
      {renderInsights()}

      {/* 4. Upcoming Events — UpcomingEventsCarousel uses tablet widths internally */}
      <UpcomingEventsCarousel />

      {/* 5. Language + Rate */}
      {renderBottomBar()}
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (_theme: any, _isDark: boolean) =>
  StyleSheet.create({
    root: { flex: 1 },
    content: { paddingBottom: 32 },

    // ── Banner ────────────────────────────────────────────────────────────────
    bannerWrap: {
      height: 190,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    banner: { flex: 1 },
    bannerImg: { borderRadius: 16 },
    bannerScrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.46)',
      borderRadius: 16,
    },
    bannerContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 18,
      paddingTop: 36,
      gap: 6,
    },
    badgeChip: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: 'rgba(14,14,14,0.52)',
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeText: {
      fontFamily: capFont,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.4,
    },
    bannerHeadline: {
      color: '#fff',
      fontFamily: h2Font,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.3,
      lineHeight: 28,
    },
    bannerSubtitle: {
      color: 'rgba(255,255,255,0.72)',
      fontFamily: bodyFont,
      fontSize: 13,
      lineHeight: 19,
    },
    bannerCta: {
      alignSelf: 'flex-start',
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: '#679cff',
      marginTop: 2,
    },
    bannerCtaText: {
      color: '#fff',
      fontFamily: btnFont,
      fontSize: 12,
      fontWeight: '700',
    },
    bannerNav: {
      position: 'absolute',
      top: 12,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(0,0,0,0.38)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    navBtn: { padding: 2 },
    navCounter: {
      color: '#fff',
      fontFamily: capFont,
      fontSize: 11,
      fontWeight: '600',
    },

    // ── Section shared ────────────────────────────────────────────────────────
    section: { marginTop: 4 },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 14,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontFamily: h3Font,
      fontSize: getFontStyle('h3').fontSize,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    accent: { marginTop: 6, width: 22, height: 3, borderRadius: 99 },

    // ── Insights horizontal cards ─────────────────────────────────────────────
    insightRow: {
      gap: INSIGHT_CARD_GAP,
      paddingHorizontal: 20,
      paddingRight: 24,
    },
    insightCard: {
      width: INSIGHT_CARD_W,
      borderRadius: 12,
      overflow: 'hidden',
    },
    insightThumb: {
      width: '100%',
      height: 100,
    },
    insightBody: {
      padding: 12,
      gap: 4,
    },
    insightMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    insightCategory: {
      fontFamily: capFont,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    insightTitle: {
      fontFamily: h4Font,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 18,
    },
    insightReadMeta: {
      fontFamily: capFont,
      fontSize: 11,
      marginTop: 2,
    },

    // ── Bottom bar ────────────────────────────────────────────────────────────
    bottomBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 14,
      borderTopWidth: 0,
    },
    langGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    langLabel: { fontFamily: capFont, fontSize: 11, fontWeight: '600' },
    langBtns: { flexDirection: 'row', gap: 8 },
    langBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
    },
    langBtnText: { fontFamily: bodyFont, fontSize: 12, fontWeight: '600' },
    ratePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
    },
    rateText: { fontFamily: btnFont, fontSize: 12, fontWeight: '700' },
  });

export default TabletDashboard;
