import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_LOGIN_EMAIL_KEY = '@event_app_last_login_email';

/**
 * Service for persisting the last-used email address
 * Allows auto-filling email fields in auth screens (SignIn, ForgotPassword)
 */
export const emailStorage = {
  /**
   * Save the last login email to local storage
   */
  async saveLastLoginEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_LOGIN_EMAIL_KEY, email.trim());
    } catch (error) {
      console.error('Error saving last login email:', error);
    }
  },

  /**
   * Retrieve the last login email from local storage
   */
  async getLastLoginEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_LOGIN_EMAIL_KEY);
    } catch (error) {
      console.error('Error getting last login email:', error);
      return null;
    }
  },

  /**
   * Clear the saved email (e.g., on user logout)
   */
  async clearLastLoginEmail(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAST_LOGIN_EMAIL_KEY);
    } catch (error) {
      console.error('Error clearing last login email:', error);
    }
  },
};
