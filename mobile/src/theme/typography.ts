import { Platform } from 'react-native';

// Linked fonts: Poppins (SemiBold, Medium, Light, ExtraLight, Thin), Urbanist (Regular, Light, Thin)
// Note: No Poppins-Regular.ttf exists — primaryRegular falls back to Poppins-Medium
export const FontFamily = {
  primary: 'Poppins-SemiBold',
  primaryMedium: 'Poppins-Medium',
  primaryRegular: 'Poppins-Medium',
  primaryLight: Platform.OS === 'ios' ? 'Poppins-Light' : 'poppins.light',
  secondary: 'Urbanist-Regular',
  secondaryLight: 'Urbanist-Light',
  system: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
} as const;

export const FontSize = {
  '2xs': 10,
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 15,
  xl: 16,
  '2xl': 17,
  '3xl': 20,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};


export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

/** Returns font family string for a given weight/variant */
export function getFontFamily(weight: 'regular' | 'medium' | 'semibold' = 'semibold', variant: 'primary' | 'secondary' = 'primary'): string {
  if (variant === 'secondary') {
    return FontFamily.secondary;
  }
  if (weight === 'regular') return FontFamily.primaryRegular;
  if (weight === 'medium') return FontFamily.primaryMedium;
  return FontFamily.primary; // semibold
}
