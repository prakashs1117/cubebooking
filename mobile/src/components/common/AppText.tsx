/**
 * AppText — single source of truth for all text in MerckConnect.
 *
 * Available fonts and their files:
 *
 *   Poppins (primary brand font):
 *     light     → poppins.light.ttf       (weight 300)
 *     regular   → Poppins-Medium.ttf      (weight 400 — no Regular file, Medium is closest)
 *     medium    → Poppins-Medium.ttf      (weight 500)
 *     semibold  → Poppins-SemiBold.ttf    (weight 600)
 *     bold      → Poppins-SemiBold.ttf    (weight 700 — no Bold file, SemiBold is closest)
 *     extrabold → Poppins-SemiBold.ttf    (weight 800)
 *
 *   Urbanist (secondary / display font):
 *     light     → Urbanist-Light.ttf      (weight 300)
 *     regular   → Urbanist-Regular.ttf    (weight 400)
 *     thin      → Urbanist-Thin.ttf       (weight 100)
 *
 * Usage:
 *   <AppText>Body copy (Poppins Medium by default)</AppText>
 *   <AppText weight="bold" size={22} color={T.headerText}>Heading</AppText>
 *   <AppText font="urbanist" weight="regular" size={14}>Display text</AppText>
 *   <AppText weight="light" size={11} color={T.tabInactive}>Caption</AppText>
 */

import React from 'react';
import { Text, TextProps, Platform, StyleSheet } from 'react-native';

export type AppTextFont   = 'poppins' | 'urbanist';
export type AppTextWeight = 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface AppTextProps extends TextProps {
  /** Font family. Default: 'poppins' */
  font?: AppTextFont;
  /** Font weight variant. Default: 'medium' */
  weight?: AppTextWeight;
  /** Font size in px */
  size?: number;
  /** Text color */
  color?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Letter spacing */
  letterSpacing?: number;
}

// ── Font resolution table ─────────────────────────────────────────────────────
// One place. All font-family names must match the file names exactly as
// registered on iOS (Info.plist) and Android (assets/fonts/).

type FontSpec = { fontFamily: string; fontWeight: '100' | '300' | '400' | '500' | '600' | '700' | '800' };

const FONTS: Record<AppTextFont, Partial<Record<AppTextWeight, FontSpec>>> = {
  poppins: {
    light:     { fontFamily: Platform.OS === 'ios' ? 'Poppins-Light' : 'poppins.light',     fontWeight: '300' },
    regular:   { fontFamily: 'Poppins-Medium',                                               fontWeight: '400' },
    medium:    { fontFamily: 'Poppins-Medium',                                               fontWeight: '500' },
    semibold:  { fontFamily: 'Poppins-SemiBold',                                             fontWeight: '600' },
    bold:      { fontFamily: 'Poppins-SemiBold',                                             fontWeight: '700' },
    extrabold: { fontFamily: 'Poppins-SemiBold',                                             fontWeight: '800' },
  },
  urbanist: {
    thin:      { fontFamily: 'Urbanist-Thin',    fontWeight: '100' },
    light:     { fontFamily: 'Urbanist-Light',   fontWeight: '300' },
    regular:   { fontFamily: 'Urbanist-Regular', fontWeight: '400' },
    // Urbanist only ships Thin/Light/Regular — heavier weights fall back to Regular
    medium:    { fontFamily: 'Urbanist-Regular', fontWeight: '500' },
    semibold:  { fontFamily: 'Urbanist-Regular', fontWeight: '600' },
    bold:      { fontFamily: 'Urbanist-Regular', fontWeight: '700' },
    extrabold: { fontFamily: 'Urbanist-Regular', fontWeight: '800' },
  },
};

const DEFAULT_FONT: AppTextFont   = 'poppins';
const DEFAULT_WEIGHT: AppTextWeight = 'medium';

export default function AppText({
  font   = DEFAULT_FONT,
  weight = DEFAULT_WEIGHT,
  size,
  color,
  align,
  letterSpacing,
  style,
  children,
  ...rest
}: AppTextProps) {
  const spec = FONTS[font][weight] ?? FONTS[font].regular ?? FONTS.poppins.medium!;

  return (
    <Text
      style={[
        s.base,
        {
          fontFamily: spec.fontFamily,
          fontWeight: spec.fontWeight,
          ...(size             !== undefined && { fontSize: size }),
          ...(color            !== undefined && { color }),
          ...(align            !== undefined && { textAlign: align }),
          ...(letterSpacing    !== undefined && { letterSpacing }),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const s = StyleSheet.create({
  base: {
    // intentionally empty — all styling is dynamic above
  },
});
