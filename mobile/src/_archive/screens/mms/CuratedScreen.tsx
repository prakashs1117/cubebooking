import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import {
  useFocusEffect,
  useNavigation,
  DrawerActions,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import HeroCarouselHeader, {
  HeroSlide,
  HeroOverlayHeader,
} from '@components/common/HeroCarouselHeader';
import HorizontalCardsSection from '@components/home/HorizontalCardsSection';
import VerticalInsightsSection from '@components/home/VerticalInsightsSection';
import type {
  CardSectionData,
  InsightSectionData,
} from '@components/home/types';
import { MoreStackParamList } from '@/types/navigation';
import curatedData from '@/data/curatedHomeData.json';

const { height: SH } = Dimensions.get('window');
const { fontFamily: captionFontFamily } = getFontStyle('caption');

type CuratedNav = StackNavigationProp<MoreStackParamList, 'CuratedDemo'>;

const stickyHeader = curatedData.header.stickyHeader ?? true;

const CuratedScreen: React.FC = () => {
  const navigation = useNavigation<CuratedNav>();
  const { theme, isDark } = useTheme();
  const [heroHeight, setHeroHeight] = useState<'half' | 'full'>(
    curatedData.header.heroHeight as 'half' | 'full',
  );

  const isDrawerEnabled = useFeatureFlagsStore(s =>
    s.isFeatureEnabled('ENABLE_DRAWER_NAVIGATION'),
  );

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y;
  });

  // Recalculate fade threshold when hero height toggle changes
  const fadeThreshold = heroHeight === 'full' ? SH : Math.round(SH * 0.5);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }
      StatusBar.setBarStyle('light-content');
      return () => {
        if (Platform.OS === 'android') {
          StatusBar.setTranslucent(false);
          StatusBar.setBackgroundColor(isDark ? '#000000' : '#ffffff');
        }
        StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      };
    }, [isDark]),
  );

  const heroSlides: HeroSlide[] = useMemo(
    () =>
      curatedData.heroSlides.map(slide => ({
        ...slide,
        onCtaPress:
          slide.ctaAction === 'navigate' && slide.ctaTarget
            ? () => {
                try {
                  navigation.navigate(slide.ctaTarget as any);
                } catch {}
              }
            : undefined,
      })),
    [navigation],
  );

  const cardSection = curatedData.sections.find(
    s => s.type === 'horizontal-cards',
  ) as CardSectionData | undefined;
  const insightSection = curatedData.sections.find(
    s => s.type === 'vertical-list',
  ) as InsightSectionData | undefined;

  const styles = getStyles(theme);

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <HeroCarouselHeader
          slides={heroSlides}
          heroHeight={heroHeight}
          title={curatedData.header.title}
          showHamburger={isDrawerEnabled}
          onMenuPress={() => {
            try {
              navigation.dispatch(DrawerActions.openDrawer());
            } catch {}
          }}
          autoPlay={curatedData.header.autoPlay}
          autoPlayInterval={curatedData.header.autoPlayInterval}
          showDots={curatedData.header.showDots ?? false}
          stickyHeader={stickyHeader}
        />

        {/* Hero height toggle (demo only) */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hero height:</Text>
          {(['half', 'full'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.toggleBtn,
                heroHeight === mode && styles.toggleBtnActive,
              ]}
              onPress={() => setHeroHeight(mode)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  heroHeight === mode && styles.toggleBtnTextActive,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {cardSection && <HorizontalCardsSection section={cardSection} />}
        {insightSection && <VerticalInsightsSection section={insightSection} />}
      </Animated.ScrollView>

      {/* Sticky overlay header — outside ScrollView, fades in background as hero scrolls away */}
      {stickyHeader && (
        <HeroOverlayHeader
          title={curatedData.header.title}
          showHamburger={isDrawerEnabled}
          onMenuPress={() => {
            try {
              navigation.dispatch(DrawerActions.openDrawer());
            } catch {}
          }}
          scrollY={scrollY}
          fadeThreshold={fadeThreshold}
        />
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background.primary },
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 48 },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    toggleLabel: {
      color: theme.text.secondary,
      fontFamily: captionFontFamily,
      fontSize: getFontStyle('caption').fontSize,
      fontWeight: '600',
      marginRight: 4,
    },
    toggleBtn: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    toggleBtnActive: {
      backgroundColor: theme.button.primary.background,
      borderColor: theme.button.primary.background,
    },
    toggleBtnText: {
      color: theme.text.tertiary,
      fontFamily: captionFontFamily,
      fontSize: getFontStyle('caption').fontSize,
      fontWeight: '600',
    },
    toggleBtnTextActive: { color: theme.button.primary.text },
  });

export default CuratedScreen;
