import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  SectionList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {Swipeable} from 'react-native-gesture-handler';
import ArticleCard from '@components/search/ArticleCard';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { navigationRef } from '@navigation/navigationRef';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import type { ThemeColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import {
  HistoryArticle,
  getArticleHistory,
  removeFromArticleHistory,
  clearArticleHistory,
} from '@services/articleHistoryService';
import {
  getSearchHistory,
  removeFromSearchHistory,
} from '@services/searchHistoryService';
import { useContextMenuState } from '@context/ContextMenuContext';
import SwipeHintOverlay from '@components/common/SwipeHintOverlay';
import { useFavouritedMaterialNumbers } from '@hooks/useFavouritedMaterialNumbers';

interface HistorySection {
  title: string;
  data: HistoryArticle[];
}

const DAY = 86400000;

const getDateBucket = (iso: string, t: (k: string) => string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < DAY) return t('history.today');
  if (diff < DAY * 2) return t('history.yesterday');
  if (diff < DAY * 7) return t('history.thisWeek');
  return t('history.earlier');
};

const groupByDate = (
  items: HistoryArticle[],
  t: (k: string) => string,
): HistorySection[] => {
  const buckets: Record<string, HistoryArticle[]> = {};
  const order: string[] = [];
  for (const item of items) {
    const bucket = getDateBucket(item.viewedAt, t);
    if (!buckets[bucket]) {
      buckets[bucket] = [];
      order.push(bucket);
    }
    buckets[bucket].push(item);
  }
  return order.map(title => ({ title, data: buckets[title] }));
};

// ─── SearchChip ───────────────────────────────────────────────────────────────

interface SearchChipProps {
  query: string;
  onPress: (q: string) => void;
  onDelete: (q: string) => void;
  isDark: boolean;
}

const SearchChip: React.FC<SearchChipProps> = ({
  query,
  onPress,
  onDelete,
  isDark,
}) => {
  const bg = isDark ? 'rgba(255,255,255,0.1)' : '#EDE9F8';
  const textColor = isDark ? BaseColors.white : BaseColors.merckPurple;
  const display = query.length > 22 ? query.slice(0, 22) + '…' : query;

  return (
    <View style={[chipStyles.chip, { backgroundColor: bg }]}>
      <TouchableOpacity
        onPress={() => onPress(query)}
        style={chipStyles.chipBody}
        activeOpacity={0.75}
      >
        <BodyText style={[chipStyles.chipText, { color: textColor }]}>
          {display}
        </BodyText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDelete(query)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={chipStyles.chipDelete}
      >
        <Icon
          name="close"
          size={13}
          color={isDark ? 'rgba(255,255,255,0.6)' : BaseColors.gray500}
        />
      </TouchableOpacity>
    </View>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 7,
  },
  chipBody: { paddingRight: 4 },
  chipText: {
    fontSize: 13,
    fontFamily: getFontStyle('body').fontFamily,
  },
  chipDelete: { padding: 2 },
});

// ─── HistoryItem ──────────────────────────────────────────────────────────────

interface HistoryItemProps {
  item: HistoryArticle;
  onRemove: (materialNumber: string) => void;
  onPress: (item: HistoryArticle) => void;
  onSaveFavourite: (item: HistoryArticle) => void;
  styles: ReturnType<typeof getStyles>;
  isDark: boolean;
  isFavourited?: boolean;
  swipeHintRef?: (ref: Swipeable | null) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onRemove,
  onPress,
  onSaveFavourite,
  styles,
  isDark,
  isFavourited = false,
  swipeHintRef,
}) => {
  const swipeRef = useRef<Swipeable>(null);
  const setRef = useCallback((ref: Swipeable | null) => {
    (swipeRef as React.MutableRefObject<Swipeable | null>).current = ref;
    swipeHintRef?.(ref);
  }, [swipeHintRef]);
  const { t } = useTranslation();

  const renderRightActions = (
    _: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [1, 0.85],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={styles.removeAction}
          onPress={() => {
            swipeRef.current?.close();
            onRemove(item.materialNumber);
          }}
          activeOpacity={0.8}
        >
          <RNAnimated.View style={{ transform: [{ scale }] }}>
            <Icon name="close-circle" size={20} color={BaseColors.white} />
          </RNAnimated.View>
          <CaptionText style={styles.removeActionText}>
            {t('history.remove')}
          </CaptionText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveAction}
          onPress={() => {
            swipeRef.current?.close();
            onSaveFavourite(item);
          }}
          activeOpacity={0.8}
        >
          <RNAnimated.View style={{ transform: [{ scale }] }}>
            <Icon name="save" size={20} color={BaseColors.white} />
          </RNAnimated.View>
          <CaptionText style={styles.removeActionText}>
            {t('history.save')}
          </CaptionText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.historyItemWrapper}>
      <Swipeable
        ref={setRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
        activeOffsetX={[-10, 10]}
      >
        <ArticleCard
          article={{
            materialNumber: item.materialNumber,
            articleName: item.articleName,
            articleNumber: item.articleNumber,
            casNumber: item.casNumber,
            substance: item.substance,
            brand: item.brand,
          }}
          onPress={() => onPress(item)}
          enableContextMenu={false}
          enableSwipeFavourite={false}
          isFavourited={isFavourited}
          cardBackground={isDark ? '#2C2F33' : undefined}
        />
      </Swipeable>
    </View>
  );
};

// ─── HistoryScreen ────────────────────────────────────────────────────────────

const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { openMenu } = useContextMenuState();
  const favouritedSet = useFavouritedMaterialNumbers();
  const [items, setItems] = useState<HistoryArticle[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [articleFilter, setArticleFilter] = useState('');
  const clearSheetRef = useRef<BottomSheetModal>(null);

  const styles = useMemo(() => getStyles(theme, isDark), [theme, isDark]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    [],
  );

  const loadData = useCallback(async () => {
    const [history, searches] = await Promise.all([
      getArticleHistory(),
      getSearchHistory(),
    ]);
    setItems(history);
    setSearchHistory(searches);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredItems = useMemo(() => {
    const q = articleFilter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.articleName.toLowerCase().includes(q) ||
      i.materialNumber.toLowerCase().includes(q) ||
      (i.articleNumber ?? '').toLowerCase().includes(q) ||
      (i.casNumber ?? '').toLowerCase().includes(q),
    );
  }, [items, articleFilter]);

  const sections = useMemo(() => groupByDate(filteredItems, t), [filteredItems, t]);

  const handleItemPress = useCallback(
    (item: HistoryArticle) => {
      navigationRef.navigate('History', {
        screen: 'ArticleDetail',
        params: {
          article: {
            materialNumber: item.materialNumber,
            articleName: item.articleName,
            substance: item.substance,
            casNumber: item.casNumber,
            articleNumber: item.articleNumber,
            brand: item.brand,
          },
        },
      });
    },
    [],
  );

  const handleRemove = useCallback(async (materialNumber: string) => {
    await removeFromArticleHistory(materialNumber);
    setItems(prev => prev.filter(i => i.materialNumber !== materialNumber));
  }, []);

  const handleSaveFavourite = useCallback((item: HistoryArticle) => {
    openMenu({
      materialNumber: item.materialNumber,
      articleName: item.articleName,
      articleNumber: item.articleNumber,
      casNumber: item.casNumber,
      substance: item.substance,
      brand: item.brand,
    }, 'addToFavorites');
  }, [openMenu]);

  const handleClearAll = useCallback(() => {
    clearSheetRef.current?.present();
  }, []);

  const handleConfirmClear = useCallback(async () => {
    clearSheetRef.current?.dismiss();
    await clearArticleHistory();
    setItems([]);
  }, []);

  const handleChipDelete = useCallback(async (query: string) => {
    await removeFromSearchHistory(query);
    setSearchHistory(prev => {
      const next = prev.filter(q => q !== query);
      return next;
    });
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: HistorySection }) => (
      <View style={styles.sectionHeaderRow}>
        <View
          style={[
            styles.sectionDivider,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.12)'
                : BaseColors.gray200,
            },
          ]}
        />
        <CaptionText
          style={[styles.sectionTitle, { color: theme.text.tertiary }]}
        >
          {section.title.toUpperCase()}
        </CaptionText>
        <View
          style={[
            styles.sectionDivider,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.12)'
                : BaseColors.gray200,
            },
          ]}
        />
      </View>
    ),
    [styles, theme, isDark],
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon
        name="clock"
        size={64}
        color={theme.text.tertiary}
        style={styles.emptyIcon}
      />
      <BodyText style={[styles.emptyTitle, { color: theme.text.primary }]}>
        {t('history.empty')}
      </BodyText>
      <CaptionText
        style={[styles.emptySubtitle, { color: theme.text.secondary }]}
      >
        {t('history.emptySubtitle')}
      </CaptionText>
    </View>
  );

  const accentColor = isDark ? BaseColors.white : BaseColors.merckPurple;

  return (
    <View
      style={[styles.root, { backgroundColor: theme.background.secondary }]}
    >
      {/* Hero header */}
      <View style={styles.heroSection}>
        <BodyText
            style={[styles.searchesSectionTitle, { color: theme.text.primary }]}
          >
            {t('search.recentSearches')}
          </BodyText>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CaptionText style={[styles.clearAllText, { color: accentColor }]}>
              {t('history.clearAll').toUpperCase()}
            </CaptionText>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent searches chips */}
      {searchHistory.length > 0 && (
        <View style={styles.searchesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            {searchHistory.map(q => (
              <SearchChip
                key={q}
                query={q}
                onPress={() => void(0)}
                onDelete={handleChipDelete}
                isDark={isDark}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Article filter input */}
      {items.length > 0 && (
        <View style={[styles.articleFilterRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : theme.background.tertiary }]}>
          <Icon name="search" size={14} color={isDark ? 'rgba(255,255,255,0.45)' : theme.text.tertiary} />
          <TextInput
            value={articleFilter}
            onChangeText={setArticleFilter}
            placeholder={t('history.filterArticles')}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.35)' : theme.text.placeholder}
            style={[styles.articleFilterInput, { color: isDark ? BaseColors.white : theme.text.primary }]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {articleFilter.length > 0 && (
            <TouchableOpacity onPress={() => setArticleFilter('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={14} color={isDark ? 'rgba(255,255,255,0.45)' : theme.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Article history list */}
      {items.length === 0 ? (
        renderEmpty()
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="search" size={48} color={theme.text.tertiary} style={styles.emptyIcon} />
          <BodyText style={[styles.emptyTitle, { color: theme.text.primary }]}>
            {t('history.noFilterResults')}
          </BodyText>
        </View>
      ) : (
        <SectionList
          sections={sections}
            keyExtractor={item => item.materialNumber}
            style={styles.list}
            renderItem={({ item, index, section }) => {
            const historyItem = (
              <HistoryItem
                item={item}
                onRemove={handleRemove}
                onPress={handleItemPress}
                onSaveFavourite={handleSaveFavourite}
                styles={styles}
                isDark={isDark}
                isFavourited={favouritedSet.has(item.materialNumber)}
              />
            );
            const isFirstItem = sections.indexOf(section) === 0 && index === 0;
            if (isFirstItem) {
              return (
                <SwipeHintOverlay
                  screenKey="history"
                  ready={items.length > 0}
                  tooltipTitle={t('swipeHint.history.title')}
                  tooltipMessage={t('swipeHint.history.message')}
                >
                  {historyItem}
                </SwipeHintOverlay>
              );
            }
            return historyItem;
          }}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* Clear all confirmation sheet */}
      <BottomSheetModal
        ref={clearSheetRef}
        snapPoints={['32%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={[
          styles.sheetHandle,
          { backgroundColor: theme.text.tertiary },
        ]}
        backgroundStyle={[
          styles.sheetBackground,
          { backgroundColor: theme.background.card },
        ]}
      >
        <BottomSheetView style={styles.sheetContent}>
          <CaptionText
            style={[styles.sheetTitle, { color: theme.text.primary }]}
          >
            {t('history.clearAllConfirm')}
          </CaptionText>
          <CaptionText
            style={[styles.sheetMessage, { color: theme.text.secondary }]}
          >
            {t('history.clearAllMessage')}
          </CaptionText>
          <View style={styles.sheetButtonRow}>
            <TouchableOpacity
              style={[
                styles.sheetCancelBtn,
                { borderColor: theme.text.tertiary },
              ]}
              onPress={() => clearSheetRef.current?.dismiss()}
              activeOpacity={0.7}
            >
              <CaptionText
                style={[
                  styles.sheetCancelBtnText,
                  { color: theme.text.primary },
                ]}
              >
                {t('common.cancel')}
              </CaptionText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetDestructiveBtn}
              onPress={handleConfirmClear}
              activeOpacity={0.85}
            >
              <CaptionText style={styles.sheetDestructiveBtnText}>
                {t('history.clearAll')}
              </CaptionText>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (theme: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    // Hero
    heroSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    technicalLogsLabel: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    heroTitle: {
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 28,
    },
    clearAllText: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    // Recent searches
    searchesSection: {
      marginBottom: 8,
    },
    searchesSectionTitle: {
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      fontSize: 14,
      fontWeight: '600',
      
    },
    articleFilterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      gap: 8,
    },
    articleFilterInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: getFontStyle('body').fontFamily,
      paddingVertical: 0,
    },
    chipsScrollContent: {
      paddingHorizontal: 20,
      gap: 8,
      paddingBottom: 4,
    },
    list: {
      paddingHorizontal: 10,
    },
    listContent: {
      paddingTop: 4,
      paddingBottom: 32,
    },
    // Section header with dividers
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 12,
      gap: 8,
    },
    sectionDivider: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
    },
    sectionTitle: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.0,
    },
    // History item wrapper
    historyItemWrapper: {
      marginVertical: 1,
    },
    // Item card
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 3,
      elevation: isDark ? 0 : 1,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 14,
      flexShrink: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    itemBody: {
      flex: 1,
    },
    itemName: {
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
      marginBottom: 3,
    },
    itemMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    itemNumber: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 12,
      letterSpacing: 0.3,
    },
    itemSeparator: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 12,
    },
    swipeActions: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginVertical: 4,
      marginRight: 16,
      gap: 6,
    },
    saveAction: {
      backgroundColor: '#34A853',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      borderTopRightRadius: 14,
      borderBottomRightRadius: 14,
      gap: 4,
    },
    removeAction: {
      backgroundColor: BaseColors.error,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      borderTopLeftRadius: 14,
      borderBottomLeftRadius: 14,
      gap: 4,
    },
    removeActionText: {
      fontFamily: getFontStyle('caption').fontFamily,
      color: BaseColors.white,
      fontSize: 11,
      fontWeight: '500',
    },
    // Empty state
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingBottom: 80,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 22,
    },
    // Bottom sheet
    sheetHandle: { width: 40 },
    sheetBackground: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    sheetContent: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 32,
      gap: 10,
    },
    sheetTitle: {
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      fontSize: 17,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 2,
    },
    sheetMessage: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 8,
    },
    sheetButtonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    sheetDestructiveBtn: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      backgroundColor: BaseColors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetDestructiveBtnText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: 15,
      fontWeight: '700',
      color: BaseColors.white,
    },
    sheetCancelBtn: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetCancelBtnText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: 15,
      fontWeight: '600',
    },
  });

export default HistoryScreen;
