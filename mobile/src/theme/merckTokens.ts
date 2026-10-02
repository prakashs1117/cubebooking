/**
 * MerckConnect design tokens — dark-first, with full light-mode variants.
 *
 * USAGE:
 *   • useMerckTokens() — inside a component, returns tokens for the current theme
 *   • MERCK_TOKENS     — static dark-mode constants, safe for module-level StyleSheet.create()
 *     that lives outside a component. All new screen code should prefer useMerckTokens().
 */

import { useTheme } from '@/theme/ThemeContext';

// ── Brand constants (same in both modes) ──────────────────────────────────────

const BRAND = {
  green:      '#2ED9A0',
  greenDark:  '#0E9F6E',
  greenLight: '#4FEBB5',
  teal:       '#2ED9A0',
  tealDark:   '#0E9F6E',
  coral:      '#FF6A3D',

  accentAmber:  '#FBBF40',
  accentBlue:   '#2E7DF6',
  accentCoral:  '#FF6A3D',
  accentPink:   '#D6298E',
  accentCyan:   '#34D6D6',
  accentIndigo: '#6366f1',
  accentPurple: '#6C5CE7',

  success: '#0E9F6E',
  error:   '#E5484D',
  warning: '#FBBF40',
  info:    '#2E7DF6',

  spotlightGradients: {
    pinned:   ['#2ED9A0', '#0ea5e9'] as [string, string],
    trending: ['#a855f7', '#ec4899'] as [string, string],
    event:    ['#0ea5e9', '#6366f1'] as [string, string],
    wellness: ['#f59e0b', '#ec4899'] as [string, string],
  },
} as const;

// ── Dark tokens ───────────────────────────────────────────────────────────────

const DARK = {
  ...BRAND,

  // Backgrounds
  bgApp:    '#0A1410',
  bgDeep:   '#070f0b',
  bgCard:   '#11201A',
  bgSurface:'#16271F',
  bgDrawer: '#0A1410',
  headerGreen: '#11201A',

  // Text
  headerText: '#EAF3EC',

  // Borders
  borderDefault: '#21372C',
  borderMuted:   '#2D4A3E',

  // Tabs
  tabActive:     '#2ED9A0',
  tabInactive:   '#4A7A65',
  tabBackground: '#11201A',
  tabBorder:     '#21372C',

  // Aliases
  cardBackground:    '#16271F',
  surfaceBackground: '#1A3A2A',
  headerBackground:  '#11201A',

  // Capacity bars
  capacityBar: {
    green: { fill: '#2ED9A0', bg: '#1A3A2A' },
    amber: { fill: '#FBBF40', bg: '#2A2A1A' },
    red:   { fill: '#E5484D', bg: '#2A1A1A' },
  },

  statCard: {
    events: { bg: '#16271F', text: '#2ED9A0', icon: '#2ED9A0' },
    kudos:  { bg: '#16271F', text: '#FBBF40', icon: '#FBBF40' },
    steps:  { bg: '#16271F', text: '#4FEBB5', icon: '#4FEBB5' },
  },
} as const;

// ── Light tokens ──────────────────────────────────────────────────────────────

const LIGHT = {
  ...BRAND,

  // Backgrounds — neutral, not green-tinted
  bgApp:    '#F5F6F7',
  bgDeep:   '#ECEDEF',
  bgCard:   '#FFFFFF',
  bgSurface:'#F0F1F3',
  bgDrawer: '#FFFFFF',
  headerGreen: '#FFFFFF',

  // Text
  headerText: '#111827',

  // Borders — neutral grey, not green-tinted
  borderDefault: '#E2E5E9',
  borderMuted:   '#CDD2D9',

  // Tabs
  tabActive:     '#008A63',
  tabInactive:   '#6B7280',
  tabBackground: '#FFFFFF',
  tabBorder:     '#E5E7EB',

  // Aliases
  cardBackground:    '#FFFFFF',
  surfaceBackground: '#F0F1F3',
  headerBackground:  '#FFFFFF',

  // Capacity bars
  capacityBar: {
    green: { fill: '#008A63', bg: '#D1FAE5' },
    amber: { fill: '#D97706', bg: '#FEF3C7' },
    red:   { fill: '#DC2626', bg: '#FEE2E2' },
  },

  statCard: {
    events: { bg: '#ECFDF5', text: '#065F46', icon: '#059669' },
    kudos:  { bg: '#FFFBEB', text: '#92400E', icon: '#D97706' },
    steps:  { bg: '#ECFDF5', text: '#065F46', icon: '#059669' },
  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

// Widened token type so dark and light variants are interchangeable
export type MerckTokens = {
  [K in keyof typeof DARK]: string extends typeof DARK[K] ? string : typeof DARK[K];
};

// ── Hook — use inside components ──────────────────────────────────────────────

export function useMerckTokens(): typeof DARK {
  const { isDark } = useTheme();
  return (isDark ? DARK : LIGHT) as unknown as typeof DARK;
}

// ── Static export — safe for module-level StyleSheet.create() (dark only) ─────
// Screens that compute styles inside render (using useMerckTokens) will be
// fully theme-reactive. Screens using MERCK_TOKENS in StyleSheet.create()
// will always render dark — migrate them progressively to useMerckTokens().

export const MERCK_TOKENS = DARK;

/** Returns the full token set for a given isDark flag — use in StyleSheet factories */
export const getTokens = (isDark: boolean) => (isDark ? DARK : LIGHT) as unknown as typeof DARK;

/** Returns capacity bar colors based on registered/capacity ratio */
export const getCapacityColors = (registered: number, capacity: number) => {
  if (capacity <= 0) return MERCK_TOKENS.capacityBar.red;
  const ratio = registered / capacity;
  if (ratio < 0.7) return MERCK_TOKENS.capacityBar.green;
  if (ratio < 0.9) return MERCK_TOKENS.capacityBar.amber;
  return MERCK_TOKENS.capacityBar.red;
};
