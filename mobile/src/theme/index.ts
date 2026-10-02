/**
 * MerckConnect theme system exports
 */
export * from './colors';
export * from './ThemeContext';
export * from './commonStyles';
export * from './typography';
export * from './spacing';
export * from './merckTokens';

// Named convenience re-exports
export { useTheme, ThemeProvider } from './ThemeContext';
export { LightTheme, DarkTheme, BaseColors, MerckConnectColors, Gradients, AvatarGradients } from './colors';
export { createCommonStyles } from './commonStyles';
export { FontFamily, FontSize, FontWeight, LineHeight, getFontFamily } from './typography';
export { Spacing, Radius, Shadow } from './spacing';
export { MERCK_TOKENS, getCapacityColors } from './merckTokens';
