import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { getFontStyle } from '@utils/fonts';
import ArticleCard, { Article } from '@components/search/ArticleCard';
import { CaptionText, BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { useSwipeHint } from '@hooks/useSwipeHint';
import SwipeHintBubble from '@components/common/SwipeHintBubble';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useFavouritedMaterialNumbers } from '@hooks/useFavouritedMaterialNumbers';
// SwipeHintOverlay intentionally NOT used here — wrapping FlatList renderItem causes duplicate key errors

interface SearchResultsFlatListProps {
  results: Article[];
  isSearching: boolean;
  isLoadingMore: boolean;
  hasSearched: boolean;
  hasMore: boolean;
  query: string;
  totalHits: number;
  onLoadMore: () => void;
  onArticlePress: (article: Article) => void;
  contentPaddingHorizontal?: number;
  contentPaddingBottom?: number;
  showResultCountHeader?: boolean;
  enableSwipeHint?: boolean;
}

const SearchResultsFlatList: React.FC<SearchResultsFlatListProps> = ({
  results,
  isSearching,
  isLoadingMore,
  hasSearched,
  hasMore,
  query,
  totalHits,
  onLoadMore,
  onArticlePress,
  contentPaddingHorizontal = 0,
  contentPaddingBottom = 24,
  showResultCountHeader = false,
  enableSwipeHint = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const captionStyle = getFontStyle('caption');
  const bodyStyle = getFontStyle('body');
  const accentColor = isDark ? '#FFFFFF' : BaseColors.merckPurple;
  const favouritedSet = useFavouritedMaterialNumbers();
  // Stable ref so renderItem closure never changes when favourites update
  const favouritedSetRef = useRef(favouritedSet);
  favouritedSetRef.current = favouritedSet;

  // Swipe hint — uses hook directly to avoid wrapping FlatList items (duplicate key bug)
  const firstItemSwipeHintRef = useRef<(ref: SwipeableMethods | null) => void>(
    () => {},
  );
  const { registerSwipeRef, tooltipVisible, dismiss } = useSwipeHint(
    'home',
    enableSwipeHint && results.length > 0,
  );
  // Keep registerSwipeRef stable in a ref so renderItem closure stays stable
  const registerSwipeRefStable = useRef(registerSwipeRef);
  registerSwipeRefStable.current = registerSwipeRef;
  firstItemSwipeHintRef.current = registerSwipeRefStable.current;

  const renderItem = useCallback(
    ({ item, index }: { item: Article; index: number }) => (
      <View style={styles.searchItemWrapper}>
        <ArticleCard
          article={item}
          onPress={onArticlePress}
          enableContextMenu={true}
          isFavourited={favouritedSetRef.current.has(item.materialNumber)}
          swipeHintRef={
            enableSwipeHint && index === 0
              ? ref => firstItemSwipeHintRef.current(ref)
              : undefined
          }
        />
      </View>
    ),
    [onArticlePress, enableSwipeHint],
  );

  const renderHeader = useCallback(() => {
    if (!showResultCountHeader || !hasSearched || isSearching) return null;
    return (
      <CaptionText
        style={[
          styles.resultCount,
          { color: isDark ? 'rgba(255,255,255,0.6)' : theme.text.secondary },
        ]}
      >
        {totalHits} result{totalHits !== 1 ? 's' : ''} for {'"'}
        {query}
        {'"'}
      </CaptionText>
    );
  }, [
    showResultCountHeader,
    hasSearched,
    isSearching,
    totalHits,
    query,
    theme,
  ]);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={accentColor} size="small" />
        </View>
      );
    }
    if (hasSearched && !hasMore && results.length > 0) {
      return (
        <CaptionText
          style={[
            styles.footerText,
            {
              fontFamily: captionStyle.fontFamily,
              color: isDark ? 'rgba(255,255,255,0.4)' : theme.text.tertiary,
            },
          ]}
        >
          {t('search.endOfResults')}
        </CaptionText>
      );
    }
    return null;
  }, [
    isLoadingMore,
    hasSearched,
    hasMore,
    results.length,
    accentColor,
    captionStyle,
    theme,
  ]);

  const renderEmpty = useCallback(() => {
    if (!hasSearched || isSearching) return null;
    return (
      <View style={styles.emptyState}>
        <Icon
          name="search"
          size={48}
          color={isDark ? 'rgba(255,255,255,0.35)' : '#D1D5DB'}
          style={styles.emptyIcon}
        />
        <BodyText
          style={[
            styles.emptyTitle,
            {
              fontFamily: bodyStyle.fontFamily,
              color: isDark ? '#FFFFFF' : theme.text.primary,
            },
          ]}
        >
          {t('search.noResults', { term: query })}
        </BodyText>
        <CaptionText
          style={[
            styles.emptyHint,
            {
              fontFamily: captionStyle.fontFamily,
              color: isDark ? 'rgba(255,255,255,0.5)' : theme.text.tertiary,
            },
          ]}
        >
          {t('search.emptyResultsHint')}
        </CaptionText>
      </View>
    );
  }, [hasSearched, isSearching, query, isDark, bodyStyle, captionStyle, theme]);

  if (isSearching && results.length === 0) {
    return (
      <View style={styles.centerSpinner}>
        <ActivityIndicator color={accentColor} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.listWrapper}>
      {enableSwipeHint && (
        <View style={styles.bubbleAnchor}>
          <SwipeHintBubble
            visible={tooltipVisible}
            message={t('swipeHint.home.message')}
            onDismiss={dismiss}
          />
        </View>
      )}
      <FlatList
        data={results}
        keyExtractor={item => item.materialNumber}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingHorizontal: contentPaddingHorizontal,
          paddingBottom: contentPaddingBottom,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  searchItemWrapper: {
    marginVertical: 1,
  },
  bubbleAnchor: {
    position: 'absolute',
    top: 8,
    left: 12,
    zIndex: 100,
  },
  centerSpinner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCount: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 13,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SearchResultsFlatList;
