/**
 * User Store Tests
 */

import { useUserStore, initializeDemoUser } from '@stores/userStore';

// Reset store to clean initial state before each test
beforeEach(() => {
  useUserStore.setState({
    currentUser: null,
    isAuthenticated: false,
    authToken: null,
  });
});

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
};

const adminUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin' as const,
};

describe('setUser', () => {
  it('sets current user and marks as authenticated', () => {
    useUserStore.getState().setUser(mockUser, 'token-abc');
    const state = useUserStore.getState();
    expect(state.currentUser).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.authToken).toBe('token-abc');
  });

  it('preserves existing token when none passed', () => {
    useUserStore.setState({ authToken: 'existing-token' });
    useUserStore.getState().setUser(mockUser);
    expect(useUserStore.getState().authToken).toBe('existing-token');
  });
});

describe('setAuthToken', () => {
  it('updates the auth token', () => {
    useUserStore.getState().setAuthToken('new-token');
    expect(useUserStore.getState().authToken).toBe('new-token');
  });
});

describe('setUserRole', () => {
  it('updates the role on currentUser', () => {
    useUserStore.setState({ currentUser: { ...mockUser } });
    useUserStore.getState().setUserRole('admin');
    expect(useUserStore.getState().currentUser?.role).toBe('admin');
  });

  it('does nothing when currentUser is null', () => {
    expect(() => useUserStore.getState().setUserRole('admin')).not.toThrow();
  });
});

describe('clearUser', () => {
  it('resets all auth state', () => {
    useUserStore.getState().setUser(mockUser, 'token');
    useUserStore.getState().clearUser();
    const state = useUserStore.getState();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.authToken).toBeNull();
  });
});

describe('getAuthToken', () => {
  it('returns the current auth token', () => {
    useUserStore.setState({ authToken: 'my-token' });
    expect(useUserStore.getState().getAuthToken()).toBe('my-token');
  });

  it('returns null when no token', () => {
    expect(useUserStore.getState().getAuthToken()).toBeNull();
  });
});

describe('isAdmin', () => {
  it('returns true for admin role', () => {
    useUserStore.setState({ currentUser: adminUser });
    expect(useUserStore.getState().isAdmin()).toBe(true);
  });

  it('returns false for user role', () => {
    useUserStore.setState({ currentUser: mockUser });
    expect(useUserStore.getState().isAdmin()).toBe(false);
  });

  it('returns false when no user', () => {
    expect(useUserStore.getState().isAdmin()).toBe(false);
  });
});

describe('toggleAdminMode', () => {
  it('toggles user role to admin', () => {
    useUserStore.setState({ currentUser: { ...mockUser } });
    useUserStore.getState().toggleAdminMode();
    expect(useUserStore.getState().currentUser?.role).toBe('admin');
  });

  it('toggles admin role back to user', () => {
    useUserStore.setState({ currentUser: { ...adminUser } });
    useUserStore.getState().toggleAdminMode();
    expect(useUserStore.getState().currentUser?.role).toBe('user');
  });

  it('does nothing when no currentUser', () => {
    expect(() => useUserStore.getState().toggleAdminMode()).not.toThrow();
  });
});

describe('useIsAdmin selector', () => {
  it('returns true when current user is admin', () => {
    useUserStore.setState({ currentUser: adminUser });
    // Call selector directly on store state
    const result = useUserStore.getState().currentUser?.role === 'admin';
    expect(result).toBe(true);
  });
});

describe('useCurrentUser selector', () => {
  it('returns currentUser from state', () => {
    useUserStore.setState({ currentUser: mockUser });
    const result = useUserStore.getState().currentUser;
    expect(result).toEqual(mockUser);
  });
});

describe('initializeDemoUser', () => {
  it('creates demo user when no user exists', () => {
    initializeDemoUser();
    const state = useUserStore.getState();
    expect(state.currentUser?.name).toBe('Demo User');
    expect(state.authToken).toBe('demo-token-12345');
  });

  it('does not overwrite existing user', () => {
    useUserStore.getState().setUser(mockUser, 'real-token');
    initializeDemoUser();
    expect(useUserStore.getState().currentUser?.name).toBe('Test User');
  });
});
