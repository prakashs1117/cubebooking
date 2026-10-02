import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';
import type { HistoryArticle } from '@services/articleHistoryService';
import { navigationRef } from '@navigation/navigationRef';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import BookmarkIcon from '@components/icons/BookmarkIcon';
import { useFavouritedMaterialNumbers } from '@hooks/useFavouritedMaterialNumbers';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 88;

interface Props {
  articles: HistoryArticle[];
  onViewAll: () => void;
}

const ArticleChip: React.FC<{
  item: HistoryArticle;
  onPress: (item: HistoryArticle) => void;
  isFavourited?: boolean;
}> = ({ item, onPress, isFavourited = false }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: theme.background.secondary }]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={styles.chipStrip} />
      <View style={styles.chipContent}>
        <BodyText
          style={[styles.chipName, { color: theme.text.primary }]}
          numberOfLines={2}
        >
          {item.articleName}
        </BodyText>
        <CaptionText
          style={[styles.chipMaterial, { color: theme.text.tertiary }]}
          numberOfLines={1}
        >
          {item.materialNumber}
        </CaptionText>
      </View>
      {isFavourited && (
        <View style={styles.bookmarkBadge} pointerEvents="none">
          <BookmarkIcon size={12} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const RecentArticlesStrip: React.FC<Props> = ({ articles, onViewAll }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const favouritedSet = useFavouritedMaterialNumbers();

  const handlePress = useCallback(
    (item: HistoryArticle) => {
      navigationRef.navigate('Search', {
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

  if (articles.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <BodyText style={[styles.sectionTitle, { color: theme.text.primary }]}>
          {t('history.recentlyViewed')}
        </BodyText>
        <TouchableOpacity
          onPress={onViewAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CaptionText
            style={[
              styles.viewAll,
              { color: isDark ? BaseColors.white : BaseColors.merckPurple },
            ]}
          >
            {t('common.viewAll')}
          </CaptionText>
        </TouchableOpacity>
      </View>
      <FlashList
        data={articles}
        horizontal
        keyExtractor={item => item.materialNumber}
        renderItem={({ item }) => (
          <ArticleChip
            item={item}
            onPress={handlePress}
            isFavourited={favouritedSet.has(item.materialNumber)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontWeight: '600',
  },
  viewAll: { fontSize: 13, fontFamily: getFontStyle('body').fontFamily },
  list: { paddingHorizontal: 16, paddingBottom: 4 },
  separator: { width: 10 },
  chip: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chipStrip: { width: 4, backgroundColor: BaseColors.merckPurple },
  chipContent: { flex: 1, padding: 10, justifyContent: 'center' },
  bookmarkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BaseColors.merckPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  chipMaterial: { fontSize: 11 },
});

export default RecentArticlesStrip;
