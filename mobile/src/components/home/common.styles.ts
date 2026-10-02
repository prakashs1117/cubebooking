/**
 * Common spacing and styling constants
 * Used across mobile and tablet layouts
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
  xxxl: 22,
} as const;

export const PADDING = {
  container: SPACING.lg,
  card: {
    horizontal: SPACING.xl,
    vertical: SPACING.lg,
  },
  section: {
    vertical: SPACING.xl,
    horizontal: SPACING.lg,
  },
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 20,
  full: 99,
} as const;

export const TYPOGRAPHY = {
  heading1: {
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: -1,
    lineHeight: 1.2,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
    lineHeight: 1.2,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: -0.3,
    lineHeight: 1.3,
  },
  heading4: {
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: 0,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    lineHeight: 1.4,
  },
  body: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 1.5,
  },
  button: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 1.4,
  },
} as const;

export const SHADOWS = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
} as const;
