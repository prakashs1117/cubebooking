/**
 * Platform Config Utility Tests
 * Tests for config accessors, feature flags, and social login helpers
 */

// Mock the JSON config before importing utilities
jest.mock('../../config/eva/platformconfig.json', () => ({
  baseUrl: 'https://api.example.com',
  bbcNewsUrl: 'https://news.example.com',
  API_KEY: 'test-key-123',
  news: {
    country: { india: 'in', unitedstates: 'us' },
  },
  deviceType: {
    ios: 'ios',
    android: 'android',
    androidhevc: 'android-hevc',
    ioshevc: 'ios-hevc',
  },
  locale: 'en-US',
  provider: 'test-provider',
  defaultLanguage: 'en',
  audioLanguage: 'en',
  features: {
    LIVE: true,
    DISCOVER: false,
    FIRST_LAUNCH: true,
    SOCIAL_LOGIN_GOOGLE: true,
    SOCIAL_LOGIN_APPLE: false,
    SOCIAL_LOGIN_FACEBOOK: true,
  },
  ui: {
    headerType: 'type2',
  },
  onboarding: {
    enabled: true,
    showOnFirstLaunchOnly: true,
    skipEnabled: false,
    autoPlayEnabled: true,
  },
}));

import {
  getPlatformConfig,
  isFeatureEnabled,
  isSocialLoginEnabled,
  getHeaderType,
  getOnboardingConfig,
  isOnboardingEnabled,
} from '@utils/platformConfig';

describe('getPlatformConfig', () => {
  it('returns the full platform config object', () => {
    const config = getPlatformConfig();
    expect(config).toBeDefined();
    expect(config.baseUrl).toBe('https://api.example.com');
    expect(config.defaultLanguage).toBe('en');
  });
});

describe('isFeatureEnabled', () => {
  it('returns true for an enabled feature', () => {
    expect(isFeatureEnabled('LIVE')).toBe(true);
  });

  it('returns false for a disabled feature', () => {
    expect(isFeatureEnabled('DISCOVER')).toBe(false);
  });

  it('returns true for FIRST_LAUNCH feature', () => {
    expect(isFeatureEnabled('FIRST_LAUNCH')).toBe(true);
  });
});

describe('isSocialLoginEnabled', () => {
  it('returns true for Google (enabled)', () => {
    expect(isSocialLoginEnabled('google')).toBe(true);
  });

  it('returns false for Apple (disabled)', () => {
    expect(isSocialLoginEnabled('apple')).toBe(false);
  });

  it('returns true for Facebook (enabled)', () => {
    expect(isSocialLoginEnabled('facebook')).toBe(true);
  });
});

describe('getHeaderType', () => {
  it('returns the configured header type', () => {
    expect(getHeaderType()).toBe('type2');
  });
});

describe('getOnboardingConfig', () => {
  it('returns the onboarding configuration', () => {
    const config = getOnboardingConfig();
    expect(config.enabled).toBe(true);
    expect(config.showOnFirstLaunchOnly).toBe(true);
    expect(config.skipEnabled).toBe(false);
    expect(config.autoPlayEnabled).toBe(true);
  });
});

describe('isOnboardingEnabled', () => {
  it('returns true when onboarding.enabled is true', () => {
    expect(isOnboardingEnabled()).toBe(true);
  });
});

// ── Edge-case: missing ui / onboarding ───────────────────────────────────────

describe('getHeaderType fallback', () => {
  it('falls back to type3 when headerType is not set', () => {
    jest.resetModules();

    jest.mock('../../config/eva/platformconfig.json', () => ({
      features: {},
      // ui intentionally missing
    }));

    // Re-require after reset
    const {
      getHeaderType: freshGetHeaderType,
    } = require('@utils/platformConfig');
    expect(freshGetHeaderType()).toBe('type3');
  });
});

describe('getOnboardingConfig fallback', () => {
  it('returns default config when onboarding key is missing', () => {
    jest.resetModules();

    jest.mock('../../config/eva/platformconfig.json', () => ({
      features: {},
      // onboarding intentionally missing
    }));

    const {
      getOnboardingConfig: freshGetOnboardingConfig,
    } = require('@utils/platformConfig');
    const config = freshGetOnboardingConfig();

    expect(config).toEqual({
      enabled: true,
      showOnFirstLaunchOnly: true,
      skipEnabled: true,
      autoPlayEnabled: false,
    });
  });
});
