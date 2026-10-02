import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import Toast from 'react-native-toast-message';

// Import translation files
import en from './translations/en.json';
import fr from './translations/fr.json';
import ar from './translations/ar.json';
import de from './translations/de.json';
import it from './translations/it.json';
import es from './translations/es.json';
import zh from './translations/zh.json';
import ja from './translations/ja.json';
import pt from './translations/pt.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
  de: { translation: de },
  it: { translation: it },
  es: { translation: es },
  zh: { translation: zh },
  ja: { translation: ja },
  pt: { translation: pt },
};

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar', 'de', 'it', 'es', 'zh', 'ja', 'pt'];

// Helper to determine if a language is RTL
const isLanguageRTL = (lang: string): boolean => {
  return lang === 'ar';
};

// Helper to get device language with better matching
const getDeviceLanguage = (): string => {
  const fallback = 'en';

  try {
    const locales = RNLocalize.getLocales();
    console.log(`📱 [i18n] Raw device locales:`, JSON.stringify(locales));

    if (locales && locales.length > 0) {
      // Try to find exact match first
      for (const locale of locales) {
        const langCode = locale.languageCode.toLowerCase();
        console.log(
          `📱 [i18n] Checking locale: ${langCode} (tag: ${locale.languageTag})`,
        );
        if (SUPPORTED_LANGUAGES.includes(langCode)) {
          console.log(`✅ [i18n] Exact device language match: ${langCode}`);
          return langCode;
        }
      }

      // Try findBestLanguageTag as fallback
      const bestMatch = RNLocalize.findBestLanguageTag(SUPPORTED_LANGUAGES);
      console.log(
        `📱 [i18n] findBestLanguageTag result:`,
        JSON.stringify(bestMatch),
      );
      if (bestMatch) {
        const tag = bestMatch.languageTag.split('-')[0].toLowerCase();
        console.log(`✅ [i18n] Best language match: ${tag}`);
        return tag;
      }
    }
  } catch (error) {
    console.warn('[i18n] Error detecting device language:', error);
  }

  console.log(
    `⚠️  [i18n] No supported language found, using fallback: ${fallback}`,
  );
  return fallback;
};

// Initialize i18n with async language loading
const initializeI18n = async () => {
  try {
    console.log(`🚀 [i18n] Starting initialization...`);

    // Get device language first
    const deviceLanguage = getDeviceLanguage();
    console.log(`📱 [i18n] Device language resolved: ${deviceLanguage}`);

    // Try to get saved language from AsyncStorage
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    console.log(
      `💾 [i18n] Saved language from storage: ${savedLanguage ?? 'none'}`,
    );

    // Priority: saved language > device language > fallback to 'en'
    let initialLanguage = savedLanguage || deviceLanguage;
    console.log(
      `🎯 [i18n] Language selected: "${initialLanguage}" (source: ${
        savedLanguage ? 'saved preference' : 'device locale'
      })`,
    );

    // Validate language is supported
    if (!SUPPORTED_LANGUAGES.includes(initialLanguage)) {
      console.warn(
        `⚠️  [i18n] Unsupported language "${initialLanguage}", falling back to "${deviceLanguage}"`,
      );
      initialLanguage = deviceLanguage;
    }

    // Set RTL before initializing i18n
    const shouldBeRTL = isLanguageRTL(initialLanguage);
    console.log(
      `🔄 [i18n] RTL: ${shouldBeRTL} (current system RTL: ${I18nManager.isRTL})`,
    );
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      console.log(`🔄 [i18n] RTL direction updated to: ${shouldBeRTL}`);
    }

    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

    console.log(
      `✅ [i18n] Initialized — language: "${initialLanguage}", RTL: ${shouldBeRTL}`,
    );
  } catch (error) {
    console.error('❌ [i18n] Initialization error:', error);
    // Fallback to English if there's an error
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
    console.log(`⚠️  [i18n] Fallback initialized with English`);
  }
};

// Save language preference
export const saveLanguagePreference = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    console.log(`✅ Language preference saved: ${language}`);
  } catch (error) {
    console.error('❌ Error saving language preference:', error);
  }
};

// Callback invoked when RTL direction changes — registered by App.tsx to trigger nav tree remount
type RTLChangeCallback = (isRTL: boolean) => void;
let rtlChangeCallback: RTLChangeCallback | null = null;

export const setRTLChangeCallback = (cb: RTLChangeCallback | null) => {
  rtlChangeCallback = cb;
};

// Change language with persistence and RTL handling
export const changeLanguage = async (language: string) => {
  try {
    // Change i18n language
    await i18n.changeLanguage(language);

    // Save preference
    await saveLanguagePreference(language);

    // Update RTL — requires full app restart to take effect natively
    const shouldBeRTL = isLanguageRTL(language);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      console.log(`ℹ️  RTL direction changed to ${shouldBeRTL}. Restarting app.`);
      Toast.show({
        type: 'info',
        text1: 'Restarting…',
        text2: 'Applying language layout changes',
        visibilityTime: 1200,
        onHide: () => RNRestart.Restart(),
      });
      return;
    }

    console.log(`✅ Language changed to: ${language}, RTL: ${shouldBeRTL}`);
  } catch (error) {
    console.error('❌ Error changing language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  const lang = i18n.language || 'en';
  // Extract language code (e.g., 'en-US' -> 'en')
  return lang.split('-')[0].toLowerCase();
};

// Initialize i18n — export the promise so App.tsx can wait before rendering
export const i18nReady: Promise<void> = initializeI18n();

export default i18n;
