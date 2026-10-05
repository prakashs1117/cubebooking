/**
 * Legal Content Service
 *
 * Service to load Privacy Policy and Terms of Service content.
 * Supports loading from:
 * 1. Local JSON files (current implementation)
 * 2. Remote API (future implementation)
 * 3. Cache (for performance)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LegalDocument,
  LegalDocumentType,
  LegalContentResponse,
  ApiLegalResponse,
  ApiLegalDocument,
  LegalLanguageContent,
} from '@/types/legal.types';
import privacyPolicyJson from '../data/legal/privacyPolicy.json';
import termsOfServiceJson from '../data/legal/termsOfService.json';

// Cache keys
const CACHE_KEYS = {
  privacy: '@legal_content_privacy',
  terms: '@legal_content_terms',
};

// Cache expiry time (24 hours)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// API endpoint (to be configured)
// Note: When API is ready, update this or use a config file
const API_BASE_URL = '';

/**
 * Configuration for content source
 */
interface LegalContentConfig {
  useApi: boolean; // Switch between JSON and API
  apiEndpoint?: string;
  cacheEnabled: boolean;
  cacheExpiryMs: number;
}

const defaultConfig: LegalContentConfig = {
  useApi: false, // Set to true when API is ready
  apiEndpoint: API_BASE_URL,
  cacheEnabled: true,
  cacheExpiryMs: CACHE_EXPIRY_MS,
};

/**
 * Transform API response to internal format
 */
const transformApiToInternal = (
  apiDocuments: ApiLegalDocument[],
): LegalDocument => {
  const languages: LegalDocument['languages'] = {
    en: { title: '', lastUpdatedLabel: '', lastUpdatedDate: '', sections: [] },
    fr: { title: '', lastUpdatedLabel: '', lastUpdatedDate: '', sections: [] },
    ar: { title: '', lastUpdatedLabel: '', lastUpdatedDate: '', sections: [] },
  };

  let version = '1.0';
  let lastUpdated = new Date().toISOString().split('T')[0];

  apiDocuments.forEach(doc => {
    const lang = doc.language as 'en' | 'fr' | 'ar';

    if (!languages[lang]) {
      languages[lang] = {
        title: '',
        lastUpdatedLabel: '',
        lastUpdatedDate: '',
        sections: [],
      };
    }

    languages[lang] = {
      title: doc.title,
      lastUpdatedLabel: doc.last_updated_label,
      lastUpdatedDate: doc.last_updated_date,
      sections: doc.sections.map(section => ({
        id: section.section_id,
        order: section.section_order,
        title: section.section_title,
        content: section.section_content,
        icon: section.section_icon,
      })),
    };

    version = doc.document_version;
    lastUpdated = doc.last_updated;
  });

  return {
    version,
    lastUpdated,
    languages,
  };
};

/**
 * Load content from JSON files
 */
const loadFromJson = async (
  type: LegalDocumentType,
): Promise<LegalDocument> => {
  try {
    const data = type === 'privacy' ? privacyPolicyJson : termsOfServiceJson;
    return data as LegalDocument;
  } catch (error) {
    console.error(`Error loading ${type} from JSON:`, error);
    throw new Error(`Failed to load ${type} content from JSON`);
  }
};

/**
 * Load content from API
 */
const loadFromApi = async (
  type: LegalDocumentType,
  config: LegalContentConfig,
): Promise<LegalDocument> => {
  try {
    const endpoint = config.apiEndpoint || API_BASE_URL;
    const documentType =
      type === 'privacy' ? 'privacy_policy' : 'terms_of_service';

    const response = await fetch(`${endpoint}/legal/${documentType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiResponse: ApiLegalResponse = await response.json();

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.message || 'API returned no data');
    }

    const transformedData = transformApiToInternal(apiResponse.data);
    return transformedData;
  } catch (error) {
    console.error(`Error loading ${type} from API:`, error);
    throw error;
  }
};

/**
 * Save content to cache
 */
const saveToCache = async (
  type: LegalDocumentType,
  data: LegalDocument,
): Promise<void> => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEYS[type], JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error saving ${type} to cache:`, error);
  }
};

/**
 * Load content from cache
 */
const loadFromCache = async (
  type: LegalDocumentType,
  config: LegalContentConfig,
): Promise<LegalDocument | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS[type]);

    if (!cached) {
      return null;
    }

    const cacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;

    // Check if cache is expired
    if (age > config.cacheExpiryMs) {
      await AsyncStorage.removeItem(CACHE_KEYS[type]);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error(`Error loading ${type} from cache:`, error);
    return null;
  }
};

/**
 * Clear cache for a specific document type or all
 */
export const clearLegalCache = async (
  type?: LegalDocumentType,
): Promise<void> => {
  try {
    if (type) {
      await AsyncStorage.removeItem(CACHE_KEYS[type]);
    } else {
      await AsyncStorage.removeMany([CACHE_KEYS.privacy, CACHE_KEYS.terms]);
    }
    if (__DEV__) {
      console.log(`✅ Cleared legal cache for: ${type || 'all'}`);
    }
  } catch (error) {
    console.error('Error clearing legal cache:', error);
  }
};

/**
 * Main function to get legal content
 * Handles loading from cache, JSON, or API based on configuration
 */
export const getLegalContent = async (
  type: LegalDocumentType,
  config: LegalContentConfig = defaultConfig,
): Promise<LegalContentResponse> => {
  const startTime = Date.now();

  try {
    // Try cache first if enabled
    if (config.cacheEnabled) {
      const cachedData = await loadFromCache(type, config);
      if (cachedData) {
        if (__DEV__) {
          console.log(
            `📦 Loaded ${type} from cache (${Date.now() - startTime}ms)`,
          );
        }
        return {
          success: true,
          data: cachedData,
          source: 'cache',
          timestamp: new Date().toISOString(),
        };
      }
    }

    let data: LegalDocument;
    let source: 'json' | 'api';

    // Load from API or JSON based on config
    if (config.useApi && config.apiEndpoint) {
      try {
        data = await loadFromApi(type, config);
        source = 'api';
        if (__DEV__) {
          console.log(
            `🌐 Loaded ${type} from API (${Date.now() - startTime}ms)`,
          );
        }
      } catch (apiError) {
        // Fallback to JSON if API fails
        console.warn(`API failed, falling back to JSON for ${type}:`, apiError);
        data = await loadFromJson(type);
        source = 'json';
      }
    } else {
      data = await loadFromJson(type);
      source = 'json';
      if (__DEV__) {
        console.log(
          `📄 Loaded ${type} from JSON (${Date.now() - startTime}ms)`,
        );
      }
    }

    // Save to cache for next time
    if (config.cacheEnabled) {
      await saveToCache(type, data);
    }

    return {
      success: true,
      data,
      source,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error getting legal content for ${type}:`, error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'json',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get Privacy Policy content
 */
export const getPrivacyPolicy = async (
  config?: LegalContentConfig,
): Promise<LegalContentResponse> => {
  return getLegalContent('privacy', config);
};

/**
 * Get Terms of Service content
 */
export const getTermsOfService = async (
  config?: LegalContentConfig,
): Promise<LegalContentResponse> => {
  return getLegalContent('terms', config);
};

/**
 * Prefetch both documents for better performance
 */
export const prefetchLegalContent = async (
  config?: LegalContentConfig,
): Promise<void> => {
  try {
    await Promise.all([getPrivacyPolicy(config), getTermsOfService(config)]);
    if (__DEV__) {
      console.log('✅ Prefetched all legal content');
    }
  } catch (error) {
    console.error('Error prefetching legal content:', error);
  }
};

/**
 * Get content for specific language
 */
export const getLegalContentForLanguage = async (
  type: LegalDocumentType,
  language: 'en' | 'fr' | 'ar' = 'en',
  config?: LegalContentConfig,
): Promise<LegalLanguageContent | null> => {
  const response = await getLegalContent(type, config);

  if (!response.success || !response.data) {
    return null;
  }

  return response.data.languages[language] || response.data.languages.en;
};

export default {
  getLegalContent,
  getPrivacyPolicy,
  getTermsOfService,
  prefetchLegalContent,
  getLegalContentForLanguage,
  clearLegalCache,
};
