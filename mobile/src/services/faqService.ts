/**
 * FAQ Service
 *
 * Service for fetching FAQ data from JSON files or API.
 * This implementation uses local JSON but is structured to easily
 * switch to API calls in production.
 */

import { FAQDocument, FAQResponse } from '@/types/faq.types';

// Cache for FAQ data
let faqCache: { data: FAQDocument | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Configuration for FAQ data source
 * Switch to 'api' in production
 */
const FAQ_CONFIG = {
  source: 'json' as 'json' | 'api',
  apiEndpoint: '/api/faq', // API endpoint when using API source
  cacheEnabled: true,
};

/**
 * Fetch FAQ data from JSON file
 */
const fetchFromJSON = async (): Promise<FAQDocument> => {
  try {
    // In React Native, we need to use require for JSON files
    const data = require('@/data/faq/faq.json');

    // Simulate network delay for realistic behavior
    if (__DEV__) {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
    }

    return data as FAQDocument;
  } catch (error) {
    console.error('Error loading FAQ data from JSON:', error);
    throw new Error('Failed to load FAQ data from local file');
  }
};

/**
 * Fetch FAQ data from API
 * This is a placeholder for future API integration
 */
const fetchFromAPI = async (): Promise<FAQDocument> => {
  try {
    const response = await fetch(FAQ_CONFIG.apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform API response to match our document structure if needed
    return data as FAQDocument;
  } catch (error) {
    console.error('Error fetching FAQ data from API:', error);
    throw new Error('Failed to fetch FAQ data from server');
  }
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = (): boolean => {
  if (!FAQ_CONFIG.cacheEnabled || !faqCache) {
    return false;
  }

  const now = Date.now();
  return now - faqCache.timestamp < CACHE_DURATION;
};

/**
 * Get FAQ data (with caching)
 */
export const getFAQData = async (): Promise<FAQResponse> => {
  try {
    // Check cache first
    if (isCacheValid() && faqCache?.data) {
      if (__DEV__) {
        console.log('✅ Using cached FAQ data');
      }
      return {
        success: true,
        data: faqCache.data,
        source: 'cache',
        timestamp: new Date().toISOString(),
      };
    }

    // Fetch new data based on configuration
    let data: FAQDocument;
    const source = FAQ_CONFIG.source;

    if (source === 'api') {
      data = await fetchFromAPI();
    } else {
      data = await fetchFromJSON();
    }

    // Update cache
    if (FAQ_CONFIG.cacheEnabled) {
      faqCache = {
        data,
        timestamp: Date.now(),
      };
    }

    if (__DEV__) {
      console.log(`✅ Loaded FAQ data from ${source}`);
    }

    return {
      success: true,
      data,
      source,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in getFAQData:', error);

    return {
      success: false,
      data: null,
      error: errorMessage,
      source: FAQ_CONFIG.source,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Clear FAQ cache
 */
export const clearFAQCache = (): void => {
  faqCache = null;
  if (__DEV__) {
    console.log('🗑️ FAQ cache cleared');
  }
};

/**
 * Prefetch FAQ data for better performance
 */
export const prefetchFAQData = async (): Promise<void> => {
  try {
    await getFAQData();
    if (__DEV__) {
      console.log('✅ FAQ data prefetched');
    }
  } catch (error) {
    console.error('Error prefetching FAQ data:', error);
  }
};

/**
 * Configure FAQ service
 * Use this to switch between JSON and API sources
 */
export const configureFAQService = (
  config: Partial<typeof FAQ_CONFIG>,
): void => {
  Object.assign(FAQ_CONFIG, config);

  if (__DEV__) {
    console.log('⚙️ FAQ service configured:', FAQ_CONFIG);
  }
};
