/**
 * Debug utilities for authentication
 * For development/testing only
 */

import { useUserStore } from '@stores/userStore';
import { tokenStorage } from '@services/storage/tokenStorage';
import { apiConfig } from '@config/index';

/**
 * Debug current auth state
 * Call this from anywhere to see current auth status
 */
export const debugAuthState = async () => {
  const state = useUserStore.getState();
  const accessToken = await tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();
  const user = await tokenStorage.getUser();

  console.log('\n========== AUTH STATE DEBUG ==========');
  console.log('📊 TokenStorage User:', user?.name || 'NOT SET');
  console.log('📊 TokenStorage Email:', user?.email || 'NOT SET');
  console.log(
    '📊 TokenStorage Access Token:',
    accessToken ? `${accessToken.substring(0, 30)}...` : 'NOT SET',
  );
  console.log(
    '📊 TokenStorage Refresh Token:',
    refreshToken ? `${refreshToken.substring(0, 30)}...` : 'NOT SET',
  );
  console.log('---');
  console.log('📊 UserStore User:', state.currentUser?.name || 'NOT SET');
  console.log('📊 UserStore Authenticated:', state.isAuthenticated);
  console.log(
    '📊 UserStore Token:',
    state.authToken ? `${state.authToken.substring(0, 30)}...` : 'NOT SET',
  );
  console.log('======================================\n');

  return {
    tokenStorage: { user, accessToken, refreshToken },
    userStore: state,
  };
};

/**
 * Manually set a test token
 * Useful for testing API calls
 */
export const setTestToken = async (token: string) => {
  console.log(
    '🔧 Setting test token in tokenStorage:',
    token.substring(0, 30) + '...',
  );
  await tokenStorage.saveTokens(token, 'refresh-token-placeholder');

  // Verify
  const newToken = await tokenStorage.getAccessToken();
  console.log(
    '✅ Token set in tokenStorage. Verify:',
    newToken?.substring(0, 30) + '...',
  );

  // Also show debug state
  await debugAuthState();
};

/**
 * Force login with demo user and specific token
 */
export const forceLoginWithToken = async (token: string) => {
  console.log('🔧 Force login with token:', token.substring(0, 30) + '...');

  // Save to tokenStorage (where API reads from)
  await tokenStorage.saveTokens(token, 'refresh-token-placeholder');
  await tokenStorage.saveUser({
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: 'attendee',
  });

  console.log('✅ Token and user saved to tokenStorage');

  // Verify
  await debugAuthState();
};

/**
 * Check if token is in headers (for API calls)
 */
export const testTokenInRequest = async () => {
  const token = await tokenStorage.getAccessToken();

  console.log('\n========== TESTING API REQUEST ==========');
  console.log(
    '🔑 Token from tokenStorage:',
    token ? token.substring(0, 30) + '...' : 'NOT SET',
  );

  if (!token) {
    console.error('❌ NO TOKEN FOUND IN TOKENSTORAGE! API calls will fail.');
    console.log('💡 Use: global.setTestToken("YOUR_TOKEN") to set a token');
    return;
  }

  // Test fetch with token
  try {
    const response = await fetch(`${apiConfig.baseUrl}/me/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📡 Response status:', response.status);

    if (response.status === 401) {
      console.error('❌ 401 Unauthorized - Token is invalid or expired');
      console.log(
        '💡 Get a new token from login and use: global.setTestToken("NEW_TOKEN")',
      );
    } else if (response.status === 200) {
      console.log('✅ Success! Token is working');
      const data = await response.json();
      console.log('📊 Notifications count:', data.notifications?.length || 0);
      console.log('📊 Unread count:', data.unreadCount || 0);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }

  console.log('=========================================\n');
};

// Export for global access in dev mode
if (__DEV__) {
  (global as any).debugAuth = debugAuthState;
  (global as any).setTestToken = setTestToken;
  (global as any).forceLoginWithToken = forceLoginWithToken;
  (global as any).testTokenInRequest = testTokenInRequest;

  console.log('\n🔧 Debug utilities available:');
  console.log('   - global.debugAuth() - Show current auth state');
  console.log('   - global.setTestToken(token) - Set a test token');
  console.log(
    '   - global.forceLoginWithToken(token) - Force login with token',
  );
  console.log(
    '   - global.testTokenInRequest() - Test API call with current token\n',
  );
}
