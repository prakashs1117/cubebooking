/**
 * Available font families and their weights
 */
export type FontFamily = 'Urbanist' | 'Poppins';

export type UrbanistWeight = 'Light' | 'Regular' | 'Thin';
export type PoppinsWeight = 'ExtraLight' | 'Light' | 'Thin';

export type FontWeight = UrbanistWeight | PoppinsWeight;

/**
 * Font configuration interface
 */
export interface FontConfig {
  fontFamily: string;
  fontWeight?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
}

/**
 * Predefined font styles for consistent typography
 */
export interface FontStyles {
  // Headers
  h1: FontConfig;
  h2: FontConfig;
  h3: FontConfig;
  h4: FontConfig;

  // Body text
  bodyLarge: FontConfig;
  bodyMedium: FontConfig;
  bodySmall: FontConfig;
  body: FontConfig;

  // Special text
  caption: FontConfig;
  button: FontConfig;
  subtitle: FontConfig;

  // Form elements
  label: FontConfig;
  input: FontConfig;
  error: FontConfig;
  link: FontConfig;
}
