/**
 * Validation Utility Tests
 * Full branch coverage for all validation rules and error messages
 */

import { validation } from '@utils/validation';

describe('validation', () => {
  // ── isValidEmail ────────────────────────────────────────────────────────────

  describe('isValidEmail', () => {
    it('returns true for a valid email', () => {
      expect(validation.isValidEmail('user@example.com')).toBe(true);
    });

    it('returns true for email with subdomain', () => {
      expect(validation.isValidEmail('user@mail.example.com')).toBe(true);
    });

    it('returns false for email missing @', () => {
      expect(validation.isValidEmail('userexample.com')).toBe(false);
    });

    it('returns false for email missing domain', () => {
      expect(validation.isValidEmail('user@')).toBe(false);
    });

    it('returns false for email missing TLD', () => {
      expect(validation.isValidEmail('user@example')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(validation.isValidEmail('')).toBe(false);
    });

    it('returns false for string with spaces', () => {
      expect(validation.isValidEmail('user @example.com')).toBe(false);
    });
  });

  // ── isValidPassword ─────────────────────────────────────────────────────────

  describe('isValidPassword', () => {
    it('returns true for password with 8 characters', () => {
      expect(validation.isValidPassword('12345678')).toBe(true);
    });

    it('returns true for password longer than 8 characters', () => {
      expect(validation.isValidPassword('mySecurePassword!')).toBe(true);
    });

    it('returns false for password shorter than 8 characters', () => {
      expect(validation.isValidPassword('short')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(validation.isValidPassword('')).toBe(false);
    });
  });

  // ── isStrongPassword ────────────────────────────────────────────────────────

  describe('isStrongPassword', () => {
    it('returns true for password with upper, lower, and digit', () => {
      expect(validation.isStrongPassword('Password1')).toBe(true);
    });

    it('returns false for password without uppercase', () => {
      expect(validation.isStrongPassword('password1')).toBe(false);
    });

    it('returns false for password without lowercase', () => {
      expect(validation.isStrongPassword('PASSWORD1')).toBe(false);
    });

    it('returns false for password without digit', () => {
      expect(validation.isStrongPassword('PasswordABC')).toBe(false);
    });

    it('returns false for password shorter than 8 chars with all requirements', () => {
      expect(validation.isStrongPassword('Pas1')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(validation.isStrongPassword('')).toBe(false);
    });
  });

  // ── isValidUsername ─────────────────────────────────────────────────────────

  describe('isValidUsername', () => {
    it('returns true for valid alphanumeric username', () => {
      expect(validation.isValidUsername('user123')).toBe(true);
    });

    it('returns true for username with underscores', () => {
      expect(validation.isValidUsername('user_name')).toBe(true);
    });

    it('returns true for minimum length (3 chars)', () => {
      expect(validation.isValidUsername('abc')).toBe(true);
    });

    it('returns true for maximum length (20 chars)', () => {
      expect(validation.isValidUsername('a'.repeat(20))).toBe(true);
    });

    it('returns false for username shorter than 3 chars', () => {
      expect(validation.isValidUsername('ab')).toBe(false);
    });

    it('returns false for username longer than 20 chars', () => {
      expect(validation.isValidUsername('a'.repeat(21))).toBe(false);
    });

    it('returns false for username with spaces', () => {
      expect(validation.isValidUsername('user name')).toBe(false);
    });

    it('returns false for username with special characters', () => {
      expect(validation.isValidUsername('user@name')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(validation.isValidUsername('')).toBe(false);
    });
  });

  // ── isValidOTP ──────────────────────────────────────────────────────────────

  describe('isValidOTP', () => {
    it('returns true for 6-digit OTP', () => {
      expect(validation.isValidOTP('123456')).toBe(true);
    });

    it('returns false for OTP shorter than 6 digits', () => {
      expect(validation.isValidOTP('12345')).toBe(false);
    });

    it('returns false for OTP longer than 6 digits', () => {
      expect(validation.isValidOTP('1234567')).toBe(false);
    });

    it('returns false for OTP with letters', () => {
      expect(validation.isValidOTP('12345a')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(validation.isValidOTP('')).toBe(false);
    });
  });

  // ── getEmailError ───────────────────────────────────────────────────────────

  describe('getEmailError', () => {
    it('returns null for valid email', () => {
      expect(validation.getEmailError('user@example.com')).toBeNull();
    });

    it('returns required error for empty string', () => {
      expect(validation.getEmailError('')).toBe('Email is required');
    });

    it('returns invalid format error for malformed email', () => {
      expect(validation.getEmailError('notanemail')).toBe(
        'Invalid email address',
      );
    });
  });

  // ── getPasswordError ────────────────────────────────────────────────────────

  describe('getPasswordError', () => {
    it('returns null for valid password (basic check)', () => {
      expect(validation.getPasswordError('12345678')).toBeNull();
    });

    it('returns null for strong password when requireStrong=true', () => {
      expect(validation.getPasswordError('Password1', true)).toBeNull();
    });

    it('returns required error for empty password', () => {
      expect(validation.getPasswordError('')).toBe('Password is required');
    });

    it('returns length error for short password (basic check)', () => {
      expect(validation.getPasswordError('short')).toBe(
        'Password must be at least 8 characters',
      );
    });

    it('returns strong password error when requireStrong=true and password is weak', () => {
      expect(validation.getPasswordError('weakpass', true)).toBe(
        'Password must be at least 8 characters and contain uppercase, lowercase, and number',
      );
    });

    it('returns required error even when requireStrong=true', () => {
      expect(validation.getPasswordError('', true)).toBe(
        'Password is required',
      );
    });
  });

  // ── getPasswordConfirmError ─────────────────────────────────────────────────

  describe('getPasswordConfirmError', () => {
    it('returns null when passwords match', () => {
      expect(
        validation.getPasswordConfirmError('Password1', 'Password1'),
      ).toBeNull();
    });

    it('returns confirm required error when confirmPassword is empty', () => {
      expect(validation.getPasswordConfirmError('Password1', '')).toBe(
        'Please confirm your password',
      );
    });

    it('returns mismatch error when passwords differ', () => {
      expect(validation.getPasswordConfirmError('Password1', 'Password2')).toBe(
        'Passwords do not match',
      );
    });
  });

  // ── getUsernameError ────────────────────────────────────────────────────────

  describe('getUsernameError', () => {
    it('returns null for valid username', () => {
      expect(validation.getUsernameError('john_doe')).toBeNull();
    });

    it('returns required error for empty username', () => {
      expect(validation.getUsernameError('')).toBe('Username is required');
    });

    it('returns format error for invalid username', () => {
      expect(validation.getUsernameError('ab')).toBe(
        'Username must be 3-20 characters, alphanumeric with underscores',
      );
    });
  });

  // ── getOTPError ─────────────────────────────────────────────────────────────

  describe('getOTPError', () => {
    it('returns null for valid OTP', () => {
      expect(validation.getOTPError('123456')).toBeNull();
    });

    it('returns required error for empty OTP', () => {
      expect(validation.getOTPError('')).toBe('OTP code is required');
    });

    it('returns format error for invalid OTP', () => {
      expect(validation.getOTPError('abc')).toBe('OTP must be 6 digits');
    });
  });
});
