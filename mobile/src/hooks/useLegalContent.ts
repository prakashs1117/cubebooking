/**
 * useLegalContent Hook
 *
 * Custom hook to fetch and manage legal content (Privacy Policy and Terms of Service).
 * Handles loading from JSON files or API, with caching support.
 *
 * @example
 * ```tsx
 * const { privacyPolicy, termsOfService, isLoading, error, refresh } = useLegalContent();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error} />;
 *
 * return (
 *   <View>
 *     <Text>{privacyPolicy?.title}</Text>
 *     {privacyPolicy?.sections.map(section => (
 *       <Section key={section.id} {...section} />
 *     ))}
 *   </View>
 * );
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPrivacyPolicy,
  getTermsOfService,
  clearLegalCache,
  prefetchLegalContent,
} from '@services/legalContentService';
import { LegalLanguageContent, LegalDocumentType } from '@/types/legal.types';

interface UseLegalContentReturn {
  // Content
  privacyPolicy: LegalLanguageContent | null;
  termsOfService: LegalLanguageContent | null;

  // Loading states
  isLoading: boolean;
  isLoadingPrivacy: boolean;
  isLoadingTerms: boolean;

  // Error states
  error: string | null;
  privacyError: string | null;
  termsError: string | null;

  // Data source
  source: 'json' | 'api' | 'cache' | null;

  // Actions
  refresh: () => Promise<void>;
  clearCache: (type?: LegalDocumentType) => Promise<void>;
  prefetch: () => Promise<void>;
}

export const useLegalContent = (): UseLegalContentReturn => {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'en') as 'en' | 'fr' | 'ar';

  // State
  const [privacyPolicy, setPrivacyPolicy] =
    useState<LegalLanguageContent | null>(null);
  const [termsOfService, setTermsOfService] =
    useState<LegalLanguageContent | null>(null);

  const [isLoadingPrivacy, setIsLoadingPrivacy] = useState(true);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);

  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const [source, setSource] = useState<'json' | 'api' | 'cache' | null>(null);

  // Computed states
  const isLoading = isLoadingPrivacy || isLoadingTerms;
  const error = privacyError || termsError;

  /**
   * Load Privacy Policy
   */
  const loadPrivacyPolicy = useCallback(async () => {
    setIsLoadingPrivacy(true);
    setPrivacyError(null);

    try {
      const response = await getPrivacyPolicy();

      if (response.success && response.data) {
        const languageContent =
          response.data.languages[currentLanguage] ||
          response.data.languages.en;

        setPrivacyPolicy(languageContent);
        setSource(response.source);

        if (__DEV__) {
          console.log(
            `✅ Loaded Privacy Policy for ${currentLanguage} from ${response.source}`,
          );
        }
      } else {
        setPrivacyError(response.error || 'Failed to load privacy policy');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setPrivacyError(errorMessage);
      console.error('Error loading privacy policy:', err);
    } finally {
      setIsLoadingPrivacy(false);
    }
  }, [currentLanguage]);

  /**
   * Load Terms of Service
   */
  const loadTermsOfService = useCallback(async () => {
    setIsLoadingTerms(true);
    setTermsError(null);

    try {
      const response = await getTermsOfService();

      if (response.success && response.data) {
        const languageContent =
          response.data.languages[currentLanguage] ||
          response.data.languages.en;

        setTermsOfService(languageContent);
        setSource(response.source);

        if (__DEV__) {
          console.log(
            `✅ Loaded Terms of Service for ${currentLanguage} from ${response.source}`,
          );
        }
      } else {
        setTermsError(response.error || 'Failed to load terms of service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTermsError(errorMessage);
      console.error('Error loading terms of service:', err);
    } finally {
      setIsLoadingTerms(false);
    }
  }, [currentLanguage]);

  /**
   * Load all content
   */
  const loadAllContent = useCallback(async () => {
    await Promise.all([loadPrivacyPolicy(), loadTermsOfService()]);
  }, [loadPrivacyPolicy, loadTermsOfService]);

  /**
   * Refresh content (clears cache and reloads)
   */
  const refresh = useCallback(async () => {
    if (__DEV__) {
      console.log('🔄 Refreshing legal content...');
    }
    await clearLegalCache();
    await loadAllContent();
  }, [loadAllContent]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(async (type?: LegalDocumentType) => {
    await clearLegalCache(type);
    if (__DEV__) {
      console.log(`🗑️ Cleared cache for: ${type || 'all'}`);
    }
  }, []);

  /**
   * Prefetch content for performance
   */
  const prefetch = useCallback(async () => {
    await prefetchLegalContent();
  }, []);

  // Load content on mount and when language changes
  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  return {
    // Content
    privacyPolicy,
    termsOfService,

    // Loading states
    isLoading,
    isLoadingPrivacy,
    isLoadingTerms,

    // Error states
    error,
    privacyError,
    termsError,

    // Data source
    source,

    // Actions
    refresh,
    clearCache,
    prefetch,
  };
};

/**
 * Hook to load only Privacy Policy
 */
export const usePrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'en') as 'en' | 'fr' | 'ar';

  const [content, setContent] = useState<LegalLanguageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'json' | 'api' | 'cache' | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPrivacyPolicy();

      if (response.success && response.data) {
        const languageContent =
          response.data.languages[currentLanguage] ||
          response.data.languages.en;

        setContent(languageContent);
        setSource(response.source);
      } else {
        setError(response.error || 'Failed to load privacy policy');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    load();
  }, [load]);

  return { content, isLoading, error, source, reload: load };
};

/**
 * Hook to load only Terms of Service
 */
export const useTermsOfService = () => {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'en') as 'en' | 'fr' | 'ar';

  const [content, setContent] = useState<LegalLanguageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'json' | 'api' | 'cache' | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTermsOfService();

      if (response.success && response.data) {
        const languageContent =
          response.data.languages[currentLanguage] ||
          response.data.languages.en;

        setContent(languageContent);
        setSource(response.source);
      } else {
        setError(response.error || 'Failed to load terms of service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    load();
  }, [load]);

  return { content, isLoading, error, source, reload: load };
};

export default useLegalContent;
