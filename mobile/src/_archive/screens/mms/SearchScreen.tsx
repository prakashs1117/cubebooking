import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { SearchStackParamList } from '@/types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from '@components/icons/Icon';
import CustomText from '@components/common/CustomText';
import { Article } from '@components/search/ArticleCard';
import SearchResultsFlatList from '@components/search/SearchResultsFlatList';
import { getFontStyle } from '@utils/fonts';
import { useTheme } from '@theme/index';
import { searchArticles } from '@services/api/atlasSearch.service';

const MMS = {
  purple: '#4A0E8F',
  amber: '#F5C518',
  inputBg: '#EDE9F8',
  bg: '#F5F5F7',
  white: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6B7280',
};

const DEBOUNCE_MS = 400;
const SEARCH_LIMIT = 20;

type SearchNavProp = StackNavigationProp<SearchStackParamList, 'SearchList'>;

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchNavProp>();
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const currentQueryRef = useRef('');

  const h3Style = getFontStyle('h3');

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
      if (currentQueryRef.current === term) {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(
        () => performSearch(text, 0),
        DEBOUNCE_MS,
      );
    },
    [performSearch],
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isSearching && !isLoadingMore && query.trim()) {
      performSearch(query, offset);
    }
  }, [hasMore, isSearching, isLoadingMore, query, offset, performSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalHits(0);
    setHasSearched(false);
    setOffset(0);
    setHasMore(false);
    inputRef.current?.focus();
  }, []);

  const handleBarcodePress = useCallback(() => {
    Alert.alert(t('search.scanBarcode'), t('search.scanBarcodeComingSoon'));
  }, [t]);

  const handleArticlePress = useCallback(
    (article: Article) => {
      navigation.navigate('ArticleDetail', { article });
    },
    [navigation],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const inputBg = isDark ? 'rgba(255,255,255,0.1)' : '#EDE9F8';
  const inputIconColor = isDark ? 'rgba(255,255,255,0.6)' : MMS.textSecondary;
  const bodyStyle = getFontStyle('body');

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.background.primary },
      ]}
    >
      {/* Header — brand purple, always fixed */}
      <View style={styles.header}>
        <CustomText
          style={[styles.headerTitle, { fontFamily: h3Style.fontFamily }]}
        >
          {t('common.appName')}
        </CustomText>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={handleBarcodePress}
          activeOpacity={0.7}
        >
          <Icon name="bell-outline" size={22} color={MMS.white} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBarWrapper}>
        <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
          <Icon
            name="search"
            size={18}
            color={inputIconColor}
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={[
              styles.searchInput,
              { fontFamily: bodyStyle.fontFamily, color: theme.text.primary },
            ]}
            placeholder={t('search.placeholder')}
            placeholderTextColor={theme.text.placeholder}
            value={query}
            onChangeText={handleTextChange}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(query, 0)}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close-circle" size={18} color={inputIconColor} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleBarcodePress}
            style={styles.barcodeIcon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon
              name="filter"
              size={20}
              color={isDark ? 'rgba(255,255,255,0.7)' : MMS.purple}
            />
          </TouchableOpacity>
        </View>
        {hasSearched && !isSearching && (
          <CustomText
            style={[
              styles.resultCount,
              { fontFamily: captionStyle.fontFamily },
            ]}
          >
            {totalHits > 0 ? t('search.results', { count: totalHits }) : ''}
          </CustomText>
        )}
      </View>

      {/* Results / empty state */}
      <SearchResultsFlatList
        results={results}
        isSearching={isSearching}
        isLoadingMore={isLoadingMore}
        hasSearched={hasSearched}
        hasMore={hasMore}
        query={query}
        totalHits={totalHits}
        onLoadMore={handleLoadMore}
        onArticlePress={handleArticlePress}
        contentPaddingBottom={24}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MMS.purple,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MMS.white,
    letterSpacing: 0.2,
    fontFamily: getFontStyle('h3').fontFamily,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    backgroundColor: MMS.purple,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: MMS.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 6,
  },
  barcodeIcon: {
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(74,14,143,0.2)',
    paddingVertical: 4,
  },
  resultCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
});

export default SearchScreen;
