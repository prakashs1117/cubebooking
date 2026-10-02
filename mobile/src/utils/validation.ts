/**
 * Validation Utilities
 * Functions for validating user input in authentication forms
 */

export const validation = {
  /**
   * Validate email format
   */
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
   * Validate strong password
   * Must contain at least 8 characters, one uppercase, one lowercase, one number
   */
  isStrongPassword: (password: string): boolean => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
  },

  /**
   * Validate username
   * Must be 3-20 characters, alphanumeric with underscores
   */
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  /**
   * Validate OTP code
   * Must be 6 digits
   */
  isValidOTP: (otp: string): boolean => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  },

  /**
   * Get email validation error message
   */
  getEmailError: (email: string): string | null => {
    if (!email) {
      return 'validation.emailRequired';
    }
    if (!validation.isValidEmail(email)) {
      return 'validation.emailInvalid';
    }
    return null;
  },

  /**
   * Get password validation error message
   */
  getPasswordError: (
    password: string,
    requireStrong = false,
  ): string | null => {
    if (!password) {
      return 'validation.passwordRequired';
    }
    if (requireStrong) {
      if (!validation.isStrongPassword(password)) {
        return 'validation.passwordWeak';
      }
    } else {
      if (!validation.isValidPassword(password)) {
        return 'validation.passwordTooShort';
      }
    }
    return null;
  },

  /**
   * Get password confirmation error message
   */
  getPasswordConfirmError: (
    password: string,
    confirmPassword: string,
  ): string | null => {
    if (!confirmPassword) {
      return 'validation.passwordConfirmRequired';
    }
    if (password !== confirmPassword) {
      return 'validation.passwordMismatch';
    }
    return null;
  },

  /**
   * Get username validation error message
   */
  getUsernameError: (username: string): string | null => {
    if (!username) {
      return 'validation.usernameRequired';
    }
    if (!validation.isValidUsername(username)) {
      return 'validation.usernameInvalid';
    }
    return null;
  },

  /**
   * Get OTP validation error message
   */
  getOTPError: (otp: string): string | null => {
    if (!otp) {
      return 'validation.otpRequired';
    }
    if (!validation.isValidOTP(otp)) {
      return 'validation.otpInvalid';
    }
    return null;
  },
};
