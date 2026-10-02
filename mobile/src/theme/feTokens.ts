import {
  FE_ACCENTS,
  FE_GRADIENTS,
  FE_OUTER_BG,
  FE_TONES,
  type FEAccentKey,
  type FEThemeMode,
  type FEGradient,
  type FETone,
} from '@demand/shared/fe';

/**
 * FluentEdge design tokens — React Native form.
 *
 * The shared package holds framework-neutral tokens (design/tokens.ts). RN
 * cannot use the CSS `linear-gradient(...)` string in `--bg` or the CSS
 * `box-shadow` in `--card-shadow`, so this module resolves those into
 * RN-native shapes: FE_GRADIENTS drives <LinearGradient>, and card elevation
 * is expressed as RN shadow props.
 */

export interface FEShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  /** Android */
  elevation: number;
}

export interface FEResolvedTheme {
  mode: FEThemeMode;
  isDark: boolean;

  // Surfaces
  bgGradient: FEGradient;
  bgFlat: string;
  outerBg: string;
  sheet: string;
  card: string;
  stroke: string;
  stroke2: string;
  chip: string;
  track: string;
  nav: string;
  cardShadow: FEShadow;

  // Text
  text: string;
  text2: string;
  text3: string;

  // Accent
  accentKey: FEAccentKey;
  a1: string;
  a2: string;
  aText: string;

  // Shape
  radius: number;

  // Palette passthrough
  tones: typeof FE_TONES;
}

/** Card elevation (RN equivalent of the prototype's `--card-shadow`). */
const cardShadowFor = (isDark: boolean): FEShadow => ({
  shadowColor: isDark ? '#121440' : '#3c368c',
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: isDark ? 0.5 : 0.3,
  shadowRadius: 24,
  elevation: 8,
});

/**
 * Resolve the full RN theme from mode + accent + radius.
 * Pure — memoize at the call site (see useFETheme).
 */
export function resolveFETheme(
  isDark: boolean,
  accentKey: FEAccentKey,
  radius: number,
): FEResolvedTheme {
  const mode: FEThemeMode = isDark ? 'dark' : 'light';
  const accent = FE_ACCENTS[accentKey] ?? FE_ACCENTS['#7A5AF0'];

  return {
    mode,
    isDark,

    bgGradient: FE_GRADIENTS[mode],
    bgFlat: isDark ? '#464aa8' : '#eceefe',
    outerBg: FE_OUTER_BG[mode],
    sheet: isDark ? '#3f439e' : '#ffffff',
    card: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.9)',
    stroke: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(60,54,140,0.10)',
    stroke2: isDark ? 'rgba(255,255,255,0.26)' : 'rgba(60,54,140,0.2)',
    chip: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(60,54,140,0.06)',
    track: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(60,54,140,0.12)',
    nav: isDark ? 'rgba(58,61,148,0.7)' : 'rgba(255,255,255,0.82)',
    cardShadow: cardShadowFor(isDark),

    text: isDark ? '#FFFFFF' : '#231d54',
    text2: isDark ? 'rgba(255,255,255,0.74)' : 'rgba(35,29,84,0.66)',
    text3: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(35,29,84,0.44)',

    accentKey,
    a1: accent.a1,
    a2: accent.a2,
    aText: isDark ? accent.textDark : accent.textLight,

    radius,

    tones: FE_TONES,
  };
}

/** Resolve the two-stop gradient for an icon tone. */
export function toneGradient(tone: FETone): readonly [string, string] {
  return FE_TONES[tone] ?? FE_TONES.iris;
}
