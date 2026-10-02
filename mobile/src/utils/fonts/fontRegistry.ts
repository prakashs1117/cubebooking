import { Platform } from 'react-native';
import { FontFamily, FontWeight, FontConfig, FontStyles } from './types';

/**
 * Font family mapping for cross-platform compatibility
 * iOS uses PostScript names, Android uses filename without extension
 */
const fontFamilyMap: Record<FontFamily, Record<FontWeight, string>> = {
  Urbanist: {
    Light: Platform.OS === 'ios' ? 'Urbanist-Light' : 'Urbanist-Light',
    Regular: Platform.OS === 'ios' ? 'Urbanist-Regular' : 'Urbanist-Regular',
    Thin: Platform.OS === 'ios' ? 'Urbanist-Thin' : 'Urbanist-Thin',
    // Extended weights for type safety
    ExtraLight: Platform.OS === 'ios' ? 'Urbanist-Light' : 'Urbanist-Light', // Fallback
  },
  Poppins: {
    ExtraLight: Platform.OS === 'ios' ? 'Poppins-ExtraLight' : 'poppins.extralight',
    Light: Platform.OS === 'ios' ? 'Poppins-Light' : 'poppins.light',
    Thin: Platform.OS === 'ios' ? 'Poppins-Thin' : 'poppins.thin',
    Regular: Platform.OS === 'ios' ? 'Poppins-Medium' : 'Poppins-Medium',
  },
};

/**
 * Get the platform-specific font family name
 */
export const getFontFamily = (
  family: FontFamily,
  weight: FontWeight,
): string => {
  return (
    fontFamilyMap[family][weight] || fontFamilyMap[family].Regular || 'System'
  );
};

/**
 * Create a font configuration
 */
export const createFontConfig = (
  family: FontFamily,
  weight: FontWeight,
  fontSize: number = 16,
  lineHeight?: number,
  color?: string,
): FontConfig => ({
  fontFamily: getFontFamily(family, weight),
  fontSize,
  lineHeight: lineHeight || fontSize * 1.2,
  color,
});

/**
 * Predefined font styles following design system principles
 */
export const fontStyles: FontStyles = {
  // Headers
  h1: createFontConfig('Urbanist', 'Regular', 14, 38),
  h2: createFontConfig('Urbanist', 'Regular', 14, 34),
  h3: createFontConfig('Urbanist', 'Regular', 14, 28),
  h4: createFontConfig('Urbanist', 'Regular', 14, 24),

  // Body text
  bodyLarge: createFontConfig('Urbanist', 'Regular', 14, 24),
  bodyMedium: createFontConfig('Urbanist', 'Regular', 14, 20),
  bodySmall: createFontConfig('Urbanist', 'Regular', 14, 18),
  body: createFontConfig('Urbanist', 'Regular', 14, 18),

  // Special text
  caption: createFontConfig('Urbanist', 'Regular', 12, 16),
  button: createFontConfig('Urbanist', 'Regular', 16, 20),
  subtitle: createFontConfig('Urbanist', 'Regular', 14, 18),

  // Form elements
  label: createFontConfig('Urbanist', 'Regular', 13, 16),
  input: createFontConfig('Urbanist', 'Regular', 15, 20),
  error: createFontConfig('Urbanist', 'Regular', 11, 14),
  link: createFontConfig('Urbanist', 'Regular', 13, 16),
};

/**
 * Helper function to get font style by name
 */
export const getFontStyle = (styleName: keyof FontStyles): FontConfig => {
  return fontStyles[styleName];
};

/**
 * Utility function to combine font config with additional styles
 */
export const combineWithFontStyle = (
  styleName: keyof FontStyles,
  additionalStyles: Partial<FontConfig> = {},
): FontConfig => {
  const baseStyle = getFontStyle(styleName);
  return {
    ...baseStyle,
    ...additionalStyles,
  };
};
