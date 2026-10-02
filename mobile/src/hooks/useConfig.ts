import { useState, useEffect } from 'react';
import { configService, AppConfig, FeatureFlag } from '@services/configService';

/**
 * Hook to get app configuration
 */
export const useAppConfig = (): AppConfig => {
  const [config, setConfig] = useState<AppConfig>(configService.getConfig());

  useEffect(() => {
    // Refresh config when component mounts
    const refreshConfig = async () => {
      try {
        await configService.refreshConfig();
        setConfig(configService.getConfig());
      } catch {
        // Silently fail, use cached/local config
      }
    };

    refreshConfig();
  }, []);

  return config;
};

/**
 * Hook to get specific config value
 * Example: const baseUrl = useConfigValue<string>('api.baseUrl');
 */
export const useConfigValue = <T>(path: string): T | undefined => {
  const [value, setValue] = useState<T | undefined>(
    configService.getConfigValue<T>(path),
  );

  useEffect(() => {
    const refreshValue = async () => {
      try {
        await configService.refreshConfig();
        setValue(configService.getConfigValue<T>(path));
      } catch {
        // Silently fail, use cached/local value
      }
    };

    refreshValue();
  }, [path]);

  return value;
};

/**
 * Hook to check if feature flag is enabled
 * Example: const showCarousel = useFeatureFlag('ENABLE_HOME_CAROUSEL');
 */
export const useFeatureFlag = (flagKey: string): boolean => {
  const [isEnabled, setIsEnabled] = useState<boolean>(
    configService.isFeatureEnabled(flagKey),
  );

  useEffect(() => {
    const refreshFlag = async () => {
      try {
        await configService.refreshConfig();
        setIsEnabled(configService.isFeatureEnabled(flagKey));
      } catch {
        // Silently fail, use cached/local flag
      }
    };

    refreshFlag();
  }, [flagKey]);

  return isEnabled;
};

/**
 * Hook to get feature flag details
 */
export const useFeatureFlagDetails = (flagKey: string): FeatureFlag | null => {
  const [flag, setFlag] = useState<FeatureFlag | null>(
    configService.getFeatureFlag(flagKey),
  );

  useEffect(() => {
    const refreshFlag = async () => {
      try {
        await configService.refreshConfig();
        setFlag(configService.getFeatureFlag(flagKey));
      } catch {
        // Silently fail, use cached/local flag
      }
    };

    refreshFlag();
  }, [flagKey]);

  return flag;
};

/**
 * Hook to get feature flag configuration
 * Example: const onboardingConfig = useFeatureFlagConfig<OnboardingConfig>('ENABLE_ONBOARDING');
 */
export const useFeatureFlagConfig = <T>(flagKey: string): T | null => {
  const [config, setConfig] = useState<T | null>(
    configService.getFeatureFlagConfig<T>(flagKey),
  );

  useEffect(() => {
    const refreshConfig = async () => {
      try {
        await configService.refreshConfig();
        setConfig(configService.getFeatureFlagConfig<T>(flagKey));
      } catch {
        // Silently fail, use cached/local config
      }
    };

    refreshConfig();
  }, [flagKey]);

  return config;
};

/**
 * Hook to get all feature flags
 */
export const useAllFeatureFlags = (): FeatureFlag[] => {
  const [flags, setFlags] = useState<FeatureFlag[]>(
    configService.getAllFeatureFlags(),
  );

  useEffect(() => {
    const refreshFlags = async () => {
      try {
        await configService.refreshConfig();
        setFlags(configService.getAllFeatureFlags());
      } catch {
        // Silently fail, use cached/local flags
      }
    };

    refreshFlags();
  }, []);

  return flags;
};
