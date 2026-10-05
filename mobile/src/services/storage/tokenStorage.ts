/**
 * Token Storage Service
 * Manages secure storage of authentication tokens and user data using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/auth.types';

const ACCESS_TOKEN_KEY = '@event_app_access_token';
const REFRESH_TOKEN_KEY = '@event_app_refresh_token';
const USER_KEY = '@event_app_user';
const GUEST_MODE_KEY = '@event_app_guest_mode';

export const tokenStorage = {
  /**
   * Save access and refresh tokens
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setMany({
        [ACCESS_TOKEN_KEY]: accessToken,
        [REFRESH_TOKEN_KEY]: refreshToken,
      });
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Save user data
   */
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  /**
   * Get user data
   */
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async saveGuestMode(isGuest: boolean): Promise<void> {
    try {
      if (isGuest) {
        await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      } else {
        await AsyncStorage.removeItem(GUEST_MODE_KEY);
      }
    } catch (error) {
      console.error('Error saving guest mode:', error);
    }
  },

  async getGuestMode(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(GUEST_MODE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error getting guest mode:', error);
      return false;
    }
  },

  /**
   * Clear all auth data (logout)
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeMany([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
        GUEST_MODE_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated (has tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);
      return !!accessToken && !!refreshToken;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
};
