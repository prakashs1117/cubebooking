import React, { useCallback, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { getFontStyle } from '@utils/fonts';
import type { Article } from '@components/search/ArticleCard';
import ArticleCard from '@components/search/ArticleCard';
import { CaptionText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import SwipeHintOverlay from '@components/common/SwipeHintOverlay';

export interface ArticleRowProps {
  article: Article;
  onPress: (article: Article) => void;
  onRemove: (materialNumber: string) => void;
  enableSwipeHint?: boolean;
  totalArticles?: number;
  swipeHintRef?: (ref: Swipeable | null) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
}

const ArticleRow: React.FC<ArticleRowProps> = ({
  article,
  onPress,
  onRemove,
  enableSwipeHint = false,
  totalArticles = 0,
  swipeHintRef,
  selectionMode = false,
  isSelected = false,
  onToggle,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const swipeRef = useRef<Swipeable>(null);
  const setRef = useCallback((ref: Swipeable | null) => {
    (swipeRef as React.MutableRefObject<Swipeable | null>).current = ref;
    swipeHintRef?.(ref);
  }, [swipeHintRef]);

  const renderRightActions = useCallback(
    () => (
      <TouchableOpacity
        style={styles.removeAction}
        onPress={() => {
          swipeRef.current?.close();
          onRemove(article.materialNumber);
        }}
        activeOpacity={0.85}
      >
        <Icon name="trash" size={18} color="#FFFFFF" />
        <CaptionText style={styles.removeActionText}>{t('favorites.remove')}</CaptionText>
      </TouchableOpacity>
    ),
    [article.materialNumber, onRemove, t],
  );

  const handleRowPress = useCallback(() => {
    if (selectionMode && onToggle) {
      onToggle();
    } else {
      onPress(article);
    }
  }, [selectionMode, onToggle, onPress, article]);

  const content = (
    <View style={[styles.articleRowWrapper, selectionMode && styles.selectionModeRow]}>
      {selectionMode && (
        <TouchableOpacity onPress={onToggle} style={styles.checkboxContainer}>
          <Icon
            name={isSelected ? 'checkbox-checked' : 'checkbox-unchecked'}
            size={20}
            color={isDark ? BaseColors.white : BaseColors.merckPurple}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.articleCardWrapper}
        onPress={handleRowPress}
        activeOpacity={0.7}
      >
        <ArticleCard article={article} onPress={onPress} enableContextMenu={false} enableSwipeFavourite={false} />
      </TouchableOpacity>
    </View>
  );

  if (selectionMode) {
    return content;
  }

  const swipeableRow = (
    <Swipeable
      ref={setRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      activeOffsetX={[-10, 10]}
    >
      {content}
    </Swipeable>
  );

  if (enableSwipeHint) {
    return (
      <SwipeHintOverlay
        screenKey="favourites"
        ready={totalArticles > 0}
        tooltipTitle={t('swipeHint.home.title')}
        tooltipMessage={t('swipeHint.home.message')}
        swipeableRef={setRef}
      >
        {swipeableRow}
      </SwipeHintOverlay>
    );
  }

  return swipeableRow;
};

const styles = StyleSheet.create({
  removeAction: {
    backgroundColor: '#FF3B30',
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
    marginVertical: 1,
  },
  removeActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: getFontStyle('caption').fontFamily,
  },
  checkboxContainer: {
    paddingRight: 12,
  },
  articleRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionModeRow: {
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  articleCardWrapper: {
    flex: 1,
  },
});

export default ArticleRow;
