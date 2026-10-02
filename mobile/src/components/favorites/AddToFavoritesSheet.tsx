import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import type { Article } from '@components/search/ArticleCard';
import {
  getFavoriteLists,
  createFavoriteList,
  getListArticles,
  addArticleToList,
  type FavoriteList,
} from '@services/favoritesListService';
import { favoritesApiService } from '@services/api/favorites.service';
import type { RemoteFavoriteList } from '@/types/favorites.types';
import { toRemoteArticle } from '@/types/favorites.types';
import { analytics } from '@services/analyticsService';

const LIST_NAME_MAX = 25;

interface Props {
  visible: boolean;
  article: Article;
  onClose: () => void;
  onSaved: () => void;
  isLoggedIn?: boolean;
  remoteLists?: RemoteFavoriteList[];
}

const AddToFavoritesSheet: React.FC<Props> = ({
  visible,
  article,
  onClose,
  onSaved,
  isLoggedIn = false,
  remoteLists = [],
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [lists, setLists] = useState<FavoriteList[]>([]);
  const [savedListIds, setSavedListIds] = useState<Set<string>>(new Set());
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      if (isLoggedIn) {
        const displayLists: FavoriteList[] = remoteLists.map(r => ({
          id: String(r.id ?? r.uuid ?? r.name),
          name: r.name,
          createdAt: '',
        }));
        setLists(displayLists);
        if (displayLists.length === 0) setShowNewForm(true);
        const savedIds = new Set<string>(
          remoteLists
            .filter(r =>
              r.articles?.some(
                a => a.materialNumber === article.materialNumber,
              ),
            )
            .map(r => String(r.id ?? r.uuid ?? r.name)),
        );
        setSavedListIds(savedIds);
      } else {
        const allLists = await getFavoriteLists();
        setLists(allLists);
        if (allLists.length === 0) setShowNewForm(true);
        const savedIds = new Set<string>();
        await Promise.all(
          allLists.map(async l => {
            const arts = await getListArticles(l.id);
            if (arts.some(a => a.materialNumber === article.materialNumber))
              savedIds.add(l.id);
          }),
        );
        setSavedListIds(savedIds);
      }
    })();
  }, [visible, article.materialNumber, isLoggedIn, remoteLists]);

  const handlePickList = useCallback(
    async (list: FavoriteList) => {
      if (savedListIds.has(list.id) || saving) return;
      setSaving(true);
      const countBefore = savedListIds.size;
      try {
        if (isLoggedIn) {
          await favoritesApiService.addArticleToList(
            Number(list.id),
            toRemoteArticle(article),
          );
        } else {
          await addArticleToList(list.id, article);
        }
        // Log analytics for favorite added
        analytics.logFavoriteAdded({
          material_number: article.materialNumber,
          list_id: String(list.id),
          list_name: list.name,
          list_item_count_before: countBefore,
          list_item_count_after: countBefore + 1,
          validity_area: 'EU',
          language: 'EN',
          product_name: article.articleName,
        });
        setSaving(false);
        onSaved();
        onClose();
      } catch (error) {
        setSaving(false);
        console.warn('Failed to add article to list:', error);
      }
    },
    [savedListIds, saving, article, isLoggedIn, onSaved, onClose],
  );

  const handleCreateAndSave = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed || saving) return;

    // Duplicate name check (case-insensitive) — applies to both paths
    const isDuplicate = lists.some(
      l => l.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setNameError(t('favorites.duplicateListName'));
      return;
    }

    setSaving(true);
    try {
      if (isLoggedIn) {
        await favoritesApiService.createFavoriteList(trimmed, [
          toRemoteArticle(article),
        ]);
      } else {
        const newList = await createFavoriteList(trimmed);
        await addArticleToList(newList.id, article);
      }
      // Log analytics for list created and item added
      analytics.logFavoritesListCreated({
        list_id: trimmed,
        list_name: trimmed,
        validity_area: 'EU',
        language: 'EN',
      });
      analytics.logFavoriteAdded({
        material_number: article.materialNumber,
        list_id: trimmed,
        list_name: trimmed,
        list_item_count_before: 0,
        list_item_count_after: 1,
        validity_area: 'EU',
        language: 'EN',
        product_name: article.articleName,
      });
      setSaving(false);
      onSaved();
      onClose();
    } catch (err) {
      setSaving(false);
      if (err instanceof Error && err.message === 'DUPLICATE_LIST_NAME') {
        setNameError(t('favorites.duplicateListName'));
      }
    }
  }, [newName, saving, lists, article, isLoggedIn, onSaved, onClose, t]);

  const handleClose = useCallback(() => {
    setShowNewForm(false);
    setNewName('');
    onClose();
  }, [onClose]);

  const styles = getStyles(theme, isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.dialog}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <BodyText style={[styles.dialogTitle, { color: theme.text.primary }]}>
              {t('favorites.saveToList')}
            </BodyText>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Existing lists */}
          {lists.length > 0 && (
            <FlatList
              data={lists}
              keyExtractor={item => item.id}
              style={styles.list}
              renderItem={({ item }) => {
                const alreadySaved = savedListIds.has(item.id);
                return (
                  <TouchableOpacity
                    style={styles.listRow}
                    onPress={() => handlePickList(item)}
                    activeOpacity={alreadySaved ? 1 : 0.7}
                    disabled={alreadySaved || saving}
                  >
                    <View
                      style={[
                        styles.listIconBg,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.1)'
                            : '#EDE9F8',
                        },
                      ]}
                    >
                      <Icon
                        name="favorite"
                        size={16}
                        color={BaseColors.merckPurple}
                      />
                    </View>
                    <BodyText
                      style={[
                        styles.listRowName,
                        {
                          color: alreadySaved
                            ? theme.text.tertiary
                            : theme.text.primary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </BodyText>
                    {alreadySaved && (
                      <Icon
                        name="checkmark-circle"
                        size={18}
                        color={BaseColors.merckPurple}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.rowDivider,
                    {
                      backgroundColor:
                        (theme.border as any)?.primary ?? '#E5E7EB',
                    },
                  ]}
                />
              )}
            />
          )}

          {/* Divider between list and form */}
          {lists.length > 0 && (
            <View
              style={[
                styles.rowDivider,
                { backgroundColor: (theme.border as any)?.primary ?? '#E5E7EB', marginVertical: 4 },
              ]}
            />
          )}

          {/* Create new list row / form */}
          {!showNewForm ? (
            <TouchableOpacity
              style={styles.newListRow}
              onPress={() => setShowNewForm(true)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.listIconBg,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : '#F3F4F6',
                  },
                ]}
              >
                <Icon name="add_circle" size={16} color={theme.text.secondary} />
              </View>
              <BodyText
                style={[styles.newListLabel, { color: theme.text.secondary }]}
              >
                {t('favorites.createNewList')}
              </BodyText>
            </TouchableOpacity>
          ) : (
            <View style={styles.newForm}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text.primary,
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : '#EDE9F8',
                  },
                ]}
                placeholder={t('favorites.listNamePlaceholder')}
                placeholderTextColor={theme.text.placeholder}
                value={newName}
                onChangeText={v => { setNewName(v.slice(0, LIST_NAME_MAX)); setNameError(null); }}
                maxLength={LIST_NAME_MAX}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateAndSave}
              />
              <CaptionText
                style={[styles.charCount, { color: theme.text.tertiary }]}
              >
                {newName.length}/{LIST_NAME_MAX}
              </CaptionText>
              {nameError && (
                <CaptionText style={styles.nameError}>{nameError}</CaptionText>
              )}
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  (!newName.trim() || saving) && styles.createBtnDisabled,
                ]}
                onPress={handleCreateAndSave}
                disabled={!newName.trim() || saving}
                activeOpacity={0.8}
              >
                <BodyText style={styles.createBtnText}>
                  {t('favorites.createAndSave')}
                </BodyText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    dialog: {
      width: '100%',
      backgroundColor: theme.background.primary,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      maxHeight: '75%',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    dialogTitle: {
      fontSize: 17,
      fontWeight: '700',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    list: { maxHeight: 240 },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 12,
    },
    listIconBg: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listRowName: {
      flex: 1,
      fontSize: 15,
      fontFamily: getFontStyle('body').fontFamily,
    },
    rowDivider: { height: StyleSheet.hairlineWidth },
    newListRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      gap: 12,
    },
    newListLabel: { fontSize: 15, fontFamily: getFontStyle('body').fontFamily },
    newForm: { paddingTop: 8 },
    input: {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 6,
    },
    charCount: {
      textAlign: 'right',
      marginBottom: 4,
      fontSize: 12,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    nameError: {
      color: BaseColors.error,
      fontSize: 12,
      fontFamily: getFontStyle('caption').fontFamily,
      marginBottom: 10,
    },
    createBtn: {
      backgroundColor: BaseColors.merckPurple,
      borderRadius: 24,
      paddingVertical: 13,
      alignItems: 'center',
    },
    createBtnDisabled: { opacity: 0.45 },
    createBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
  });

export default AddToFavoritesSheet;
