/**
 * Font utilities export
 */
export * from './types';
export * from './fontRegistry';

// Re-export commonly used functions for convenience
export {
  getFontFamily,
  createFontConfig,
  fontStyles,
  getFontStyle,
  combineWithFontStyle,
} from './fontRegistry';
