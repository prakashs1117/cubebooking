import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import {
  FAQSearchBar,
  FAQItem,
  FAQCategoryFilter,
  FAQEmptyState,
} from '@components/faq';
import { useFAQData } from '@hooks/useFAQData';
import { FAQItem as FAQItemType } from '@/types/faq.types';

/**
 * FAQScreen
 *
 * Main FAQ page with search, category filtering, and expandable FAQ items.
 * Data is loaded from JSON but structured to work with API.
 */
const FAQScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // FAQ data
  const {
    faqs,
    categories,
    isLoading,
    error,
    refresh,
    searchFAQs,
    getFAQsByCategory,
  } = useFAQData();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filtered FAQs
  const filteredFAQs = useMemo(() => {
    let result: FAQItemType[] = faqs;

    // Filter by category
    if (selectedCategory) {
      result = getFAQsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = searchFAQs(searchQuery);
      if (selectedCategory) {
        result = result.filter(faq => faq.category === selectedCategory);
      }
    }

    return result;
  }, [faqs, selectedCategory, searchQuery, searchFAQs, getFAQsByCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleToggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Render search section
  const renderSearch = () => (
    <View style={styles.searchSection}>
      <FAQSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('faq.searchPlaceholder')}
      />
    </View>
  );

  // Render category filter
  const renderCategoryFilter = () => (
    <FAQCategoryFilter
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      showAllOption
      allOptionLabel={t('common.all')}
    />
  );

  // Render results count
  const renderResultsCount = () => {
    if (searchQuery.trim() || selectedCategory) {
      return (
        <View style={styles.resultsCount}>
          <CustomText
            style={[styles.resultsText, { color: theme.text.secondary }]}
          >
            {filteredFAQs.length === 0
              ? t('faq.noResultsFound')
              : t('faq.resultsFound', { count: filteredFAQs.length })}
          </CustomText>
        </View>
      );
    }
    return null;
  };

  // Render FAQ list
  const renderFAQList = () => {
    if (filteredFAQs.length === 0) {
      return (
        <FAQEmptyState
          title={searchQuery ? t('faq.noResultsFound') : t('faq.noFaqsAvailable')}
          message={
            searchQuery
              ? t('faq.tryDifferentKeywords')
              : t('faq.checkBackLater')
          }
          icon={searchQuery ? 'search' : 'info-circle'}
        />
      );
    }

    return (
      <View style={styles.faqList}>
        {filteredFAQs.map(faq => (
          <FAQItem
            key={faq.id}
            item={faq}
            isExpanded={expandedId === faq.id}
            onToggle={() => handleToggleFAQ(faq.id)}
          />
        ))}
      </View>
    );
  };

  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={48} color={theme.text.error} />
      <CustomText style={[styles.errorTitle, { color: theme.text.error }]}>
        {t('common.error')}
      </CustomText>
      <CustomText
        style={[styles.errorMessage, { color: theme.text.secondary }]}
      >
        {error}
      </CustomText>
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.text.link} />
      <CustomText style={[styles.loadingText, { color: theme.text.secondary }]}>
        {t('faq.loading')}
      </CustomText>
    </View>
  );

  // Main content
  const renderContent = () => {
    if (isLoading && !refreshing) {
      return renderLoading();
    }

    if (error) {
      return renderError();
    }

    return (
      <>
        {renderSearch()}
        {renderCategoryFilter()}
        {renderResultsCount()}
        {renderFAQList()}
      </>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.text.link}
            colors={[theme.text.link]}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  sourceIndicator: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sourceText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  faqList: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FAQScreen;
