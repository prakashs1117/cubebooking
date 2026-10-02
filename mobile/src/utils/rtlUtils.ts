/**
 * RTL (Right-to-Left) Utility Functions
 * Provides consistent RTL detection across the app
 */

/**
 * Check if the current language is RTL
 * Only checks the language code, not I18nManager.isRTL to avoid inconsistencies
 *
 * @param language - The current language code (e.g., 'ar', 'en', 'fr')
 * @returns true if the language is RTL, false otherwise
 */
export const isRTLLanguage = (language: string): boolean => {
  const lang = language.toLowerCase();

  // RTL languages
  const rtlLanguages = [
    'ar', // Arabic
    'he', // Hebrew
    'fa', // Persian/Farsi
    'ur', // Urdu
    'yi', // Yiddish
  ];

  // Check if language starts with any RTL language code
  return rtlLanguages.some(
    rtlLang => lang === rtlLang || lang.startsWith(`${rtlLang}-`),
  );
};

/**
 * Get text alignment based on RTL status
 */
export const getTextAlign = (isRTL: boolean): 'left' | 'right' => {
  return isRTL ? 'right' : 'left';
};

/**
 * Get flex direction based on RTL status
 */
export const getFlexDirection = (isRTL: boolean): 'row' | 'row-reverse' => {
  return isRTL ? 'row-reverse' : 'row';
};

/**
 * Get margin/padding side based on RTL status
 * Use this for dynamic margin/padding
 */
export const getStartEnd = (isRTL: boolean) => ({
  marginStart: isRTL ? 'marginRight' : 'marginLeft',
  marginEnd: isRTL ? 'marginLeft' : 'marginRight',
  paddingStart: isRTL ? 'paddingRight' : 'paddingLeft',
  paddingEnd: isRTL ? 'paddingLeft' : 'paddingRight',
});
