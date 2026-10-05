// ============================================================================
// FluentEdge — Design Tokens
// ============================================================================
// Framework-neutral design tokens ported verbatim from the FluentEdge design
// prototype (design/fe/fe-shell.jsx + fe-icons.jsx).
//
// - Web consumes FE_THEMES / FE_ACCENTS directly as CSS custom properties.
// - React Native uses the solid color tokens as-is and FE_GRADIENTS for the
//   LinearGradient background (RN cannot parse the CSS `linear-gradient(...)`
//   string in `--bg`, nor the `box-shadow` string in `--card-shadow`).
// ============================================================================

export type FEThemeMode = 'light' | 'dark';
export type FEResolvedMode = FEThemeMode;
export type FEThemePreference = 'system' | FEThemeMode;

/** The four selectable accent keys (also the accent's mid-value hex). */
export type FEAccentKey = '#7A5AF0' | '#4C6FFF' | '#E0518A' | '#12B5A6';

// ----------------------------------------------------------------------------
// Surface themes (raw CSS-string values — web consumes these directly)
// ----------------------------------------------------------------------------
export const FE_THEMES = {
  dark: {
    '--bg': 'linear-gradient(165deg, #3a3d94 0%, #545bc4 48%, #6462c9 100%)',
    '--bg-flat': '#464aa8',
    '--sheet': '#3f439e',
    '--card': 'rgba(255,255,255,0.10)',
    '--stroke': 'rgba(255,255,255,0.16)',
    '--stroke2': 'rgba(255,255,255,0.26)',
    '--text': '#FFFFFF',
    '--text2': 'rgba(255,255,255,0.74)',
    '--text3': 'rgba(255,255,255,0.5)',
    '--chip': 'rgba(255,255,255,0.12)',
    '--track': 'rgba(255,255,255,0.18)',
    '--nav': 'rgba(58,61,148,0.7)',
    '--card-shadow': '0 14px 34px -16px rgba(18,20,64,0.5)',
  },
  light: {
    '--bg': 'linear-gradient(165deg, #eef0fe 0%, #e6e8fb 55%, #edeafd 100%)',
    '--bg-flat': '#eceefe',
    '--sheet': '#ffffff',
    '--card': 'rgba(255,255,255,0.9)',
    '--stroke': 'rgba(60,54,140,0.10)',
    '--stroke2': 'rgba(60,54,140,0.2)',
    '--text': '#231d54',
    '--text2': 'rgba(35,29,84,0.66)',
    '--text3': 'rgba(35,29,84,0.44)',
    '--chip': 'rgba(60,54,140,0.06)',
    '--track': 'rgba(60,54,140,0.12)',
    '--nav': 'rgba(255,255,255,0.82)',
    '--card-shadow': '0 14px 34px -18px rgba(60,54,140,0.3)',
  },
} as const;

export type FEThemeVars = typeof FE_THEMES.dark;

// ----------------------------------------------------------------------------
// Accents
// ----------------------------------------------------------------------------
export interface FEAccent {
  /** Light gradient stop */
  a1: string;
  /** Deep gradient stop */
  a2: string;
  /** Accent text color in dark mode */
  textDark: string;
  /** Accent text color in light mode */
  textLight: string;
}

export const FE_ACCENTS: Record<FEAccentKey, FEAccent> = {
  '#7A5AF0': { a1: '#A78BFA', a2: '#6D3BE4', textDark: '#C9B6FF', textLight: '#6D3BE4' },
  '#4C6FFF': { a1: '#7DA0FF', a2: '#3A54E8', textDark: '#AAC2FF', textLight: '#3A54E8' },
  '#E0518A': { a1: '#FF8DB6', a2: '#D6316E', textDark: '#FFAAC9', textLight: '#D6316E' },
  '#12B5A6': { a1: '#4FE3D4', a2: '#0C9488', textDark: '#71E9DC', textLight: '#0C9488' },
};

export const FE_ACCENT_KEYS = Object.keys(FE_ACCENTS) as FEAccentKey[];

// ----------------------------------------------------------------------------
// Structured background gradient (for RN LinearGradient — mirrors `--bg`)
// ----------------------------------------------------------------------------
export interface FEGradient {
  colors: string[];
  /** Stop positions 0..1, aligned with `colors`. */
  locations: number[];
  /** CSS gradient angle in degrees (165 in the prototype). */
  angle: number;
}

export const FE_GRADIENTS: Record<FEThemeMode, FEGradient> = {
  dark: { colors: ['#3a3d94', '#545bc4', '#6462c9'], locations: [0, 0.48, 1], angle: 165 },
  light: { colors: ['#eef0fe', '#e6e8fb', '#edeafd'], locations: [0, 0.55, 1], angle: 165 },
};

/** Outer page background behind the device frame (web preview parity). */
export const FE_OUTER_BG: Record<FEThemeMode, string> = {
  dark: '#20224e',
  light: '#c9cdf0',
};

// ----------------------------------------------------------------------------
// Icon-tone gradient palette (used by GradIcon, chips, accents on cards)
// Each tone is a [light, dark] two-stop gradient pair.
// ----------------------------------------------------------------------------
export const FE_TONES = {
  red: ['#FF6B87', '#E11D48'],
  gold: ['#FFD66B', '#F09819'],
  green: ['#5EE39A', '#16A34A'],
  blue: ['#6FB1FF', '#2563EB'],
  iris: ['#A78BFA', '#6D3BE4'],
  purple: ['#C28BFF', '#7C3AED'],
  teal: ['#45E3CE', '#0D9488'],
  pink: ['#FF8AC2', '#DB2777'],
  orange: ['#FFB066', '#EA580C'],
  indigo: ['#93A1FF', '#4F46E5'],
  cyan: ['#67E8F9', '#0891B2'],
  slate: ['#9AA5B5', '#566073'],
} as const;

export type FETone = keyof typeof FE_TONES;

// ----------------------------------------------------------------------------
// Tweak defaults (theme / accent / corner radius / animations)
// ----------------------------------------------------------------------------
export interface FEAppearance {
  theme: FEThemePreference;
  accent: FEAccentKey;
  /** Corner radius in px; tweakable 14–30 (default 22). */
  radius: number;
  animations: boolean;
}

export const FE_TWEAK_DEFAULTS: FEAppearance = {
  theme: 'dark',
  accent: '#7A5AF0',
  radius: 22,
  animations: true,
};

export const FE_RADIUS_RANGE = { min: 14, max: 30, default: 22 } as const;

// ----------------------------------------------------------------------------
// Typography
// ----------------------------------------------------------------------------
export const FE_FONT_FAMILY = 'Poppins';
/** Poppins weights the prototype uses (400–800). */
export const FE_FONT_WEIGHTS = [400, 500, 600, 700, 800] as const;
