import React, { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { useContextMenu } from '@components/common/ContextMenu';
import { useContextMenuState } from '@context/ContextMenuContext';
import { getFontStyle } from '@utils/fonts';
import BookmarkIcon from '@components/icons/BookmarkIcon';
import ArticleInfo from '@components/search/ArticleInfo';

export interface Article {
  materialNumber: string;
  articleName: string;
  substance?: string;
  brand?: string;
  casNumber?: string;
  articleNumber?: string;
}

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
  enableContextMenu?: boolean;
  enableSwipeFavourite?: boolean;
  cardBackground?: string;
  swipeHintRef?: (ref: SwipeableMethods | null) => void;
  isFavourited?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = memo(
  ({
    article,
    onPress,
    enableContextMenu = false,
    enableSwipeFavourite = true,
    cardBackground,
    swipeHintRef,
    isFavourited = false,
  }) => {
    const { t } = useTranslation();
    const { theme, isDark } = useTheme();
    const { openMenu } = useContextMenuState();
    const swipeRef = useRef<SwipeableMethods>(null);
    const setRef = useCallback(
      (ref: SwipeableMethods | null) => {
        (swipeRef as React.MutableRefObject<SwipeableMethods | null>).current =
          ref;
        swipeHintRef?.(ref);
      },
      [swipeHintRef],
    );
    const bodyFontStyle = getFontStyle('caption');

    const { onPressIn, onPressOut, isPressed } = useContextMenu({
      enabled: enableContextMenu,
      actionType: 'addToFavorites',
      article,
    });

    const scale = useSharedValue(1);

    useEffect(() => {
      scale.value = withSpring(isPressed ? 0.96 : 1, {
        mass: 0.3,
        stiffness: 200,
        damping: 15,
      });
    }, [isPressed, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handleAddToFavourite = () => {
      swipeRef.current?.close();
      openMenu(article, 'addToFavorites');
    };

    const renderRightActions = (
      _progress: SharedValue<number>,
      translation: SharedValue<number>,
    ) => {
      const actionStyle = useAnimatedStyle(() => ({
        transform: [
          {
            scale: interpolate(
              translation.value,
              [-80, 0],
              [1, 0.85],
              Extrapolation.CLAMP,
            ),
          },
        ],
      }));

      return (
        <Animated.View style={actionStyle}>
          <TouchableOpacity
            style={[
              styles.favouriteAction,
              {
                backgroundColor: isDark ? '#1B5E20' : '#2E7D32',
              },
            ]}
            onPress={handleAddToFavourite}
            activeOpacity={0.8}
          >
            <BookmarkIcon size={20} color="#FFFFFF" />
            <Text
              style={[
                styles.favouriteLabel,
                {
                  color: '#FFFFFF',
                  fontFamily: bodyFontStyle.fontFamily,
                },
              ]}
            >
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    };

    const cardContent = (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor:
                cardBackground ?? (isDark ? theme.background.card : '#EDE9F8'),
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : theme.border.secondary,
            },
          ]}
          onPress={() => onPress(article)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={article.articleName}
        >
          <View style={styles.body}>
            <ArticleInfo article={article} />
            {isFavourited && (
              <View style={styles.bookmarkBadge} pointerEvents="none">
                <BookmarkIcon
                  size={16}
                  color={isDark ? BaseColors.white : BaseColors.merckPurple}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );

    if (!enableSwipeFavourite) {
      return cardContent;
    }

    return (
      <Swipeable
        ref={setRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        {cardContent}
      </Swipeable>
    );
  },
);

ArticleCard.displayName = 'ArticleCard';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 2,
    marginVertical: 0,
    paddingVertical: 0,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  bookmarkBadge: {
    position: 'absolute',
    top: 0,
    right: 15,
  },
  favouriteAction: {
    width: 80,
    height: '100%',
    marginRight: 16,
    marginVertical: 4,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  favouriteLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default ArticleCard;
