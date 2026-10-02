import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import SearchTags from '@components/common/SearchTags';
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
} from '@services/searchHistoryService';
import { searchEvents } from '@services/api/events.service';
import { formatEventTime, formatEventDate } from '@utils/eventTransformers';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  onEventSelect?: (slug: string) => void;
}

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  startTime: string;
  endTime: string;
  date?: string;
  time?: string;
  type: 'event';
}

/**
 * SearchModal Component
 * Full-screen modal with search input and results
 */
const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSearch,
  placeholder,
  onEventSelect,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRTL = i18n.language === 'ar';

  // Load search history when modal opens
  useEffect(() => {
    if (visible) {
      loadSearchHistory();
    }
  }, [visible]);

  // Load search history from storage
  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setRecentSearches(history);
  };

  // Auto-focus input when modal opens
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      setSearchQuery('');
      setResults([]);
    }
  }, [visible, fadeAnim]);

  // Perform search when query changes (with debounce)
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      // Debounce search by 500ms
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery.trim());
      }, 500);
    } else {
      setResults([]);
      setError(null);
    }

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  /**
   * Perform API search for events
   */
  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    console.log('@123 asd performSearch. ');
    try {
      const response = await searchEvents(query, 1, 20);

      // Transform API events to SearchResult format
      const searchResults: SearchResult[] = response.events.map(event => ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        date: formatEventDate(event.startTime),
        time: `${formatEventTime(event.startTime)} - ${formatEventTime(
          event.endTime,
        )}`,
        type: 'event' as const,
      }));

      setResults(searchResults);

      // Trigger onSearch callback
      if (onSearch) {
        onSearch(query);
      }

      console.log(`Found ${searchResults.length} events for "${query}"`);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search events');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    inputRef.current?.focus();
  };

  const handleResultPress = async (result: SearchResult) => {
    console.log('🔍 Selected event:', result);
    console.log('🔍 Navigating to EventDetail with slug:', result.slug);

    // Add to search history
    await addToSearchHistory(result.title);

    // Close modal first
    onClose();

    // Trigger callback if provided
    if (onSearch) {
      onSearch(result.title);
    }

    // If parent provided onEventSelect callback, use it
    if (onEventSelect) {
      console.log('🔍 Using parent onEventSelect callback');
      onEventSelect(result.slug);
      return;
    }

    // Navigate to event detail screen with slug
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      try {
        console.log('🔍 Attempting navigation to EventDetail...');

        // Method 1: Try nested navigation to Events tab -> EventDetail screen
        navigation.navigate('Events', {
          screen: 'EventDetail',
          params: { slug: result.slug },
        });

        console.log(
          '✅ Navigation successful to EventDetail with slug:',
          result.slug,
        );
      } catch (error) {
        console.error('❌ Primary navigation failed:', error);

        // Method 2: Try using dispatch with CommonActions
        try {
          console.log('🔍 Trying CommonActions navigation...');
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Events',
              params: {
                screen: 'EventDetail',
                params: { slug: result.slug },
              },
            }),
          );
          console.log('✅ CommonActions navigation successful');
        } catch (dispatchError) {
          console.error('❌ CommonActions navigation failed:', dispatchError);

          // Method 3: Last resort - try direct navigation (works if already in Events tab)
          try {
            console.log('🔍 Trying direct navigation...');
            navigation.navigate('EventDetail', { slug: result.slug });
            console.log('✅ Direct navigation successful');
          } catch (directError) {
            console.error('❌ All navigation methods failed:', directError);
          }
        }
      }
    }, 150);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleTagPress = async (tag: string) => {
    setSearchQuery(tag);
    // Add to search history
    await addToSearchHistory(tag);
    // Reload history
    await loadSearchHistory();
    // Search will be triggered automatically by useEffect when searchQuery changes
  };

  const handleRemoveSearch = async (search: string) => {
    await removeFromSearchHistory(search);
    await loadSearchHistory();
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    await loadSearchHistory();
  };

  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      await addToSearchHistory(searchQuery);
      await loadSearchHistory();
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.background.card }]}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultIcon}>
        <Icon name="calendar" size={20} color={theme.text.tertiary} />
      </View>
      <View style={styles.resultContent}>
        <Text
          style={[
            styles.resultTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {item.title}
        </Text>
        {item.date && (
          <Text
            style={[
              styles.resultSubtitle,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
          >
            {item.date}
          </Text>
        )}
        {item.time && (
          <Text
            style={[
              styles.resultTime,
              {
                color: theme.text.tertiary,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
          >
            {item.time}
          </Text>
        )}
      </View>
      <Icon name="arrow-right-small" size={20} color={theme.text.tertiary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    // Show search tags when no query
    if (!searchQuery) {
      return (
        <SearchTags
          recentSearches={recentSearches}
          onTagPress={handleTagPress}
          onClearHistory={handleClearHistory}
          onRemoveSearch={handleRemoveSearch}
        />
      );
    }

    // Show loading state
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.text.primary} />
          <Text
            style={[
              styles.emptyText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            Searching events...
          </Text>
        </View>
      );
    }

    // Show error state
    if (error) {
      return (
        <View style={styles.emptyState}>
          <Icon name="alert-circle" size={48} color={theme.text.tertiary} />
          <Text
            style={[
              styles.emptyText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            {error}
          </Text>
        </View>
      );
    }

    // Show no results message when query but no results
    return (
      <View style={styles.emptyState}>
        <Icon name="search" size={48} color={theme.text.tertiary} />
        <Text
          style={[
            styles.emptyText,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {t('search.noResults')}
        </Text>
        <Text
          style={[
            styles.emptySubtext,
            {
              color: theme.text.tertiary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
        >
          Try a different search term
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
      supportedOrientations={[
        'portrait',
        'landscape',
        'portrait-upside-down',
        'landscape-left',
        'landscape-right',
      ]}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: theme.background.primary,
                  opacity: fadeAnim,
                },
              ]}
            >
              {/* Header with search input */}
              <View
                style={[
                  styles.header,
                  {
                    borderBottomColor: theme.border.secondary,
                    paddingTop: insets.top + 12,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={handleClose}
                  style={[
                    styles.backButton,
                    { backgroundColor: theme.background.card },
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={isRTL ? 'chevron-right' : 'chevron-left'}
                    size={26}
                    color={theme.text.primary}
                  />
                </TouchableOpacity>

                <View
                  style={[
                    styles.searchInputContainer,
                    { backgroundColor: theme.background.card },
                  ]}
                >
                  <Icon
                    name="search"
                    size={20}
                    color={theme.text.tertiary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.searchInput,
                      {
                        color: theme.text.primary,
                        fontFamily: getFontStyle('body').fontFamily,
                      },
                    ]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={placeholder || t('search.placeholder')}
                    placeholderTextColor={theme.text.tertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={handleSearchSubmit}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={handleClear}
                      style={styles.clearButton}
                    >
                      <Icon
                        name="close"
                        size={20}
                        color={theme.text.tertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Search results */}
              <FlatList
                data={results}
                renderItem={renderSearchResult}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.resultsContainer}
                ListEmptyComponent={renderEmptyState}
                keyboardShouldPersistTaps="handled"
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  resultsContainer: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  resultTime: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchModal;
