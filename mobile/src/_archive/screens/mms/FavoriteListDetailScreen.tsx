import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { FavoritesStackParamList } from '@/types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import ArticleCard, { type Article } from '@components/search/ArticleCard';
import {
  getListArticles,
  removeArticleFromList,
} from '@services/favoritesListService';
import { favoritesApiService } from '@services/api/favorites.service';
import { useAuth } from '@context/AuthContext';

type RouteProps = RouteProp<FavoritesStackParamList, 'FavoriteListDetail'>;
type NavProps = StackNavigationProp<
  FavoritesStackParamList,
  'FavoriteListDetail'
>;

const FavoriteListDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const { listId, listName, remoteArticles = [] } = route.params;
  const { isGuest, user } = useAuth();
  const isLoggedIn = !isGuest && !!user;

  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    navigation.setOptions({ title: listName });
  }, [navigation, listName]);

  const load = useCallback(async () => {
    if (isLoggedIn) {
      // Use articles passed from FavoritesScreen (already from API), or fall back to re-fetching
      if (remoteArticles.length > 0) {
        setArticles(
          remoteArticles.map(
            a =>
              ({
                materialNumber: a.materialNumber,
                articleName: a.articleName,
                substance: a.substance ?? '',
                casNumber: a.casNumber ?? '',
                articleNumber: a.articleNumber ?? '',
              } as Article),
          ),
        );
      } else {
        // Re-fetch the full list to get current articles
        try {
          const allLists = await favoritesApiService.fetchFavoriteLists();
          const match = allLists.find(
            r => String(r.id ?? r.uuid ?? r.name) === listId,
          );
          setArticles(
            (match?.articles ?? []).map(
              a =>
                ({
                  materialNumber: a.materialNumber,
                  articleName: a.articleName,
                  substance: a.substance ?? '',
                  casNumber: a.casNumber ?? '',
                  articleNumber: a.articleNumber ?? '',
                } as Article),
            ),
          );
        } catch {
          setArticles([]);
        }
      }
    } else {
      const items = await getListArticles(listId);
      setArticles(items);
    }
  }, [isLoggedIn, listId, remoteArticles]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleArticlePress = useCallback(
    (article: Article) => {
      navigation.navigate('ArticleDetail', { article });
    },
    [navigation],
  );

  const handleRemove = useCallback(
    (materialNumber: string, articleName: string) => {
      Alert.alert(
        'Remove from list',
        `Remove "${articleName}" from ${listName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              if (isLoggedIn) {
                // Find the server article id from the currently displayed articles via a fresh fetch
                try {
                  const allLists =
                    await favoritesApiService.fetchFavoriteLists();
                  const remoteList = allLists.find(
                    r => String(r.id ?? r.uuid ?? r.name) === listId,
                  );
                  const remoteArticle = remoteList?.articles?.find(
                    a => a.materialNumber === materialNumber,
                  );
                  if (remoteArticle?.id) {
                    await favoritesApiService.removeArticleFromList(
                      Number(listId),
                      remoteArticle.id,
                    );
                  }
                } catch {
                  // fall through
                }
                load();
              } else {
                await removeArticleFromList(listId, materialNumber);
                load();
              }
            },
          },
        ],
      );
    },
    [listId, listName, isLoggedIn, load],
  );

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <View style={styles.itemRow}>
        <View style={styles.itemCard}>
          <ArticleCard article={item} onPress={handleArticlePress} enableSwipeFavourite={false} />
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item.materialNumber, item.articleName)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Remove ${item.articleName} from list`}
        >
          <Icon name="close" size={16} color={theme.text.tertiary} />
        </TouchableOpacity>
      </View>
    ),
    [handleArticlePress, handleRemove, theme],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background.primary }]}>
      {articles.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="favorite-outline" size={56} color={theme.text.tertiary} />
          <BodyText style={[styles.emptyTitle, { color: theme.text.primary }]}>
            No articles yet
          </BodyText>
          <CaptionText
            style={[styles.emptyHint, { color: theme.text.tertiary }]}
          >
            Search for articles and save them to this list
          </CaptionText>
        </View>
      ) : (
        <FlashList
          data={articles}
          keyExtractor={item => item.materialNumber}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 12, marginVertical: 1 },
  itemCard: { flex: 1 },
  removeBtn: { padding: 8, marginLeft: 4 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: getFontStyle('bodyMedium').fontFamily,
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: getFontStyle('caption').fontFamily,
  },
});

export default FavoriteListDetailScreen;
