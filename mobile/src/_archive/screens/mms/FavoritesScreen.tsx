import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { navigationRef } from '@navigation/navigationRef';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText, CustomText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import type { Article } from '@components/search/ArticleCard';
import RecentArticlesStrip from '@components/favorites/RecentArticlesStrip';
import FavoriteListCard from '@components/favorites/FavoriteListCard';
import ImportFavoritesSheet from '@components/favorites/ImportFavoritesSheet';
import { getArticleHistory } from '@services/articleHistoryService';
import { getSearchHistory } from '@services/searchHistoryService';
import {
  createFavoriteList,
  deleteFavoriteList,
  getFavoriteLists,
  getListArticles,
  removeArticleFromList,
  type FavoriteList,
} from '@services/favoritesListService';
import { favoritesApiService } from '@services/api/favorites.service';
import type { HistoryArticle } from '@services/articleHistoryService';
import { useAuth } from '@context/AuthContext';
import { useFavoriteLists } from '@hooks/useFavoriteLists';
import { analytics } from '@services/analyticsService';

const LIST_NAME_MAX = 25;
const RECENT_ARTICLES_LIMIT = 10;
const RECENT_SEARCHES_LIMIT = 8;

const FavoritesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isGuest, user, pendingMigration, clearPendingMigration } = useAuth();

  const isLoggedIn = !isGuest && !!user;

  const [recentArticles, setRecentArticles] = useState<HistoryArticle[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Guest-only local state
  const [localLists, setLocalLists] = useState<FavoriteList[]>([]);
  const [localListArticles, setLocalListArticles] = useState<
    Record<string, Article[]>
  >({});

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  // Batch print selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  // Authenticated users — API-backed via TanStack Query
  const {
    data: remoteLists = [],
    isLoading: listsLoading,
    isError: listsError,
    refetch: refetchLists,
  } = useFavoriteLists(isLoggedIn);

  // Derive unified display types from whichever data source is active
  const lists: FavoriteList[] = isLoggedIn
    ? remoteLists.map(r => ({
        id: String(r.id ?? r.uuid ?? r.name),
        name: r.name,
        createdAt: new Date().toISOString(),
      }))
    : localLists;

  const listArticles: Record<string, Article[]> = isLoggedIn
    ? Object.fromEntries(
        remoteLists.map(r => [
          String(r.id ?? r.uuid ?? r.name),
          (r.articles ?? []).map(
            a =>
              ({
                materialNumber: a.materialNumber,
                articleName: a.articleName,
                substance: a.substance ?? '',
                casNumber: a.casNumber ?? '',
                articleNumber: a.articleNumber ?? '',
              } as Article),
          ),
        ]),
      )
    : localListArticles;

  const loadAll = useCallback(async () => {
    const [history, searches] = await Promise.all([
      getArticleHistory(),
      getSearchHistory(),
    ]);
    setRecentArticles(history.slice(0, RECENT_ARTICLES_LIMIT));
    setRecentSearches(searches.slice(0, RECENT_SEARCHES_LIMIT));

    if (!isLoggedIn) {
      const savedLists = await getFavoriteLists();
      setLocalLists(savedLists);
      const articlesMap: Record<string, Article[]> = {};
      await Promise.all(
        savedLists.map(async l => {
          articlesMap[l.id] = await getListArticles(l.id);
        }),
      );
      setLocalListArticles(articlesMap);
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
      if (isLoggedIn) {
        refetchLists();
      }
    }, [loadAll, isLoggedIn, refetchLists]),
  );

  const handleCreate = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (isLoggedIn) {
      await favoritesApiService.createFavoriteList(trimmed);
    } else {
      await createFavoriteList(trimmed);
    }
    setNewName('');
    setModalVisible(false);
    if (isLoggedIn) {
      refetchLists();
    } else {
      loadAll();
    }
  }, [newName, isLoggedIn, refetchLists, loadAll]);

  const handleDelete = useCallback(
    async (id: string, _name: string) => {
      // Count items in list before deletion
      const itemsInList = listArticles[id]?.length ?? 0;

      if (isLoggedIn) {
        await favoritesApiService.deleteFavoriteList(Number(id));
      } else {
        await deleteFavoriteList(id);
      }

      // Log analytics for list deleted
      analytics.logFavoritesListDeleted({
        list_id: id,
        list_name: _name,
        item_count_at_deletion: itemsInList,
        validity_area: 'EU',
      });

      if (isLoggedIn) {
        refetchLists();
      } else {
        loadAll();
      }
    },
    [isLoggedIn, refetchLists, loadAll, listArticles],
  );

  const handleRemoveArticle = useCallback(
    async (listId: string, materialNumber: string) => {
      const list = lists.find(l => l.id === listId);
      const listName = list?.name ?? '';
      const itemCountBefore = listArticles[listId]?.length ?? 0;

      if (isLoggedIn) {
        const remoteList = remoteLists.find(
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
        refetchLists();
      } else {
        await removeArticleFromList(listId, materialNumber);
        loadAll();
      }

      // Log analytics for favorite removed
      analytics.logFavoriteRemoved({
        material_number: materialNumber,
        list_id: listId,
        list_name: listName,
        list_item_count_before: itemCountBefore,
        list_item_count_after: Math.max(0, itemCountBefore - 1),
        validity_area: 'EU',
        language: 'EN',
        reason: 'manual_remove',
      });
    },
    [isLoggedIn, remoteLists, refetchLists, loadAll, lists, listArticles],
  );

  const handleArticlePress = useCallback(
    (article: Article) => {
      console.log("@123 ")
      navigationRef.navigate('Favorites', {
        screen: 'ArticleDetail',
        params: {
          article: {
            materialNumber: article.materialNumber,
            articleName: article.articleName,
            substance: article.substance,
            brand: article.brand,
            casNumber: article.casNumber,
            articleNumber: article.articleNumber,
          },
        },
      });
    },
    [],
  );

  const handleViewAllHistory = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  // Batch print selection helpers
  const toggleArticle = useCallback((materialNumber: string) => {
    setSelectedArticles(prev => {
      const next = new Set(prev);
      if (next.has(materialNumber)) {
        next.delete(materialNumber);
      } else {
        next.add(materialNumber);
      }
      return next;
    });
  }, []);

  const toggleList = useCallback((listId: string) => {
    const listArticlesMaterialNumbers = (listArticles[listId] ?? []).map(
      a => a.materialNumber,
    );
    const allSelected = listArticlesMaterialNumbers.every(mn =>
      selectedArticles.has(mn),
    );

    setSelectedArticles(prev => {
      const next = new Set(prev);
      if (allSelected) {
        // Deselect all
        listArticlesMaterialNumbers.forEach(mn => next.delete(mn));
      } else {
        // Select all
        listArticlesMaterialNumbers.forEach(mn => next.add(mn));
      }
      return next;
    });
  }, [selectedArticles, listArticles]);

  const isListFullySelected = useCallback(
    (listId: string): boolean => {
      const listArticlesMaterialNumbers = (listArticles[listId] ?? []).map(
        a => a.materialNumber,
      );
      return (
        listArticlesMaterialNumbers.length > 0 &&
        listArticlesMaterialNumbers.every(mn => selectedArticles.has(mn))
      );
    },
    [selectedArticles, listArticles],
  );

  const isListPartiallySelected = useCallback(
    (listId: string): boolean => {
      const listArticlesMaterialNumbers = (listArticles[listId] ?? []).map(
        a => a.materialNumber,
      );
      return (
        listArticlesMaterialNumbers.length > 0 &&
        !isListFullySelected(listId) &&
        listArticlesMaterialNumbers.some(mn => selectedArticles.has(mn))
      );
    },
    [selectedArticles, listArticles, isListFullySelected],
  );

  const handlePrint = useCallback(() => {
    const selectedArticlesArray = Array.from(selectedArticles)
      .map(materialNumber => {
        for (const articles of Object.values(listArticles)) {
          const found = articles.find(a => a.materialNumber === materialNumber);
          if (found) return found;
        }
        return null;
      })
      .filter((a): a is Article => a !== null);

    navigation.navigate('Favorites', {
      screen: 'BatchLabelPreview',
      params: { articles: selectedArticlesArray },
    });
  }, [selectedArticles, listArticles, navigation]);

  const handleEnterSelectionMode = useCallback((listId: string) => {
    setSelectionMode(true);
    // Pre-select all articles in the list
    const listArticlesMaterialNumbers = (listArticles[listId] ?? []).map(
      a => a.materialNumber,
    );
    setSelectedArticles(
      new Set([...selectedArticles, ...listArticlesMaterialNumbers]),
    );
  }, [listArticles, selectedArticles]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedArticles(new Set());
  }, []);

  const styles = getStyles(theme, isDark);

  const showListsLoading =
    isLoggedIn && listsLoading && remoteLists.length === 0;
  const showListsError = isLoggedIn && listsError && remoteLists.length === 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: selectionMode && selectedArticles.size > 0 ? insets.bottom + 80 : insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stripSection}>
          <RecentArticlesStrip
            articles={recentArticles}
            onViewAll={handleViewAllHistory}
          />
        </View>

        {(recentArticles.length > 0 || recentSearches.length > 0) &&
          lists.length > 0 && (
            <View
              style={[
                styles.divider,
                { backgroundColor: theme.border.primary },
              ]}
            />
          )}

        <View style={styles.listsHeader}>
          <BodyText style={[styles.listsTitle, { color: theme.text.primary }]}>
            {t('favorites.myLists')}
          </BodyText>
          <View style={styles.listsHeaderRight}>
            {!showListsLoading && !selectionMode && (
              <CaptionText
                style={[styles.listsCount, { color: theme.text.tertiary }]}
              >
                {lists.length} list{lists.length !== 1 ? 's' : ''}
              </CaptionText>
            )}
            {selectionMode ? (
              <TouchableOpacity
                style={[styles.addBtn, { opacity: 1 }]}
                onPress={handleCancelSelection}
                activeOpacity={0.75}
              >
                <CustomText
                  variant="bodySmall"
                  style={[
                    styles.addBtnText,
                    {
                      color: isDark ? BaseColors.white : BaseColors.merckPurple,
                    },
                  ]}
                >
                  {t('common.cancel')}
                </CustomText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.75}
              >
                <Icon
                  name="add_circle"
                  size={20}
                  color={isDark ? BaseColors.white : BaseColors.merckPurple}
                />
                <CustomText
                  variant="bodySmall"
                  style={[
                    styles.addBtnText,
                    {
                      color: isDark ? BaseColors.white : BaseColors.merckPurple,
                    },
                  ]}
                >
                  {t('favorites.addNew') || 'Add New'}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showListsLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={BaseColors.merckPurple} />
          </View>
        )}

        {showListsError && (
          <View style={styles.errorRow}>
            <CaptionText
              style={[styles.errorText, { color: theme.text.secondary }]}
            >
              {t('favorites.loadError')}
            </CaptionText>
            <TouchableOpacity
              onPress={() => refetchLists()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CaptionText
                style={[styles.retryText, { color: BaseColors.merckPurple }]}
              >
                {t('common.retry')}
              </CaptionText>
            </TouchableOpacity>
          </View>
        )}

        {!showListsLoading &&
          !showListsError &&
          (lists.length > 0 ? (
            lists.map((list, listIndex) => (
              <View key={list.id} style={styles.favoriteListWrapper}>
                <FavoriteListCard
                  list={list}
                  articles={listArticles[list.id] ?? []}
                  onDelete={handleDelete}
                  onArticlePress={handleArticlePress}
                  onRemoveArticle={handleRemoveArticle}
                  enableSwipeHint={listIndex === 0}
                  selectionMode={selectionMode}
                  selectedArticles={selectedArticles}
                  isListFullySelected={isListFullySelected(list.id)}
                  isListPartiallySelected={isListPartiallySelected(list.id)}
                  onToggleList={() => toggleList(list.id)}
                  onToggleArticle={toggleArticle}
                  onEnterSelectionMode={() => handleEnterSelectionMode(list.id)}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyLists}>
              <Icon
                name="favorite-outline"
                size={52}
                color={isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB'}
              />
              <BodyText
                style={[styles.emptyTitle, { color: theme.text.primary }]}
              >
                {t('favorites.empty')}
              </BodyText>
              <CaptionText
                style={[styles.emptyHint, { color: theme.text.tertiary }]}
              >
                {t('favorites.createFirst')}
              </CaptionText>
            </View>
          ))}
      </ScrollView>

      {pendingMigration && pendingMigration.length > 0 && (
        <ImportFavoritesSheet
          lists={pendingMigration}
          onDone={() => {
            clearPendingMigration();
            refetchLists();
          }}
        />
      )}

      {selectionMode && selectedArticles.size > 0 && (
        <TouchableOpacity
          style={[
            styles.printFab,
            {
              backgroundColor: BaseColors.merckPurple,
            },
          ]}
          onPress={handlePrint}
          activeOpacity={0.8}
        >
          <Icon name="printer" size={20} color={BaseColors.white} />
          <BodyText
            style={[styles.printFabText, { color: BaseColors.white }]}
          >
            {t('favorites.print')} ({selectedArticles.size})
          </BodyText>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background.primary,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <BodyText style={[styles.sheetTitle, { color: theme.text.primary }]}>
            {t('favorites.createList')}
          </BodyText>
          <CaptionText
            style={[styles.sheetHint, { color: theme.text.secondary }]}
          >
            {t('favorites.listNameLimit')}
          </CaptionText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text.primary,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDE9F8',
              },
            ]}
            placeholder={t('favorites.listNamePlaceholder')}
            placeholderTextColor={theme.text.placeholder}
            value={newName}
            onChangeText={val => setNewName(val.slice(0, LIST_NAME_MAX))}
            maxLength={LIST_NAME_MAX}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <CaptionText
            style={[styles.charCount, { color: theme.text.tertiary }]}
          >
            {newName.length}/{LIST_NAME_MAX}
          </CaptionText>
          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <CaptionText
                style={[styles.cancelText, { color: theme.text.secondary }]}
              >
                {t('favorites.cancel')}
              </CaptionText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createBtn,
                !newName.trim() && styles.createBtnDisabled,
              ]}
              onPress={handleCreate}
              disabled={!newName.trim()}
              activeOpacity={0.8}
            >
              <BodyText style={styles.createBtnText}>
                {t('favorites.createList')}
              </BodyText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme: any, _isDark: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background.primary },
    scroll: { flex: 1 },
    content: { paddingTop: 20 },
    stripSection: { marginBottom: 4 },
    favoriteListWrapper: {
      marginVertical: 1,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: 16,
      marginVertical: 16,
    },
    listsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    listsHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    listsTitle: {
      fontSize: 15,
      fontWeight: '600',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    listsCount: {
      fontSize: 12,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addBtnText: {
      fontWeight: '600',
      fontSize: 13,
    },
    loadingRow: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    errorText: { fontSize: 13, fontFamily: getFontStyle('caption').fontFamily },
    retryText: {
      fontSize: 13,
      fontWeight: '600',
      fontFamily: getFontStyle('caption').fontFamily,
    },
    emptyLists: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '600',
      marginTop: 14,
      marginBottom: 6,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    emptyHint: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#D1D5DB',
      alignSelf: 'center',
      marginBottom: 20,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    sheetHint: {
      fontSize: 13,
      marginBottom: 16,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    input: {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
    },
    charCount: {
      textAlign: 'right',
      marginTop: 6,
      marginBottom: 20,
      fontSize: 12,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    sheetActions: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    createBtn: {
      flex: 1,
      backgroundColor: '#F5C518',
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: 'center',
    },
    createBtnDisabled: { opacity: 0.45 },
    createBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1C1C1E',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    cancelBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#D1D5DB',
    },
    cancelText: { fontSize: 15, fontFamily: getFontStyle('body').fontFamily },
    printFab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 8,
      position: 'absolute',
      justifyContent: 'center',
      left: 16,
      right: 16,
      bottom: 6,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    printFabText: {
      fontWeight: '600',
      fontSize: 15,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
  });

export default FavoritesScreen;
