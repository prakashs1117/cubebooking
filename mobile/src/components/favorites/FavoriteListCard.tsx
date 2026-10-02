import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FavoriteList } from '@services/favoritesListService';
import type { Article } from '@components/search/ArticleCard';
import AppModal, { type ModalConfig } from '@components/modals/AppModal';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import ArticleRow from '@components/favorites/ArticleRow';

interface Props {
  list: FavoriteList;
  articles: Article[];
  onDelete: (id: string, name: string) => void;
  onArticlePress: (article: Article) => void;
  onRemoveArticle: (listId: string, materialNumber: string) => void;
  enableSwipeHint?: boolean;
  selectionMode?: boolean;
  selectedArticles?: Set<string>;
  isListFullySelected?: boolean;
  isListPartiallySelected?: boolean;
  onToggleList?: () => void;
  onToggleArticle?: (materialNumber: string) => void;
  onEnterSelectionMode?: () => void;
}

const FavoriteListCard: React.FC<Props> = ({
  list,
  articles,
  onDelete,
  onArticlePress,
  onRemoveArticle,
  enableSwipeHint = false,
  selectionMode = false,
  selectedArticles = new Set(),
  isListFullySelected = false,
  isListPartiallySelected = false,
  onToggleList,
  onToggleArticle,
  onEnterSelectionMode,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const toggleExpanded = useCallback(() => {
    setExpanded(v => !v);
  }, []);

  const handleKebab = useCallback(() => {
    setModal({
      variant: 'destructive',
      title: t('favorites.deleteListTitle'),
      message: t('favorites.deleteListMessage', { name: list.name }),
      confirmLabel: t('favorites.delete'),
      cancelLabel: t('common.cancel'),
      onConfirm: () => onDelete(list.id, list.name),
    });
  }, [list, onDelete, t]);

  const handleRemove = useCallback(
    (materialNumber: string) => onRemoveArticle(list.id, materialNumber),
    [list.id, onRemoveArticle],
  );

  const handlePrint = useCallback(() => {
    onEnterSelectionMode?.();
  }, [onEnterSelectionMode]);

  const handleShare = useCallback(async () => {
    const shareUrl = `https://www.mymsafety.de/favoriteLists?import=${list.id}`;
    try {
      await Share.share({
        message: shareUrl,
        title: t('favorites.shareList'),
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [list.id, t]);

  // const cardBg = isDark ? theme.background.secondary : '#FFFFFF';
  // const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';

  return (
    <>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.background.secondary, marginVertical: 1 },
        ]}
      >
        {/* Collapsed header row */}
        <TouchableOpacity
          style={styles.rowHeader}
          onPress={toggleExpanded}
          activeOpacity={0.7}
        >
          {selectionMode && (
            <TouchableOpacity
              onPress={onToggleList}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.checkboxLeft}
            >
              <Icon
                name={
                  isListFullySelected
                    ? 'checkbox-checked'
                    : isListPartiallySelected
                      ? 'checkbox-indeterminate'
                      : 'checkbox-unchecked'
                }
                size={20}
                color={isDark ? BaseColors.white : BaseColors.merckPurple}
              />
            </TouchableOpacity>
          )}
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isDark ? BaseColors.white : BaseColors.merckPurple}
            style={styles.chevron}
          />
          <View style={styles.rowMeta}>
            <BodyText
              style={[styles.listName, { color: theme.text.primary }]}
              numberOfLines={1}
            >
              {list.name}
            </BodyText>
            <CaptionText
              style={[styles.listCount, { color: theme.text.secondary }]}
            >
              {articles.length} article{articles.length !== 1 ? 's' : ''}
            </CaptionText>
          </View>
          <View style={styles.rowActions}>
            <TouchableOpacity
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionBtn}
            >
              <Icon name="share" size={20} color={theme.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePrint}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionBtn}
            >
              <Icon name="printer" size={20} color={theme.text.secondary} />
            </TouchableOpacity>
            {!selectionMode && (
              <TouchableOpacity
                onPress={handleKebab}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.actionBtn}
              >
                <Icon name="options" size={20} color={theme.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded article rows */}
        {expanded && (
          <View style={[]}>
            {articles.length === 0 ? (
              <View style={styles.emptyRow}>
                <CaptionText
                  style={[styles.emptyText, { color: theme.text.tertiary }]}
                >
                  {t('favorites.noItems')}
                </CaptionText>
              </View>
            ) : (
              articles.map((article, index) => (
                <View key={article.materialNumber} style={styles.articleRowContainer}>
                  <ArticleRow
                    article={article}
                    onPress={onArticlePress}
                    onRemove={handleRemove}
                    enableSwipeHint={enableSwipeHint && index === 0}
                    totalArticles={articles.length}
                    selectionMode={selectionMode}
                    isSelected={selectedArticles.has(article.materialNumber)}
                    onToggle={() => onToggleArticle?.(article.materialNumber)}
                  />
                </View>
              ))
            )}
          </View>
        )}
      </View>
      <AppModal config={modal} onClose={() => setModal(null)} />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    // marginVertical: 5,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chevron: { marginRight: 10 },
  rowMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    flexShrink: 1,
  },
  listCount: {
    fontSize: 12,
    fontFamily: getFontStyle('caption').fontFamily,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: { paddingHorizontal: 8 },
  emptyRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: getFontStyle('caption').fontFamily,
    fontStyle: 'italic',
  },
  articleRowContainer: {
    marginVertical: 1,
  },
  checkboxLeft: {
    paddingRight: 12,
  },
});

export default FavoriteListCard;
