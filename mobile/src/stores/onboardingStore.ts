import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  feGetOnboardingConfig,
  type OnboardingConfig,
  type OnboardingOption,
  type AssessmentPrompt,
} from '@services/fe/feApi';

const ONBOARDING_CACHE_KEY = 'fe_onboarding_config';
const ONBOARDING_SELECTIONS_KEY = 'fe_onboarding_selections';

export interface OnboardingSelections {
  goals: string[];
  situations: string[];
  selfrate: {
    speakUp?: number;
    blocker?: string;
  };
  details: {
    name?: string;
    profession?: string;
    lang?: string;
    goal?: number;
  };
  completedAt?: string;
}

interface OnboardingState {
  // Config data from backend
  config: OnboardingConfig | null;
  loading: boolean;
  error: string | null;

  // User selections (cached in AsyncStorage + RAM)
  selections: OnboardingSelections;

  // Actions
  loadConfig: () => Promise<void>;
  updateSelections: (updates: Partial<OnboardingSelections>) => Promise<void>;
  clearSelections: () => Promise<void>;
  restoreSelections: () => Promise<void>;
}

/**
 * Onboarding store — manages backend config + user funnel selections.
 * Selections are persisted to AsyncStorage, config is cached.
 */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  config: null,
  loading: false,
  error: null,
  selections: {
    goals: [],
    situations: [],
    selfrate: {},
    details: { goal: 10 },
  },

  loadConfig: async () => {
    set({ loading: true, error: null });
    try {
      // Try to load from cache first
      const cached = await AsyncStorage.getItem(ONBOARDING_CACHE_KEY);
      if (cached) {
        set({ config: JSON.parse(cached), loading: false });
        // Refresh in background
        const fresh = await feGetOnboardingConfig();
        await AsyncStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(fresh));
        set({ config: fresh });
      } else {
        // No cache, fetch from backend
        const config = await feGetOnboardingConfig();
        await AsyncStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(config));
        set({ config, loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load onboarding config',
        loading: false,
      });
    }
  },

  updateSelections: async (updates) => {
    set((state) => {
      const merged = {
        goals: updates.goals ?? state.selections.goals,
        situations: updates.situations ?? state.selections.situations,
        selfrate: { ...state.selections.selfrate, ...updates.selfrate },
        details: { ...state.selections.details, ...updates.details },
        completedAt: updates.completedAt ?? state.selections.completedAt,
      };
      AsyncStorage.setItem(ONBOARDING_SELECTIONS_KEY, JSON.stringify(merged)).catch(console.error);
      return { selections: merged };
    });
  },

  clearSelections: async () => {
    await AsyncStorage.removeItem(ONBOARDING_SELECTIONS_KEY);
    set({
      selections: {
        goals: [],
        situations: [],
        selfrate: {},
        details: { goal: 10 },
      },
    });
  },

  restoreSelections: async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_SELECTIONS_KEY);
      if (stored) {
        set({ selections: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to restore onboarding selections:', error);
    }
  },
}));
