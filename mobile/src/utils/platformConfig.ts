const defaultPlatformConfig = require('../../config/eva/platformconfig.json');

export interface PlatformFeatures {
  LIVE: boolean;
  DISCOVER: boolean;
  FIRST_LAUNCH: boolean;
  SOCIAL_LOGIN_GOOGLE: boolean;
  SOCIAL_LOGIN_APPLE: boolean;
  SOCIAL_LOGIN_FACEBOOK: boolean;
}

export interface PlatformUI {
  headerType: 'type1' | 'type2' | 'type3';
}

export interface OnboardingConfig {
  enabled: boolean;
  showOnFirstLaunchOnly: boolean;
  skipEnabled: boolean;
  autoPlayEnabled: boolean;
}

export interface PlatformConfig {
  baseUrl: string;
  bbcNewsUrl: string;
  API_KEY: string;
  news: {
    country: {
      india: string;
      unitedstates: string;
    };
  };
  deviceType: {
    ios: string;
    android: string;
    androidhevc: string;
    ioshevc: string;
  };
  locale: string;
  provider: string;
  defaultLanguage: string;
  audioLanguage: string;
  features: PlatformFeatures;
  ui: PlatformUI;
  onboarding: OnboardingConfig;
}

// Holds the live config — starts as the local default, replaced when backend responds.
let runtimeConfig: PlatformConfig = defaultPlatformConfig as PlatformConfig;

/**
 * Called once backend returns platform config.
 * Deep-merges so partial responses don't wipe unrelated fields.
 */
export const setPlatformConfig = (remoteConfig: Partial<PlatformConfig>): void => {
  runtimeConfig = {
    ...runtimeConfig,
    ...remoteConfig,
    features: { ...runtimeConfig.features, ...remoteConfig.features },
    ui: { ...runtimeConfig.ui, ...remoteConfig.ui },
    onboarding: { ...runtimeConfig.onboarding, ...remoteConfig.onboarding },
  };
};

/**
 * Get platform configuration — returns local defaults until backend data arrives.
 */
export const getPlatformConfig = (): PlatformConfig => {
  return runtimeConfig;
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (
  featureName: keyof PlatformFeatures,
): boolean => {
  return runtimeConfig.features[featureName] || false;
};

/**
 * Check if social login is enabled for a specific provider
 */
export const isSocialLoginEnabled = (
  provider: 'google' | 'apple' | 'facebook',
): boolean => {
  const featureMap = {
    google: 'SOCIAL_LOGIN_GOOGLE',
    apple: 'SOCIAL_LOGIN_APPLE',
    facebook: 'SOCIAL_LOGIN_FACEBOOK',
  };

  return isFeatureEnabled(featureMap[provider] as keyof PlatformFeatures);
};

/**
 * Get the configured header type
 */
export const getHeaderType = (): 'type1' | 'type2' | 'type3' => {
  return runtimeConfig.ui?.headerType || 'type3';
};

/**
 * Get onboarding configuration
 */
export const getOnboardingConfig = (): OnboardingConfig => {
  return (
    runtimeConfig.onboarding || {
      enabled: true,
      showOnFirstLaunchOnly: true,
      skipEnabled: true,
      autoPlayEnabled: false,
    }
  );
};

/**
 * Check if onboarding is enabled
 */
export const isOnboardingEnabled = (): boolean => {
  return runtimeConfig.onboarding?.enabled !== false;
};

export default getPlatformConfig;
