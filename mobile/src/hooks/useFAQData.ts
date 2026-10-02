/**
 * useFAQData Hook
 *
 * Custom hook to fetch and manage FAQ data.
 * Handles loading from JSON or API, with caching support.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFAQData,
  clearFAQCache,
  prefetchFAQData,
} from '@services/faqService';
import { FAQItem, FAQCategory } from '@/types/faq.types';

interface UseFAQDataReturn {
  // Data
  faqs: FAQItem[];
  categories: FAQCategory[];

  // Loading states
  isLoading: boolean;

  // Error states
  error: string | null;

  // Data source
  source: 'json' | 'api' | 'cache' | null;

  // Actions
  refresh: () => Promise<void>;
  clearCache: () => void;
  prefetch: () => Promise<void>;

  // Filtering
  searchFAQs: (query: string) => FAQItem[];
  getFAQsByCategory: (categoryId: string) => FAQItem[];
}

export const useFAQData = (): UseFAQDataReturn => {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'en') as 'en' | 'fr' | 'ar';

  // State
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'json' | 'api' | 'cache' | null>(null);

  /**
   * Load FAQ data
   */
  const loadFAQData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getFAQData();

      if (response.success && response.data) {
        const languageData =
          response.data.languages[currentLanguage] ||
          response.data.languages.en;

        setFaqs(languageData.items.sort((a, b) => a.order - b.order));
        setCategories(
          languageData.categories.sort((a, b) => a.order - b.order),
        );
        setSource(response.source);

        if (__DEV__) {
          console.log(
            `✅ Loaded ${languageData.items.length} FAQs for ${currentLanguage} from ${response.source}`,
          );
        }
      } else {
        setError(response.error || 'Failed to load FAQ data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error loading FAQ data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  /**
   * Refresh FAQ data (clears cache and reloads)
   */
  const refresh = useCallback(async () => {
    if (__DEV__) {
      console.log('🔄 Refreshing FAQ data...');
    }
    clearFAQCache();
    await loadFAQData();
  }, [loadFAQData]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    clearFAQCache();
    if (__DEV__) {
      console.log('🗑️ FAQ cache cleared');
    }
  }, []);

  /**
   * Prefetch FAQ data
   */
  const prefetch = useCallback(async () => {
    await prefetchFAQData();
  }, []);

  /**
   * Search FAQs by query
   */
  const searchFAQs = useCallback(
    (query: string): FAQItem[] => {
      if (!query.trim()) {
        return faqs;
      }

      const lowerQuery = query.toLowerCase();

      return faqs.filter(
        faq =>
          faq.question.toLowerCase().includes(lowerQuery) ||
          faq.answer.toLowerCase().includes(lowerQuery) ||
          faq.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
      );
    },
    [faqs],
  );

  /**
   * Get FAQs by category
   */
  const getFAQsByCategory = useCallback(
    (categoryId: string): FAQItem[] => {
      return faqs.filter(faq => faq.category === categoryId);
    },
    [faqs],
  );

  // Load FAQ data on mount and when language changes
  useEffect(() => {
    loadFAQData();
  }, [loadFAQData]);

  return {
    // Data
    faqs,
    categories,

    // Loading states
    isLoading,

    // Error states
    error,

    // Data source
    source,

    // Actions
    refresh,
    clearCache,
    prefetch,

    // Filtering
    searchFAQs,
    getFAQsByCategory,
  };
};

export default useFAQData;
