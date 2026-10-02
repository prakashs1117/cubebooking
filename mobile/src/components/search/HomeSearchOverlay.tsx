import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchResultsFlatList from '@components/search/SearchResultsFlatList';
import { ContextMenuModal } from '@components/common/ContextMenu';
import { useTheme } from '@theme/index';
import { navigationRef } from '@navigation/navigationRef';
import { BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import HomeSearchBar from '@components/search/HomeSearchBar';
import { Article } from '@components/search/ArticleCard';
import { searchArticles } from '@services/api/atlasSearch.service';
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
} from '@services/searchHistoryService';
import { useTranslation } from 'react-i18next';

const DEBOUNCE_MS = 400;
const SEARCH_LIMIT = 20;

interface HomeSearchOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const HomeSearchOverlay: React.FC<HomeSearchOverlayProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef('');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const loadHistory = useCallback(async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    if (visible) {
      loadHistory();
    } else {
      currentQueryRef.current = '';
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      setQuery('');
      setResults([]);
      setTotalHits(0);
      setHasSearched(false);
      setIsSearching(false);
      setIsLoadingMore(false);
      setOffset(0);
      setHasMore(false);
      setSearchHistory([]);
    }
  }, [visible, loadHistory]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, []);

  const performSearch = useCallback(async (term: string, searchOffset = 0) => {
    if (!term.trim()) {
      setResults([]);
      setTotalHits(0);
      setHasSearched(false);
      setIsSearching(false);
      setIsLoadingMore(false);
      setOffset(0);
      setHasMore(false);
      return;
    }
    currentQueryRef.current = term;
    if (searchOffset === 0) {
      setIsSearching(true);
      setIsLoadingMore(false);
      setHasSearched(true);
      setResults([]);
      setOffset(0);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const data = await searchArticles(term, SEARCH_LIMIT, searchOffset);
      if (currentQueryRef.current !== term) return;
      const mapped: Article[] = data.results.map(a => ({
        materialNumber: a.materialNumber,
        articleName: a.articleName,
        substance: a.substance !== a.articleName ? a.substance : undefined,
        brand: a.system,
        casNumber: a.casNumber,
        articleNumber: a.articleNumber,
      }));
      setResults(prev => (searchOffset === 0 ? mapped : [...prev, ...mapped]));
      setTotalHits(data.hits);
      setOffset(searchOffset + data.results.length);
      setHasMore(searchOffset + data.results.length < data.hits);
    } catch {
      if (currentQueryRef.current === term && searchOffset === 0) {
        setResults([]);
        setTotalHits(0);
      }
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      debounceTimer.current = setTimeout(
        () => performSearch(text, 0),
        DEBOUNCE_MS,
      );
    },
    [performSearch],
  );

  const handleChipPress = useCallback(
    (chip: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      setQuery(chip);
      performSearch(chip, 0);
    },
    [performSearch],
  );

  const handleChipDelete = useCallback(async (chip: string) => {
    await removeFromSearchHistory(chip);
    setSearchHistory(prev => prev.filter(q => q !== chip));
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  }, []);

  const handleResultPress = useCallback(
    async (article: Article) => {
      if (query.trim()) {
        await addToSearchHistory(query.trim());
      }
      onClose();
      setTimeout(() => {
        navigationRef.navigate('Search', {
          screen: 'ArticleDetail',
          params: { article, cameFromOverlay: true },
        });
      }, 50);
    },
    [query, onClose],
  );

  const loadMore = useCallback(() => {
    if (!isSearching && !isLoadingMore && hasMore && query.trim()) {
      performSearch(query, offset);
    }
  }, [isSearching, isLoadingMore, hasMore, query, offset, performSearch]);

  const handleBarcodePress = useCallback(() => {
    onClose();
    // Use navigationRef so this works correctly from inside a Modal's detached tree
    setTimeout(() => {
      navigationRef.navigate('Search', { screen: 'BarcodeScanner' });
    }, 50);
  }, [onClose]);

  const handleClose = useCallback(() => {
    currentQueryRef.current = '';
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    onClose();
  }, [onClose]);

  const iconColor = isDark ? '#FFFFFF' : BaseColors.merckPurple;

  const renderIdleContent = () => (
    <View style={styles.idleContainer}>
      {searchHistory.length > 0 ? (
        <>
          <View style={styles.historyHeader}>
            <BodyText
              style={[
                styles.historyTitle,
                { color: isDark ? '#FFFFFF' : theme.text.secondary },
              ]}
            >
              {t('search.recentSearches')}
            </BodyText>
            <TouchableOpacity
              onPress={handleClearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <BodyText style={[styles.clearAllText, { color: iconColor }]}>
                {t('search.clearAll')}
              </BodyText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            <View style={styles.chipsColumn}>
              <View style={styles.chipsRow}>
                {searchHistory
                  .filter((_, i) => i % 2 === 0)
                  .map(item => (
                    <HistoryChip
                      key={item}
                      query={item}
                      onPress={handleChipPress}
                      onDelete={handleChipDelete}
                      isDark={isDark}
                    />
                  ))}
              </View>
              <View style={styles.chipsRow}>
                {searchHistory
                  .filter((_, i) => i % 2 === 1)
                  .map(item => (
                    <HistoryChip
                      key={item}
                      query={item}
                      onPress={handleChipPress}
                      onDelete={handleChipDelete}
                      isDark={isDark}
                    />
                  ))}
              </View>
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyHistory}>
          <Icon
            name="clock"
            size={48}
            color={isDark ? 'rgba(255,255,255,0.35)' : '#D1D5DB'}
          />
          <BodyText
            style={[
              styles.emptyHistoryText,
              { color: isDark ? 'rgba(255,255,255,0.6)' : theme.text.tertiary },
            ]}
          >
            {t('search.noRecentSearches')}
          </BodyText>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      onShow={() => {
        inputRef.current?.focus();
      }}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.background.primary }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + 12,
                backgroundColor: BaseColors.merckPurple,
              },
            ]}
          >
            <BodyText
              style={[styles.headerTitle, { color: '#FFFFFF' }]}
            >
              {t('navigation.search')}
            </BodyText>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel={t('search.closeSearch')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <HomeSearchBar
            inputRef={inputRef}
            value={query}
            onChangeText={handleTextChange}
            onSubmit={() => {
              if (debounceTimer.current) clearTimeout(debounceTimer.current);
              performSearch(query, 0);
            }}
            onClear={() => handleTextChange('')}
            onBarcodePress={handleBarcodePress}
          />

          {query.length === 0 ? (
            renderIdleContent()
          ) : (
            <SearchResultsFlatList
              results={results}
              isSearching={isSearching}
              isLoadingMore={isLoadingMore}
              hasSearched={hasSearched}
              hasMore={hasMore}
              query={query}
              totalHits={totalHits}
              onLoadMore={loadMore}
              onArticlePress={handleResultPress}
              contentPaddingHorizontal={16}
              contentPaddingBottom={insets.bottom + 16}
              enableSwipeHint
              showResultCountHeader
            />
          )}
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
      <ContextMenuModal />
    </Modal>
  );
};

interface HistoryChipProps {
  query: string;
  onPress: (q: string) => void;
  onDelete: (q: string) => void;
  isDark: boolean;
}

const HistoryChip: React.FC<HistoryChipProps> = memo(
  ({ query, onPress, onDelete, isDark }) => {
    const { t } = useTranslation();
    const chipBg = isDark ? 'rgba(255,255,255,0.12)' : '#EDE9F8';
    const chipText = isDark ? '#FFFFFF' : BaseColors.merckPurple;
    const displayText = query.length > 24 ? query.slice(0, 24) + '…' : query;

    return (
      <View style={[styles.chip, { backgroundColor: chipBg }]}>
        <TouchableOpacity
          onPress={() => onPress(query)}
          style={styles.chipBody}
        >
          <BodyText style={[styles.chipText, { color: chipText }]}>
            {displayText}
          </BodyText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(query)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={t('search.removeFromHistory', { query })}
          style={styles.chipDelete}
        >
          <Icon
            name="close"
            size={14}
            color={isDark ? 'rgba(255,255,255,0.7)' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

HistoryChip.displayName = 'HistoryChip';

const styles = StyleSheet.create({
  gestureRoot: { flex: 1 },
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: getFontStyle('h3').fontFamily,
    fontSize: 18,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    bottom: 14,
    padding: 4,
  },
  idleContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  historyTitle: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearAllText: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 13,
  },
  chipsScrollContent: {
    paddingRight: 16,
  },
  chipsColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
  },
  chipBody: { paddingRight: 4 },
  chipText: { fontSize: 14, lineHeight: 18 },
  chipDelete: { padding: 2 },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyHistoryText: {
    marginTop: 12,
    fontSize: 15,
  },
});

export default HomeSearchOverlay;
