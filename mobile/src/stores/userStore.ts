/**
 * User Store (Zustand + AsyncStorage)
 *
 * Manages user authentication and role-based permissions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface UserState {
  // State
  currentUser: User | null;
  isAuthenticated: boolean;
  authToken: string | null;

  // Actions
  setUser: (user: User, token?: string) => void;
  setAuthToken: (token: string) => void;
  setUserRole: (role: UserRole) => void;
  clearUser: () => void;
  getAuthToken: () => string | null;
  isAdmin: () => boolean;
  toggleAdminMode: () => void; // Dev only - toggle between user and admin
}

/**
 * User Store
 *
 * Manages current user state and role-based permissions
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      authToken: null,

      /**
       * Set current user and optional auth token
       */
      setUser: (user: User, token?: string) => {
        const finalToken = token || get().authToken;
        set({
          currentUser: user,
          isAuthenticated: true,
          authToken: finalToken,
        });

        if (__DEV__) {
          console.log('👤 User set:', user.name, `(${user.role})`);
          if (token) {
            console.log('🔑 Auth token set:', token.substring(0, 20) + '...');
          }
          console.log(
            '🔑 Token in store:',
            finalToken ? finalToken.substring(0, 20) + '...' : 'NULL',
          );
        }
      },

      /**
       * Set auth token
       */
      setAuthToken: (token: string) => {
        set({ authToken: token });

        if (__DEV__) {
          console.log('🔑 Auth token set');
        }
      },

      /**
       * Set user role
       */
      setUserRole: (role: UserRole) => {
        const { currentUser } = get();
        if (currentUser) {
          set({
            currentUser: {
              ...currentUser,
              role,
            },
          });

          if (__DEV__) {
            console.log('👤 User role updated:', role);
          }
        }
      },

      /**
       * Clear user (logout)
       */
      clearUser: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          authToken: null,
        });

        if (__DEV__) {
          console.log('👤 User cleared');
        }
      },

      /**
       * Get auth token
       */
      getAuthToken: (): string | null => {
        const token = get().authToken;
        if (__DEV__) {
          console.log(
            '🔑 Getting auth token:',
            token ? token.substring(0, 20) + '...' : 'NULL',
          );
        }
        return token;
      },

      /**
       * Check if current user is admin
       */
      isAdmin: (): boolean => {
        const { currentUser } = get();
        return currentUser?.role === 'admin';
      },

      /**
       * Toggle admin mode (dev only)
       */
      toggleAdminMode: () => {
        if (!__DEV__) {
          console.warn('Admin toggle is only available in development mode');
          return;
        }

        const { currentUser, setUserRole } = get();
        if (currentUser) {
          const newRole: UserRole =
            currentUser.role === 'admin' ? 'user' : 'admin';
          setUserRole(newRole);
          console.log(`👤 Toggled to ${newRole} mode`);
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * Hook to check if current user is admin
 */
export const useIsAdmin = (): boolean => {
  return useUserStore(state => state.currentUser?.role === 'admin');
};

/**
 * Hook to get current user
 */
export const useCurrentUser = (): User | null => {
  return useUserStore(state => state.currentUser);
};

/**
 * Initialize a demo user (for development)
 */
export const initializeDemoUser = () => {
  const currentUser = useUserStore.getState().currentUser;
  const currentToken = useUserStore.getState().authToken;

  if (__DEV__) {
    console.log('🔄 Initializing demo user...');
    console.log('   Current user:', currentUser?.name || 'NONE');
    console.log(
      '   Current token:',
      currentToken ? currentToken.substring(0, 20) + '...' : 'NONE',
    );
  }

  // Only initialize if no user exists
  if (!currentUser) {
    const demoToken = 'demo-token-12345';
    console.log('✅ Creating demo user with token:', demoToken);

    useUserStore.getState().setUser(
      {
        id: 'demo-user-1',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'user', // Default to regular user
      },
      demoToken, // Demo token for development
    );

    // Verify it was set
    const verifyToken = useUserStore.getState().authToken;
    console.log(
      '✅ Verification - Token in store:',
      verifyToken ? verifyToken.substring(0, 20) + '...' : 'NOT SET!',
    );
  }
};
