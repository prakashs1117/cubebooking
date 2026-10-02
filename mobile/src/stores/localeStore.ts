import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales, getCalendar, getTimeZone } from 'react-native-localize';
import i18n, { changeLanguage as changeI18nLanguage } from '@localization/i18n';
import type { DeviceRegion } from '@services/locationService';

/**
 * Locale Store State
 */
interface LocaleState {
  // Current locale settings
  language: string;
  countryCode: string;
  languageTag: string;
  isRTL: boolean;
  calendarType: string;
  timezone: string;

  // Region detection (US vs Non-US from GPS)
  region: DeviceRegion;
  regionDetectedAt: number | null; // epoch ms, null = not yet detected

  // Actions
  initializeLocale: () => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setCalendarType: (calendarType: string) => void;
  refreshLocale: () => void;
  setRegion: (region: DeviceRegion) => void;
}

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar', 'de', 'it', 'es', 'zh', 'ja', 'pt'];

/**
 * Get device locale information
 */
const getDeviceLocale = () => {
  try {
    const locales = getLocales();
    const calendar = getCalendar();
    const timezone = getTimeZone();

    if (locales && locales.length > 0) {
      // Try to find a supported language
      let selectedLocale = locales[0];

      for (const locale of locales) {
        const langCode = locale.languageCode.toLowerCase();
        if (SUPPORTED_LANGUAGES.includes(langCode)) {
          selectedLocale = locale;
          break;
        }
      }

      const language = selectedLocale.languageCode.toLowerCase();

      console.log('📱 Device Locale Info:', {
        language,
        country: selectedLocale.countryCode,
        languageTag: selectedLocale.languageTag,
        isRTL: selectedLocale.isRTL,
        calendar,
        timezone,
        supported: SUPPORTED_LANGUAGES.includes(language),
      });

      return {
        language,
        countryCode: selectedLocale.countryCode || '',
        languageTag: selectedLocale.languageTag,
        isRTL: selectedLocale.isRTL || false,
        calendarType: calendar || 'gregorian',
        timezone: timezone || 'UTC',
      };
    }
  } catch (error) {
    console.warn('Error getting device locale:', error);
  }

  // Fallback defaults
  return {
    language: 'en',
    countryCode: 'US',
    languageTag: 'en-US',
    isRTL: false,
    calendarType: 'gregorian',
    timezone: 'UTC',
  };
};

/**
 * Locale Store
 * Manages device locale settings with persistence
 * Stores: language, calendar type, timezone, RTL, etc.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    set => ({
      // Initial state (will be overridden by persisted data or initialization)
      language: 'en',
      countryCode: 'US',
      languageTag: 'en-US',
      isRTL: false,
      calendarType: 'gregorian',
      timezone: 'UTC',
      region: 'UNKNOWN',
      regionDetectedAt: null,

      /**
       * Initialize locale from device settings
       * Call this on app startup
       * Syncs with i18n (i18n takes priority as it has saved user preference)
       */
      initializeLocale: () => {
        const deviceLocale = getDeviceLocale();

        // Sync with i18n if available and initialized
        try {
          // Wait a tick to ensure i18n is fully initialized
          setTimeout(() => {
            const currentI18nLang =
              i18n.language?.split('-')[0]?.toLowerCase() || 'en';

            console.log('🔄 Syncing locale store with i18n:', {
              i18nLanguage: currentI18nLang,
              deviceLanguage: deviceLocale.language,
              priority: 'i18n (has saved preference)',
            });

            // Always use i18n language as it has proper priority logic (saved > device > fallback)
            // Only use device locale for non-language fields (calendar, timezone, RTL, etc.)
            set({
              language: currentI18nLang, // Use i18n language (already has correct priority)
              countryCode: deviceLocale.countryCode,
              languageTag: `${currentI18nLang}-${deviceLocale.countryCode}`,
              isRTL: deviceLocale.isRTL,
              calendarType: deviceLocale.calendarType,
              timezone: deviceLocale.timezone,
            });

            console.log('✅ Locale store initialized and synced with i18n:', {
              storeLanguage: currentI18nLang,
              i18nLanguage: currentI18nLang,
              deviceLanguage: deviceLocale.language,
            });
          }, 100);
        } catch (err) {
          console.warn(
            '⚠️  Error syncing with i18n, using device locale:',
            err,
          );
          // Fallback to device locale if i18n not ready
          set(deviceLocale);
          console.log(
            '✅ Locale initialized from device (i18n not ready):',
            deviceLocale,
          );
        }
      },

      /**
       * Manually set language
       * Also syncs with i18n (uses the full changeLanguage helper which handles RTL and persistence)
       */
      setLanguage: async (language: string) => {
        const lang = language.toLowerCase();

        // Validate language is supported
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
          console.warn(
            `⚠️  Unsupported language "${lang}", defaulting to English`,
          );
          set({ language: 'en' });
          await changeI18nLanguage('en');
          return;
        }

        set({ language: lang, isRTL: lang === 'ar' });

        // Sync with i18n using the full changeLanguage helper
        // This handles RTL, AsyncStorage persistence, and all edge cases
        try {
          await changeI18nLanguage(lang);
          console.log(
            '🌐 Language updated and synced with i18n (with RTL and persistence):',
            lang,
          );
        } catch (error) {
          console.error(
            '🌐 Language updated in store but i18n sync failed:',
            error,
          );
        }
      },

      /**
       * Manually set timezone
       */
      setTimezone: (timezone: string) => {
        set({ timezone });
        console.log('🕐 Timezone updated:', timezone);
      },

      /**
       * Manually set calendar type
       */
      setCalendarType: (calendarType: string) => {
        set({ calendarType });
        console.log('📅 Calendar type updated:', calendarType);
      },

      /**
       * Refresh locale from device (useful after changing device settings)
       */
      refreshLocale: () => {
        const deviceLocale = getDeviceLocale();
        set(deviceLocale);
        console.log('🔄 Locale refreshed from device:', deviceLocale);
      },

      /**
       * Set the GPS-detected region.
       * Called by RegionContext after getDeviceRegion() resolves.
       */
      setRegion: (region: DeviceRegion) => {
        set({ region, regionDetectedAt: Date.now() });
        console.log('📍 Region stored in locale store:', region);
      },
    }),
    {
      name: 'locale-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Sync with i18n after rehydrating from storage
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('⚠️  Error rehydrating locale store:', error);
            return;
          }

          if (state) {
            // After store rehydrates, sync language with i18n using store's setState
            setTimeout(() => {
              try {
                const currentI18nLang =
                  i18n.language?.split('-')[0]?.toLowerCase() || 'en';
                const storeLanguage = useLocaleStore.getState().language;

                if (currentI18nLang && storeLanguage !== currentI18nLang) {
                  console.log(
                    `🔄 Rehydrated locale store - syncing language from i18n: ${currentI18nLang} (was: ${storeLanguage})`,
                  );
                  useLocaleStore.setState({ language: currentI18nLang });
                } else {
                  console.log(
                    `✅ Locale store rehydrated with language: ${storeLanguage}`,
                  );
                }
              } catch (err) {
                console.warn(
                  '⚠️  Error syncing language after rehydration:',
                  err,
                );
              }
            }, 50);
          }
        };
      },
    },
  ),
);
