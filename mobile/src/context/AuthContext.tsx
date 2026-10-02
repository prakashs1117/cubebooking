/**
 * Enhanced Authentication Context
 * Provides global auth state and methods with real API integration
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Linking } from 'react-native';
import { apiConfig } from '@config/index';
import { tokenStorage } from '@services/storage/tokenStorage';
import { authService } from '@services/api/auth.service';

// react-native-inappbrowser-reborn is installed separately:
// cd mobile && npm install react-native-inappbrowser-reborn && cd ios && pod install
let InAppBrowser: any;
try {
  InAppBrowser = require('react-native-inappbrowser-reborn').default;
} catch {
  // Library not installed yet — loginWithSso will fall back to Linking.openURL
}
import { userService } from '@services/api/user.service';
import { sessionEvents } from '@utils/sessionEvents';
import {
  LoginRequest,
  CaptchaResponse,
  RegisterStartRequest,
  RegisterStartResponse,
  RegisterVerifyRequest,
  ResetPasswordRequest,
  ForgotPasswordResponse,
  OTPVerificationRequest,
  OTPVerificationResponse,
  ResendOTPRequest,
  AuthContextType,
  AuthState,
} from '@/types/auth.types';
import { getAuthErrorMessage } from '@utils/errorHandler';
// Firebase analytics disabled for now
// import { analytics } from '@services/analyticsService';
import { registerDeviceToken } from '@services/pushNotificationService';
import { useAuthStore } from '@stores/authStore';
import { useFeAuthStore } from '@stores/feAuthStore';
import type { FeMe } from '@services/fe/feApi';
import i18n from '@localization/i18n';
import { queryClient } from '@lib/queryClient';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
    isGuest: false,
    error: null,
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  const [pendingAuthTarget, setPendingAuthTarget] = useState<
    'signIn' | 'signUp' | null
  >(null);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Listen for session expiry from the API client
  useEffect(() => {
    const unsubscribe = sessionEvents.onSessionExpired(() => {
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
        error: null,
      });
      setSessionExpired(true);
    });
    return unsubscribe;
  }, []);


  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, user] = await Promise.all([
        tokenStorage.getAccessToken(),
        tokenStorage.getRefreshToken(),
        tokenStorage.getUser(),
      ]);

      if (accessToken && user) {
        setState({
          user,
          accessToken,
          refreshToken: refreshToken ?? accessToken,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
          error: null,
        });
        useFeatureFlagsStore.getState().syncFromBackend();
      } else {
        // Restore guest session if the user previously chose "Continue as Guest"
        const isGuest = await tokenStorage.getGuestMode();
        if (isGuest) {
          setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            isAuthenticated: true,
            isGuest: true,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchCaptcha = async (): Promise<CaptchaResponse> => {
    return authService.fetchCaptcha();
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(credentials);

      // Layer 1: AsyncStorage
      await tokenStorage.saveTokens(response.accessToken, response.accessToken);
      await tokenStorage.saveUser(response.user);

      // Layer 2: Zustand store
      useAuthStore.getState().login(response.user, response.accessToken);

      // Layer 3: feAuthStore — drives RootNavigator's auth gate
      const feUser: FeMe = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.name?.split(' ')[0] ?? response.user.email,
        lastName: response.user.name?.split(' ').slice(1).join(' ') ?? '',
        role: response.user.position ?? 'user',
        roles: [response.user.position ?? 'user'],
        isEmailVerified: true,
        tier: 'free',
        xp: 0,
        level: 1,
        streak: { current: 0, longest: 0 },
        persona: null,
        latestScore: null,
        onboarding: { state: 'done', goals: [], situations: [] },
      };
      useFeAuthStore.getState().setSession(feUser);

      // Layer 4: AuthContext state — set authenticated immediately so navigation fires
      setState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.accessToken,
        isLoading: false,
        isAuthenticated: true,
        isGuest: false,
        error: null,
      });

      useFeatureFlagsStore.getState().syncFromBackend();

      // Register FCM token so backend can send push notifications to this device
      registerDeviceToken().catch(() => {});
    } catch (error) {
      const errorMessage = i18n.t(getAuthErrorMessage(error, 'login'));
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  /**
   * Initiates Microsoft Azure AD SSO login via system browser.
   *
   * Opens Chrome Custom Tab (Android) or SFSafariViewController (iOS) so
   * Microsoft's login page loads in a trusted browser (Microsoft blocks WebView login).
   * After authentication, the backend redirects to ocbapp://auth/callback?code=xxx.
   * The deep link handler in RootNavigator picks up that URL and calls ssoExchange().
   *
   * To reuse in another app:
   * 1. Change the deep link scheme in MOBILE_SSO_REDIRECT_URI below
   * 2. Ensure RootNavigator (or equivalent) listens for your scheme
   * 3. Install react-native-inappbrowser-reborn and run pod install
   */
  const loginWithSso = async () => {
    const backendBase = apiConfig.baseUrl.replace('/api/v1', '');
    const ssoUrl = `${backendBase}/api/v1/auth/sso/redirect?platform=mobile`;
    const redirectUri = 'ocbapp://auth/callback';

    try {
      if (InAppBrowser && await InAppBrowser.isAvailable()) {
        await InAppBrowser.openAuth(ssoUrl, redirectUri, {
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          preferredBarTintColor: '#1a1a2e',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalEnabled: true,
        });
      } else {
        await Linking.openURL(ssoUrl);
      }
    } catch (err) {
      console.error('[SSO] Failed to open browser:', err);
    }
  };

  /**
   * Completes an SSO login after the deep link exchange.
   * Called by RootNavigator after ssoExchange() succeeds.
   * Stores tokens, syncs auth store, and updates context state.
   */
  const completeSSO = async (user: any, accessToken: string, refreshToken: string) => {
    try {
      await tokenStorage.saveTokens(accessToken, refreshToken);
      await tokenStorage.saveUser(user);
      useAuthStore.getState().login(user, accessToken);
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        isGuest: false,
        error: null,
      }));

      // Register FCM token so backend can send push notifications to this device
      registerDeviceToken().catch(() => {});
    } catch (err) {
      console.error('[SSO] completeSSO failed:', err);
      throw err;
    }
  };

  const continueAsGuest = () => {
    tokenStorage.saveGuestMode(true).catch(() => {});
    setState(prev => ({
      ...prev,
      isGuest: true,
      isAuthenticated: true, // treat guest as "authenticated" so navigator shows Main
      isLoading: false,
      error: null,
    }));
    // Store location locally for guest (no auth token, can't call settings API)
    // Disabled — My M Safety API no longer available
    // syncGuestLocation().catch(() => {});
  };

  const register = async (
    data: RegisterStartRequest,
  ): Promise<RegisterStartResponse> => {
    try {
      const response = await authService.registerStart(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyRegistration = async (data: RegisterVerifyRequest) => {
    // POST /user/registration/code — { email, code }
    const response = await authService.registerVerify(data);

    // Layer 1: AsyncStorage — persists across app restarts
    await tokenStorage.saveTokens(response.accessToken, response.accessToken);
    await tokenStorage.saveUser(response.user);

    // Layer 2: Zustand store — in-memory + its own AsyncStorage persistence
    useAuthStore.getState().login(response.user, response.accessToken);

    // Layer 3: AuthContext state — triggers RootNavigator to switch to Main
    setState({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.accessToken,
      isLoading: false,
      isAuthenticated: true,
      isGuest: false,
      error: null,
    });
    useFeatureFlagsStore.getState().syncFromBackend();

    // Register FCM token so backend can send push notifications to this device
    registerDeviceToken().catch(() => {});
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore API errors during logout — token may already be invalid
      console.warn('Logout API call failed (token may be expired):', error);
    } finally {
      await tokenStorage.clearAuthData();
      // Firebase analytics disabled for now
      // analytics.logLogout();
      // Clear all cached query data so the next user starts fresh
      queryClient.clear();
      useFeAuthStore.getState().logout().catch(() => {});
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
        error: null,
      });
    }
  };

  const deleteAccount = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!state.user) {
        throw new Error('No user context available');
      }

      await userService.deleteAccount(state.user);

      // Clear all auth data and cache
      await tokenStorage.clearAuthData();
      queryClient.clear();

      // Update state to trigger logout flow
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = i18n.t(getAuthErrorMessage(error, 'delete-account'));
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const forgotPassword = async (
    email: string,
  ): Promise<ForgotPasswordResponse> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      const errorMessage = i18n.t(
        getAuthErrorMessage(error, 'forgot-password'),
      );
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      await authService.resetPassword(data);
    } catch (error) {
      const errorMessage = i18n.t(getAuthErrorMessage(error, 'reset-password'));
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const verifyOTP = async (
    data: OTPVerificationRequest,
  ): Promise<OTPVerificationResponse> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const response = await authService.verifyOTP(data);
      return response;
    } catch (error) {
      const errorMessage = i18n.t(getAuthErrorMessage(error, 'verify-otp'));
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const resendOTP = async (data: ResendOTPRequest) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      await authService.resendOTP(data);
    } catch (error) {
      const errorMessage = i18n.t(getAuthErrorMessage(error));
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const refreshAuth = async () => {
    await loadStoredAuth();
  };

  const dismissSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const exitGuestMode = (target: 'signIn' | 'signUp' = 'signIn') => {
    tokenStorage.saveGuestMode(false).catch(() => {});
    setPendingAuthTarget(target);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      isGuest: false,
      error: null,
    });
  };

  const clearPendingAuthTarget = () => setPendingAuthTarget(null);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        sessionExpired,
        fetchCaptcha,
        login,
        continueAsGuest,
        register,
        verifyRegistration,
        logout,
        deleteAccount,
        forgotPassword,
        resetPassword,
        verifyOTP,
        resendOTP,
        clearError,
        refreshAuth,
        dismissSessionExpired,
        exitGuestMode,
        pendingAuthTarget,
        clearPendingAuthTarget,
        loginWithSso,
        completeSSO,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
