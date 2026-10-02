/**
 * Search History Service
 * Manages search history with AsyncStorage
 * Max 10 recent searches
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_LENGTH = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

/**
 * Get search history from storage
 */
export const getSearchHistory = async (): Promise<string[]> => {
  try {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      const parsed: SearchHistoryItem[] = JSON.parse(history);
      // Return just the query strings, sorted by most recent first
      return parsed
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(item => item.query);
    }
    return [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

/**
 * Add a search query to history
 * Removes duplicates and keeps only the last 10 searches
 */
export const addToSearchHistory = async (query: string): Promise<void> => {
  try {
    if (!query || query.trim().length === 0) {
      return;
    }

    const trimmedQuery = query.trim();
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    let searches: SearchHistoryItem[] = history ? JSON.parse(history) : [];

    // Remove duplicate if exists
    searches = searches.filter(
      item => item.query.toLowerCase() !== trimmedQuery.toLowerCase(),
    );

    // Add new search at the beginning
    searches.unshift({
      query: trimmedQuery,
      timestamp: Date.now(),
    });

    // Keep only the last MAX_HISTORY_LENGTH searches
    searches = searches.slice(0, MAX_HISTORY_LENGTH);

    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
};

/**
 * Remove a specific search from history
 */
export const removeFromSearchHistory = async (query: string): Promise<void> => {
  try {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      let searches: SearchHistoryItem[] = JSON.parse(history);
      searches = searches.filter(item => item.query !== query);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searches));
    }
  } catch (error) {
    console.error('Error removing from search history:', error);
  }
};

/**
 * Clear all search history
 */
export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

/**
 * Get search suggestions based on input
 */
export const getSearchSuggestions = async (
  input: string,
): Promise<string[]> => {
  try {
    if (!input || input.trim().length === 0) {
      return [];
    }

    const history = await getSearchHistory();
    const lowerInput = input.toLowerCase();

    // Filter history to show matches
    return history.filter(query => query.toLowerCase().includes(lowerInput));
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};
