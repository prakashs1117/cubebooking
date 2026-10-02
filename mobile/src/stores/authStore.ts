/**
 * Auth Store (Zustand + AsyncStorage)
 *
 * Manages authentication state and token persistence
 * Complements AuthContext with persistent Zustand store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/auth.types';

export interface AuthStoreState {
  // State
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Auth Store using Zustand with AsyncStorage persistence
 *
 * Persists:
 * - user: Current authenticated user
 * - accessToken: JWT access token for API calls
 *
 * Does NOT persist:
 * - isLoading: UI state only
 * - error: UI state only
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    set => ({
      // Initial state
      user: null,
      accessToken: null,
      isLoading: true,
      error: null,

      /**
       * Store user and token after successful login
       */
      login: async (user: User, token: string) => {
        set({ user, accessToken: token, error: null });
        if (__DEV__) {
          console.log('✅ Auth store: User logged in', user.name);
        }
      },

      /**
       * Clear user and token on logout
       */
      logout: async () => {
        set({ user: null, accessToken: null, error: null });
        if (__DEV__) {
          console.log('✅ Auth store: User logged out');
        }
      },

      /**
       * Restore token from AsyncStorage on app startup
       * Called by App.tsx during initialization
       */
      restoreToken: async () => {
        try {
          // Token restoration happens automatically via Zustand persist middleware
          // This method is called to signal completion of async restoration
          set({ isLoading: false });
          if (__DEV__) {
            console.log('✅ Auth store: Token restored from storage');
          }
        } catch (e) {
          console.error('Error restoring token:', e);
          set({ isLoading: false });
        }
      },

      /**
       * Set error message
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user and token; not isLoading or error
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
