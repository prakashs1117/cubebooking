import React, { useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar, Platform, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { useTabBarProgress } from '@context/TabBarVisibilityContext';
import CustomHeader from '@components/navigation/CustomHeader';
import HomeSearchBar from '@components/search/HomeSearchBar';
import HomeSearchOverlay from '@components/search/HomeSearchOverlay';
import RecentArticlesStrip from '@components/favorites/RecentArticlesStrip';
import RecentFavouritesStrip from '@components/favorites/RecentFavouritesStrip';
import { useRecentFavourites } from '@hooks/useRecentFavourites';
import { useSettings } from '@hooks/useSettings';
import SearchPromptCard from '@components/home/SearchPromptCard';
import { InfoPopup } from '@components/modals';
import { getArticleHistory } from '@services/articleHistoryService';
import type { HistoryArticle } from '@services/articleHistoryService';
import type {
  CardSectionData,
  InsightSectionData,
} from '@components/home/types';

interface Props {
  cardSection: CardSectionData | undefined;
  insightSection: InsightSectionData | undefined;
}

const HomeScreenPhone: React.FC<Props> = ({
  cardSection: _cardSection,
  insightSection: _insightSection,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { settings } = useSettings();
  const { tabBarProgress, tabBarPrevOffset } = useTabBarProgress();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y;
    if (tabBarProgress) {
      const diff = e.contentOffset.y - tabBarPrevOffset.value;
      tabBarPrevOffset.value = e.contentOffset.y;
      if (Math.abs(diff) < 10) return;
      if (e.contentOffset.y < 10) {
        tabBarProgress.value = withTiming(0, { duration: 250 });
        return;
      }
      tabBarProgress.value = withTiming(diff > 0 ? 1 : 0, { duration: 250 });
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor(isDark ? '#000000' : '#ffffff');
      }
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    }, [isDark]),
  );

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [recentArticles, setRecentArticles] = useState<HistoryArticle[]>([]);
  const { articles: recentFavourites } = useRecentFavourites(10);
  const [infoPopupVisible, setInfoPopupVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getArticleHistory().then(h => setRecentArticles(h.slice(0, 10)));
    }, []),
  );

  const handleBarcodePress = React.useCallback(() => {
    navigation.navigate('Search', {
      screen: 'BarcodeScanner',
    });
  }, [navigation]);

  const styles = getStyles(theme);

  return (
    <View style={styles.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <CustomHeader
        title={t('common.appName')}
        showHamburger={false}
        hideSearch
        leftIcon={
          <Image
            source={require('@assets/images/home-logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        }
      />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Search bar */}
        <HomeSearchBar
          onPress={() => setOverlayOpen(true)}
          onBarcodePress={handleBarcodePress}
          showBarcodeButton={settings?.home?.barcodeScanner ?? true}
        />

        {/* Search prompt card */}
        <SearchPromptCard />

        {/* Recently viewed */}
        {recentArticles.length > 0 && (
          <View style={styles.recentSection}>
            <RecentArticlesStrip
              articles={recentArticles}
              onViewAll={() => navigation.navigate('History')}
            />
          </View>
        )}

        {/* Recently favourited */}
        {recentFavourites.length > 0 && (
          <View style={styles.recentSection}>
            <RecentFavouritesStrip
              articles={recentFavourites}
              onViewAll={() => navigation.navigate('Favorites')}
            />
          </View>
        )}
      </Animated.ScrollView>

      <InfoPopup
        visible={infoPopupVisible}
        onClose={() => setInfoPopupVisible(false)}
        title="What is this?"
        message="This is a reusable info popup. Tap the info icon anywhere in the app to reveal contextual help like this."
      />

      <HomeSearchOverlay
        visible={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background.primary },
    scroll: { flex: 1 },
    content: { flexGrow: 1, paddingBottom: 40 },
    section: { marginTop: 8 },
    recentSection: { marginTop: 20, marginBottom: 4 },
    headerLogo: {
      width: 36,
      height: 36,
    },
  });

export default HomeScreenPhone;
