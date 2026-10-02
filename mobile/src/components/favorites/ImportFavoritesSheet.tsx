import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { getFontStyle } from '@utils/fonts';
import { favoritesApiService } from '@services/api/favorites.service';
import { clearAllLocalFavorites } from '@services/favoritesListService';
import { toRemoteFavoriteList, toRemoteArticle } from '@/types/favorites.types';
import type {
  LocalFavoritesEntry,
  RemoteFavoriteList,
} from '@/types/favorites.types';
import { AppModal, ModalConfig } from '@components/modals';

const Colors = {
  primary: '#4A0E8F',
  accent: '#F5C518',
  textPrimary: '#1C1C1E',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
  rowBg: '#F9F7FF',
};

interface ImportFavoritesSheetProps {
  lists: LocalFavoritesEntry[];
  onDone: () => void;
  existingRemoteLists?: RemoteFavoriteList[];
}

const MAX_PREVIEW = 4;

const ImportFavoritesSheet: React.FC<ImportFavoritesSheetProps> = ({
  lists,
  onDone,
}) => {
  const { t } = useTranslation();
   
  const sheetRef = useRef<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  useEffect(() => {
    const id = setTimeout(() => sheetRef.current?.present(), 50);
    return () => clearTimeout(id);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="none"
      />
    ),
    [],
  );

  const totalItems = lists.reduce((sum, e) => sum + e.articles.length, 0);
  const preview = lists.slice(0, MAX_PREVIEW);
  const extra = lists.length - MAX_PREVIEW;

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const payload = lists.map(toRemoteFavoriteList);
      await favoritesApiService.bulkCreateFavoriteLists(payload);
      await clearAllLocalFavorites();
      sheetRef.current?.dismiss();
    } catch {
      setModal({
        variant: 'error',
        title: t('common.error', { defaultValue: 'Error' }),
        message: t('favorites.importFailed', {
          defaultValue: 'Failed to import lists. Please try again.',
        }),
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSkip = async () => {
    await clearAllLocalFavorites();
    sheetRef.current?.dismiss();
  };

  const handleDismiss = useCallback(() => {
    onDone();
  }, [onDone]);

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['55%', '75%']}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.background}
        onDismiss={handleDismiss}
      >
        <BottomSheetView style={styles.content}>
          {/* Icon + Title */}
          <View style={styles.titleRow}>
            <Text style={styles.titleIcon}>📋</Text>
            <Text style={styles.title}>
              {t('favorites.importTitle', {
                defaultValue: 'Import your saved lists?',
              })}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {t('favorites.importDescription', {
              count: lists.length,
              items: totalItems,
              defaultValue: `You saved ${lists.length} list${
                lists.length > 1 ? 's' : ''
              } with ${totalItems} item${
                totalItems !== 1 ? 's' : ''
              } while browsing as a guest. Import them to your account now?`,
            })}
          </Text>

          {/* List preview */}
          <FlatList
            data={preview}
            keyExtractor={item => item.list.id}
            scrollEnabled={false}
            style={styles.listPreview}
            renderItem={({ item }) => (
              <View style={styles.listRow}>
                <View style={styles.listDot} />
                <Text style={styles.listName} numberOfLines={1}>
                  {item.list.name}
                </Text>
                <Text style={styles.listCount}>
                  {t('favorites.itemCount', {
                    count: item.articles.length,
                    defaultValue: `${item.articles.length} item${
                      item.articles.length !== 1 ? 's' : ''
                    }`,
                  })}
                </Text>
              </View>
            )}
          />
          {extra > 0 && (
            <Text style={styles.extraText}>
              {t('favorites.andMore', {
                count: extra,
                defaultValue: `+ ${extra} more list${extra > 1 ? 's' : ''}`,
              })}
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isImporting}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>
                {t('favorites.skip', { defaultValue: 'Skip' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.importButton,
                isImporting && styles.importButtonLoading,
              ]}
              onPress={handleImport}
              disabled={isImporting}
              activeOpacity={0.85}
            >
              <View style={styles.importButtonContent}>
                {isImporting && (
                  <ActivityIndicator
                    color={Colors.textPrimary}
                    size="small"
                    style={styles.spinner}
                  />
                )}
                <Text style={styles.importButtonText}>
                  {t('favorites.importLists', { defaultValue: 'Import Lists' })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </>
  );
};

const styles = StyleSheet.create({
  handle: { backgroundColor: Colors.border, width: 40 },
  background: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  titleIcon: { fontSize: 24 },
  title: {
    fontFamily: getFontStyle('h2').fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  description: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  listPreview: {
    marginBottom: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.rowBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  listName: {
    flex: 1,
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listCount: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  extraText: {
    fontFamily: getFontStyle('caption').fontFamily,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  skipButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: getFontStyle('button').fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  importButton: {
    flex: 2,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonLoading: { opacity: 0.7 },
  importButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: { marginRight: 8 },
  importButtonText: {
    fontFamily: getFontStyle('button').fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

export default ImportFavoritesSheet;
