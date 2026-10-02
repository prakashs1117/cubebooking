import { create } from 'zustand';
import {
  firebaseLogin,
  firebaseSignup,
  firebaseLogout,
} from '@services/fe/firebaseAuth';
import { feHasToken, feGetMe, feLogout, type FeMe } from '@services/fe/feApi';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

export type FeAuthStatus = 'hydrating' | 'authed' | 'guest';

/**
 * DEV ONLY — skip auth/onboarding and boot straight into the tab shell with a
 * mock user, so internal screens can be worked on without signing in or a
 * backend. Flip to `false` (or delete) before shipping real auth flows.
 */
const DEV_BYPASS_AUTH = false;

const DEV_MOCK_USER: FeMe = {
  id: 'dev-mock',
  email: 'demo@fluentedge.app',
  firstName: 'Prakash',
  lastName: 'S',
  role: 'viewer',
  roles: ['viewer'],
  isEmailVerified: true,
  tier: 'free',
  xp: 1240,
  level: 6,
  streak: { current: 9, longest: 14 },
  persona: 'silent',
  latestScore: { overall: 62, pillars: {}, at: new Date().toISOString() },
  onboarding: { state: 'done', goals: [], situations: [] },
};

interface FeAuthState {
  status: FeAuthStatus;
  user: FeMe | null;

  /** Restore a session on app launch from the stored token. */
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; firstName: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: FeMe) => void;
  /** Mark the session authed with a resolved user (used to finish onboarding). */
  setSession: (user: FeMe) => void;
}

/**
 * FluentEdge auth state — single source of truth for "is the user signed in".
 * Tokens live in feClient/AsyncStorage; this store holds the resolved user +
 * status that the RootNavigator gates on.
 */
export const useFeAuthStore = create<FeAuthState>((set) => ({
  status: DEV_BYPASS_AUTH ? 'authed' : 'hydrating',
  user: DEV_BYPASS_AUTH ? DEV_MOCK_USER : null,

  hydrate: async () => {
    if (DEV_BYPASS_AUTH) {
      set({ status: 'authed', user: DEV_MOCK_USER });
      return;
    }
    try {
      // Session lives in the backend JWT stored by firebase-sync, not Firebase
      // client state. If we have a token, fetch the user to validate + restore.
      if (!(await feHasToken())) {
        set({ status: 'guest', user: null });
        return;
      }

      const user = await feGetMe();
      set({ status: 'authed', user });
      useFeatureFlagsStore.getState().syncFromBackend();
    } catch {
      // Token missing/expired or backend unreachable → treat as signed out.
      set({ status: 'guest', user: null });
    }
  },

  login: async (email, password) => {
    const { user } = await firebaseLogin({ email, password });
    set({ status: 'authed', user });
    useFeatureFlagsStore.getState().syncFromBackend();
  },

  register: async (input) => {
    const { user } = await firebaseSignup(input);
    set({ status: 'authed', user });
    useFeatureFlagsStore.getState().syncFromBackend();
  },

  logout: async () => {
    // Clear both the Firebase client session and the stored backend JWTs.
    await Promise.allSettled([firebaseLogout(), feLogout()]);
    set({ status: 'guest', user: null });
  },

  setUser: (user) => set({ user }),

  setSession: (user) => set({ status: 'authed', user }),
}));
