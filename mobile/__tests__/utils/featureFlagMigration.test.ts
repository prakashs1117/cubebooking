/**
 * Feature Flag Migration Utility Tests
 */

import {
  migrateFeatureFlagKey,
  reverseFeatureFlagKey,
  isOldFormatKey,
  isNewFormatKey,
  FEATURE_FLAG_KEY_MAPPING,
  REVERSE_KEY_MAPPING,
} from '@utils/featureFlagMigration';

describe('FEATURE_FLAG_KEY_MAPPING', () => {
  it('contains expected mappings', () => {
    expect(FEATURE_FLAG_KEY_MAPPING.ENABLE_HOME_CAROUSEL).toBe(
      'home_carousel',
    );
    expect(FEATURE_FLAG_KEY_MAPPING.ENABLE_DARK_MODE).toBe('dark_mode');
    expect(FEATURE_FLAG_KEY_MAPPING.ENABLE_SOCIAL_LOGIN_GOOGLE).toBe(
      'social_login',
    );
  });
});

describe('REVERSE_KEY_MAPPING', () => {
  it('maps new key back to array of old keys', () => {
    expect(REVERSE_KEY_MAPPING.home_carousel).toContain(
      'ENABLE_HOME_CAROUSEL',
    );
  });

  it('groups multiple old keys to same new key', () => {
    // GOOGLE, APPLE, FACEBOOK all map to social_login
    expect(REVERSE_KEY_MAPPING.social_login.length).toBeGreaterThanOrEqual(
      3,
    );
  });
});

describe('migrateFeatureFlagKey', () => {
  it('maps known old key to new key', () => {
    expect(migrateFeatureFlagKey('ENABLE_HOME_CAROUSEL')).toBe('home_carousel');
  });

  it('maps unknown old key to lowercase version', () => {
    expect(migrateFeatureFlagKey('SOME_UNKNOWN_FLAG')).toBe(
      'some_unknown_flag',
    );
  });

  it('maps new-format key unchanged (already lowercase)', () => {
    expect(migrateFeatureFlagKey('dark_mode')).toBe('dark_mode');
  });
});

describe('reverseFeatureFlagKey', () => {
  it('maps known new key to first old key', () => {
    const result = reverseFeatureFlagKey('home_carousel');
    expect(result).toBe('ENABLE_HOME_CAROUSEL');
  });

  it('uppercases unknown new key', () => {
    const result = reverseFeatureFlagKey('some_new_flag');
    expect(result).toBe('SOME_NEW_FLAG');
  });
});

describe('isOldFormatKey', () => {
  it('returns true for uppercase key with ENABLE_', () => {
    expect(isOldFormatKey('ENABLE_HOME_CAROUSEL')).toBe(true);
    expect(isOldFormatKey('SHOW_DEBUG_INFO')).toBe(false); // no ENABLE_
    expect(isOldFormatKey('ENABLE_FAQ')).toBe(true);
  });

  it('returns false for lowercase keys', () => {
    expect(isOldFormatKey('home_carousel')).toBe(false);
    expect(isOldFormatKey('enable_faq')).toBe(false);
  });

  it('returns false for mixed case', () => {
    expect(isOldFormatKey('Enable_Home')).toBe(false);
  });
});

describe('isNewFormatKey', () => {
  it('returns true for lowercase key with underscore', () => {
    expect(isNewFormatKey('home_carousel')).toBe(true);
    expect(isNewFormatKey('dark_mode')).toBe(true);
  });

  it('returns false for uppercase key', () => {
    expect(isNewFormatKey('ENABLE_HOME_CAROUSEL')).toBe(false);
  });

  it('returns false for lowercase without underscore', () => {
    expect(isNewFormatKey('homeflag')).toBe(false);
  });
});
