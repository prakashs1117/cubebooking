/**
 * useLocale Hook
 * Convenient hook to access locale information from the store
 */

import { useLocaleStore } from '@stores/localeStore';

export const useLocale = () => {
  const {
    language,
    countryCode,
    languageTag,
    isRTL,
    calendarType,
    timezone,
    setLanguage,
    setTimezone,
    setCalendarType,
    refreshLocale,
  } = useLocaleStore();

  return {
    // Locale information
    language,
    countryCode,
    languageTag,
    isRTL,
    calendarType,
    timezone,

    // Actions
    setLanguage,
    setTimezone,
    setCalendarType,
    refreshLocale,

    // Computed properties
    fullLocale: `${language}-${countryCode}`,
    isArabic: language === 'ar',
    isFrench: language === 'fr',
    isEnglish: language === 'en',
  };
};
