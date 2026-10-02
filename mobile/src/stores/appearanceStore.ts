import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FE_TWEAK_DEFAULTS,
  FE_RADIUS_RANGE,
  type FEThemePreference,
  type FEAccentKey,
} from '@demand/shared/fe';

/**
 * Appearance Store — FluentEdge design-system preferences.
 *
 * Single source of truth for theme mode, accent, corner radius and the
 * animations flag (Dev Plan Phase 0: "4 accents wired to a Zustand slice").
 * Resolved theme tokens are derived from this store in `useFETheme`.
 */
interface AppearanceState {
  /** 'system' follows the OS color scheme. */
  theme: FEThemePreference;
  accent: FEAccentKey;
  /** Corner radius in px (14–30). */
  radius: number;
  animations: boolean;

  setTheme: (theme: FEThemePreference) => void;
  toggleTheme: (isDark: boolean) => void;
  setAccent: (accent: FEAccentKey) => void;
  setRadius: (radius: number) => void;
  setAnimations: (on: boolean) => void;
}

const clampRadius = (r: number) =>
  Math.max(FE_RADIUS_RANGE.min, Math.min(FE_RADIUS_RANGE.max, Math.round(r)));

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      theme: FE_TWEAK_DEFAULTS.theme,
      accent: FE_TWEAK_DEFAULTS.accent,
      radius: FE_TWEAK_DEFAULTS.radius,
      animations: FE_TWEAK_DEFAULTS.animations,

      setTheme: (theme) => set({ theme }),
      // From an explicit mode, flip to the opposite concrete mode.
      toggleTheme: (isDark) => set({ theme: isDark ? 'light' : 'dark' }),
      setAccent: (accent) => set({ accent }),
      setRadius: (radius) => set({ radius: clampRadius(radius) }),
      setAnimations: (animations) => set({ animations }),
    }),
    {
      name: 'fe.appearance',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
