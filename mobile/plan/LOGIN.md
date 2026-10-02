React Native Login Integration - Development Plan

---

📋 Overview

This plan covers integrating the existing Next.js event management backend authentication APIs into a React  
 Native mobile application for end-users (non-admin).

Backend API Base URL: https://your-domain.com/api/v1

Authentication Flow:

- JWT-based authentication (access token: 15min, refresh token: 30 days)
- Email/Password credentials login
- Automatic token refresh
- Email verification requirement

---

1. Project Setup & Dependencies

Install Required Packages:

npm install @react-native-async-storage/async-storage axios react-native-dotenv
npm install --save-dev @types/react-native-dotenv

Dependencies:

- @react-native-async-storage/async-storage - Secure token storage
- axios - HTTP client for API calls
- react-native-dotenv - Environment variable management

---

2. Project Structure

src/
├── services/
│ ├── api/
│ │ ├── client.ts # Axios instance with interceptors
│ │ ├── auth.service.ts # Auth API endpoints
│ │ └── types.ts # API request/response types
│ ├── storage/
│ │ └── tokenStorage.ts # Secure token management
├── hooks/
│ ├── useAuth.ts # Authentication hook
│ └── useLogin.ts # Login-specific hook
├── context/
│ └── AuthContext.tsx # Global auth state
├── types/
│ └── auth.types.ts # TypeScript type definitions
└── utils/
├── validation.ts # Input validation helpers
└── errorHandler.ts # API error handling

---

3. Type Definitions

File: src/types/auth.types.ts

// User types
export interface User {
id: string;
email: string;
username: string;
role: 'USER' | 'ADMIN';
}

// Login request/response
export interface LoginRequest {
email: string;
password: string;
}

export interface LoginResponse {
accessToken: string;
refreshToken: string;
expiresIn: number; // seconds
user: User;
}

// Refresh token request/response
export interface RefreshTokenRequest {
refreshToken: string;
}

export interface RefreshTokenResponse {
accessToken: string;
refreshToken: string;
expiresIn: number;
}

// API error response
export interface ApiErrorResponse {
error: string;
details?: any[];
}

// Auth state
export interface AuthState {
user: User | null;
accessToken: string | null;
refreshToken: string | null;
isLoading: boolean;
isAuthenticated: boolean;
}

---

4. Token Storage Service

File: src/services/storage/tokenStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@event_app_access_token';
const REFRESH_TOKEN_KEY = '@event_app_refresh_token';
const USER_KEY = '@event_app_user';

export const tokenStorage = {
// Save tokens
async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
try {
await AsyncStorage.multiSet([
[ACCESS_TOKEN_KEY, accessToken],
[REFRESH_TOKEN_KEY, refreshToken],
]);
} catch (error) {
console.error('Error saving tokens:', error);
throw error;
}
},

    // Get access token
    async getAccessToken(): Promise<string | null> {
      try {
        return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    },

    // Get refresh token
    async getRefreshToken(): Promise<string | null> {
      try {
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
      }
    },

    // Save user data
    async saveUser(user: User): Promise<void> {
      try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user:', error);
        throw error;
      }
    },

    // Get user data
    async getUser(): Promise<User | null> {
      try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error getting user:', error);
        return null;
      }
    },

    // Clear all auth data
    async clearAuthData(): Promise<void> {
      try {
        await AsyncStorage.multiRemove([
          ACCESS_TOKEN_KEY,
          REFRESH_TOKEN_KEY,
          USER_KEY,
        ]);
      } catch (error) {
        console.error('Error clearing auth data:', error);
        throw error;
      }
    },

};

---

5. API Client Setup

File: src/services/api/client.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';
import { API_BASE_URL } from '@env';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
baseURL: API_BASE_URL, // e.g., 'https://your-domain.com/api/v1'
timeout: 10000,
headers: {
'Content-Type': 'application/json',
},
});

// Request interceptor - Add access token to requests
apiClient.interceptors.request.use(
async (config) => {
const accessToken = await tokenStorage.getAccessToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }

);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
failedQueue.forEach((prom) => {
if (error) {
prom.reject(error);
} else {
prom.resolve(token);
}
});

    failedQueue = [];

};

apiClient.interceptors.response.use(
(response) => response,
async (error: AxiosError) => {
const originalRequest: any = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = await tokenStorage.getRefreshToken();

        if (!refreshToken) {
          // No refresh token, logout user
          await tokenStorage.clearAuthData();
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          // Call refresh token endpoint
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Save new tokens
          await tokenStorage.saveTokens(accessToken, newRefreshToken);

          // Update authorization header
          apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests
          processQueue(null, accessToken);

          isRefreshing = false;

          // Retry original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          processQueue(refreshError, null);
          await tokenStorage.clearAuthData();
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }

);

export default apiClient;

---

6. Authentication Service

File: src/services/api/auth.service.ts

import apiClient from './client';
import {
LoginRequest,
LoginResponse,
RefreshTokenRequest,
RefreshTokenResponse
} from '../../types/auth.types';

export const authService = {
/\*\*
_ Login with email and password
_ @param credentials - Email and password
_ @returns Login response with tokens and user data
_/
login: async (credentials: LoginRequest): Promise<LoginResponse> => {
const response = await apiClient.post<LoginResponse>(
'/auth/login',
credentials
);
return response.data;
},

    /**
     * Refresh access token using refresh token
     * @param refreshToken - Current refresh token
     * @returns New access and refresh tokens
     */
    refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
      const response = await apiClient.post<RefreshTokenResponse>(
        '/auth/refresh',
        data
      );
      return response.data;
    },

    /**
     * Logout user (client-side only, clear tokens)
     * Note: Backend doesn't have logout endpoint, tokens are removed locally
     */
    logout: async (): Promise<void> => {
      // Could call backend to invalidate refresh token if endpoint exists
      // For now, just clear local storage
      return Promise.resolve();
    },

};

---

7. Auth Context Provider

File: src/context/AuthContext.tsx

import React, {
createContext,
useContext,
useState,
useEffect,
ReactNode
} from 'react';
import { tokenStorage } from '../services/storage/tokenStorage';
import { authService } from '../services/api/auth.service';
import { User, LoginRequest, AuthState } from '../types/auth.types';

interface AuthContextType extends AuthState {
login: (credentials: LoginRequest) => Promise<void>;
logout: () => Promise<void>;
refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
const [state, setState] = useState<AuthState>({
user: null,
accessToken: null,
refreshToken: null,
isLoading: true,
isAuthenticated: false,
});

    // Load stored auth data on mount
    useEffect(() => {
      loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
      try {
        const [accessToken, refreshToken, user] = await Promise.all([
          tokenStorage.getAccessToken(),
          tokenStorage.getRefreshToken(),
          tokenStorage.getUser(),
        ]);

        if (accessToken && refreshToken && user) {
          setState({
            user,
            accessToken,
            refreshToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    const login = async (credentials: LoginRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const response = await authService.login(credentials);

        // Save tokens and user data
        await tokenStorage.saveTokens(
          response.accessToken,
          response.refreshToken
        );
        await tokenStorage.saveUser(response.user);

        setState({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }));
        throw error;
      }
    };

    const logout = async () => {
      try {
        await authService.logout();
        await tokenStorage.clearAuthData();

        setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          isAuthenticated: false,
        });
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    };

    const refreshAuth = async () => {
      await loadStoredAuth();
    };

    return (
      <AuthContext.Provider
        value={{
          ...state,
          login,
          logout,
          refreshAuth
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

---

8. Login Hook

File: src/hooks/useLogin.ts

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

interface UseLoginReturn {
login: (email: string, password: string) => Promise<void>;
isLoading: boolean;
error: string | null;
clearError: () => void;
}

export const useLogin = (): UseLoginReturn => {
const { login: authLogin } = useAuth();
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Basic validation
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        await authLogin({ email, password });
      } catch (err) {
        // Handle different error types
        if (err instanceof AxiosError) {
          const errorMessage = err.response?.data?.error || 'Login failed';

          // Handle specific error cases
          if (err.response?.status === 401) {
            setError('Invalid email or password');
          } else if (err.response?.status === 403) {
            setError('Please verify your email before logging in');
          } else if (err.response?.status === 429) {
            setError('Too many login attempts. Please try again later.');
          } else {
            setError(errorMessage);
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    const clearError = () => {
      setError(null);
    };

    return { login, isLoading, error, clearError };

};

---

9. Environment Configuration

File: .env

API_BASE_URL=https://your-domain.com/api/v1

File: types/env.d.ts

declare module '@env' {
export const API_BASE_URL: string;
}

---

10. Error Handler Utility

File: src/utils/errorHandler.ts

import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/auth.types';

export const getErrorMessage = (error: unknown): string => {
if (error instanceof AxiosError) {
const apiError = error.response?.data as ApiErrorResponse;

      // Return error message from API
      if (apiError?.error) {
        return apiError.error;
      }

      // Handle network errors
      if (error.message === 'Network Error') {
        return 'Network error. Please check your internet connection.';
      }

      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please try again.';
      }

      return error.message || 'An error occurred';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred';

};

---

11. Validation Utility

File: src/utils/validation.ts

export const validation = {
/\*\*
_ Validate email format
_/
isValidEmail: (email: string): boolean => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email);
},

    /**
     * Validate password strength
     * Must be at least 8 characters
     */
    isValidPassword: (password: string): boolean => {
      return password.length >= 8;
    },

    /**
     * Get email validation error message
     */
    getEmailError: (email: string): string | null => {
      if (!email) {
        return 'Email is required';
      }
      if (!validation.isValidEmail(email)) {
        return 'Invalid email address';
      }
      return null;
    },

    /**
     * Get password validation error message
     */
    getPasswordError: (password: string): string | null => {
      if (!password) {
        return 'Password is required';
      }
      if (!validation.isValidPassword(password)) {
        return 'Password must be at least 8 characters';
      }
      return null;
    },

};

---

12. Integration with Existing Login UI

Example Usage in Your Login Screen Component:

import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { useLogin } from '../hooks/useLogin';
import { validation } from '../utils/validation';

export const LoginScreen: React.FC = () => {
const { login, isLoading, error, clearError } = useLogin();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [emailError, setEmailError] = useState<string | null>(null);
const [passwordError, setPasswordError] = useState<string | null>(null);

    const handleLogin = async () => {
      // Clear previous errors
      clearError();
      setEmailError(null);
      setPasswordError(null);

      // Validate inputs
      const emailErr = validation.getEmailError(email);
      const passwordErr = validation.getPasswordError(password);

      if (emailErr || passwordErr) {
        setEmailError(emailErr);
        setPasswordError(passwordErr);
        return;
      }

      try {
        await login(email, password);
        // Navigation to home screen handled by auth state change
      } catch (err) {
        // Error is handled by useLogin hook
        console.error('Login failed:', err);
      }
    };

    return (
      <View>
        {/* Email Input */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        {emailError && <Text style={{ color: 'red' }}>{emailError}</Text>}

        {/* Password Input */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
        {passwordError && <Text style={{ color: 'red' }}>{passwordError}</Text>}

        {/* API Error */}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}

        {/* Login Button */}
        <Button
          title={isLoading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          disabled={isLoading}
        />

        {isLoading && <ActivityIndicator />}
      </View>
    );

};

---

13. App Setup

File: App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';

const AppNavigator = () => {
const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <LoadingScreen />;
    }

    return isAuthenticated ? <HomeScreen /> : <LoginScreen />;

};

const App = () => {
return (
<AuthProvider>
<NavigationContainer>
<AppNavigator />
</NavigationContainer>
</AuthProvider>
);
};

export default App;

---

14. Security Considerations

1. Token Storage: Uses AsyncStorage (secure on iOS, consider react-native-keychain for enhanced security)
1. Auto Token Refresh: Axios interceptor automatically refreshes expired tokens
1. Request Queue: Failed requests during token refresh are queued and retried
1. Error Handling: Comprehensive error handling with user-friendly messages
1. Input Validation: Client-side validation before API calls
1. Rate Limiting: Backend handles rate limiting (429 errors displayed to user)

---

15. Testing Checklist

- Successful login with valid credentials
- Error handling for invalid credentials (401)
- Error handling for unverified email (403)
- Error handling for rate limiting (429)
- Auto token refresh on 401 errors
- Token persistence across app restarts
- Logout functionality
- Network error handling
- Timeout error handling
- Form validation (email format, password length)

---

16. Next Steps

After implementing login, you can add:

1. Registration flow (/auth/register/start → /auth/register/verify)
2. Forgot password (/auth/password/forgot → /auth/password/reset)
3. Profile management
4. Event browsing
5. Event registration
