import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BodyText, Heading1, Heading2 } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { BaseColors } from '@theme/colors';
import { getFontStyle } from '@utils/fonts';
import searchSuggestionData from '@/data/searchSuggestionData.json';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AISearchOverlayProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  onSearch?: (query: string) => Promise<any>;
}

const AISearchOverlay: React.FC<AISearchOverlayProps> = ({
  visible,
  onClose,
  userName = 'there',
  onSearch,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load suggestion tags from JSON data
  const suggestionTags = searchSuggestionData.suggestions.map(
    item => item.text,
  );

  // API call handler - triggers after 2 letters
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length >= 2 && onSearch) {
        setIsLoading(true);
        try {
          const results = await onSearch(searchQuery);
          setSearchResults(results || []);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    // Debounce search by 500ms
    const timeoutId = setTimeout(performSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.95)'
                : 'rgba(255, 255, 255, 0.98)',
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="close"
              size={28}
              color={isDark ? theme.text.secondary : theme.text.primary}
            />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Greeting Section */}
            <View style={styles.greetingSection}>
              <BodyText
                style={[
                  styles.greetingText,
                  { color: isDark ? BaseColors.gray400 : BaseColors.gray600 },
                ]}
              >
                {t('aiSearch.greeting', { name: userName })}
              </BodyText>
              <View style={styles.titleContainer}>
                <Heading1
                  style={[
                    styles.mainTitle,
                    {
                      color: isDark
                        ? BaseColors.merckPurpleLight
                        : BaseColors.merckPurple,
                    },
                  ]}
                >
                  {t('aiSearch.title')}
                </Heading1>
              </View>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : theme.background.secondary,
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.2)'
                    : theme.border.primary,
                },
              ]}
            >
              <Icon
                name="sparkle"
                size={24}
                color={
                  isDark ? BaseColors.merckPurpleLight : BaseColors.merckPurple
                }
                style={styles.searchIcon}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: isDark ? BaseColors.white : theme.text.primary },
                ]}
                placeholder={t('aiSearch.placeholder')}
                placeholderTextColor={
                  isDark ? 'rgba(255, 255, 255, 0.5)' : theme.text.tertiary
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                multiline={false}
                numberOfLines={1}
              />
              {isLoading && (
                <View style={styles.loadingIndicator}>
                  <BodyText
                    style={{
                      color: isDark
                        ? BaseColors.merckPurpleLight
                        : BaseColors.merckPurple,
                    }}
                  >
                    ...
                  </BodyText>
                </View>
              )}
              {searchQuery.length > 0 && !isLoading && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="close"
                    size={20}
                    color={isDark ? BaseColors.gray400 : theme.text.tertiary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Suggestion Tags */}
            {searchQuery.length < 2 && (
              <View style={styles.tagsContainer}>
                {suggestionTags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : theme.background.secondary,
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.15)'
                          : theme.border.primary,
                      },
                    ]}
                    onPress={() => handleTagPress(tag)}
                  >
                    <BodyText
                      style={[
                        styles.tagText,
                        {
                          color: isDark ? BaseColors.white : theme.text.primary,
                        },
                      ]}
                    >
                      {tag}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Search Results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Heading2
                  style={[
                    styles.resultsTitle,
                    { color: isDark ? BaseColors.white : theme.text.primary },
                  ]}
                >
                  {t('aiSearch.results')}
                </Heading2>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.resultItem,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : theme.background.secondary,
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.15)'
                          : theme.border.primary,
                      },
                    ]}
                  >
                    <BodyText
                      style={{
                        color: isDark ? BaseColors.white : theme.text.primary,
                      }}
                    >
                      {result.title || result.name || JSON.stringify(result)}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No Results */}
            {searchQuery.length >= 2 &&
              !isLoading &&
              searchResults.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <BodyText
                    style={{
                      color: isDark
                        ? theme.text.secondary
                        : theme.text.tertiary,
                    }}
                  >
                    {t('aiSearch.noResultsFor', { query: searchQuery })}
                  </BodyText>
                </View>
              )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  greetingSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: getFontStyle('bodyMedium').fontSize,
    lineHeight: getFontStyle('bodyMedium').lineHeight,
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  mainTitle: {
    fontFamily: getFontStyle('h1').fontFamily,
    fontSize: 42,
    lineHeight: 52,
    textAlign: 'center',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 32,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: getFontStyle('bodyLarge').fontFamily,
    fontSize: getFontStyle('bodyLarge').fontSize,
    height: 56,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: getFontStyle('body').fontSize,
    lineHeight: getFontStyle('body').lineHeight,
  },
  resultsContainer: {
    marginTop: 24,
  },
  resultsTitle: {
    fontFamily: getFontStyle('h3').fontFamily,
    fontSize: getFontStyle('h3').fontSize,
    lineHeight: getFontStyle('h3').lineHeight,
    marginBottom: 16,
    fontWeight: '600',
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  noResultsContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
});

export default AISearchOverlay;
