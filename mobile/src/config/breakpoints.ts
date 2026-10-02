/**
 * Centralised breakpoint constants.
 * Import from here — never hard-code 768 or 1024 elsewhere.
 */
export const BREAKPOINTS = {
  TABLET: 768, // iPad mini and larger
  DESKTOP: 1024, // external display / split-view edge case
} as const;

export type DeviceType = 'phone' | 'tablet' | 'desktop';
