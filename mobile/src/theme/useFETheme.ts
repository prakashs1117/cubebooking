import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppearanceStore } from '@stores/appearanceStore';
import { resolveFETheme, type FEResolvedTheme } from '@theme/feTokens';

export interface UseFEThemeResult extends FEResolvedTheme {
  animations: boolean;
}

/**
 * FluentEdge theme hook — the primary theming entry point for FE screens
 * and components. Combines the appearance store (theme/accent/radius/
 * animations) with the OS color scheme to produce resolved RN tokens.
 */
export function useFETheme(): UseFEThemeResult {
  const scheme = useColorScheme();
  const theme = useAppearanceStore((s) => s.theme);
  const accent = useAppearanceStore((s) => s.accent);
  const radius = useAppearanceStore((s) => s.radius);
  const animations = useAppearanceStore((s) => s.animations);

  const isDark = theme === 'system' ? scheme === 'dark' : theme === 'dark';

  return useMemo(
    () => ({ ...resolveFETheme(isDark, accent, radius), animations }),
    [isDark, accent, radius, animations],
  );
}
