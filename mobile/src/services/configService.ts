import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '@config/appConfig.json';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import { apiConfig } from '@config/index';
import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';
import { setPlatformConfig, PlatformConfig } from '@utils/platformConfig';

// Type definitions
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    buildNumber: string;
  };
  api: {
    note?: string;
    baseUrl?: string;
    timeout?: number;
    retryAttempts: number;
    featureFlagsEndpoint: string;
    configEndpoint: string;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    fallbackLanguage: string;
    rtlLanguages: string[];
    autoDetectLanguage: boolean;
    persistLanguageChoice: boolean;
  };
  theme: {
    defaultMode: 'light' | 'dark';
    followSystemTheme: boolean;
    allowUserToggle: boolean;
  };
  storage: {
    keys: {
      language: string;
      theme: string;
      onboarding: string;
      featureFlags: string;
      config: string;
    };
    cacheDuration: {
      featureFlags: number;
      appConfig: number;
    };
  };
  network: {
    enableOfflineMode: boolean;
    retryOnFailure: boolean;
    showNetworkStatus: boolean;
    cacheStrategy: 'cache-first' | 'network-first' | 'network-only';
  };
  analytics: {
    enabled: boolean;
    providers: {
      firebase: boolean;
      mixpanel: boolean;
      amplitude: boolean;
    };
    trackScreenViews: boolean;
    trackUserActions: boolean;
  };
  notifications: {
    enabled: boolean;
    providers: {
      firebase: boolean;
      onesignal: boolean;
    };
    showBadge: boolean;
    soundEnabled: boolean;
  };
  security: {
    enableBiometric: boolean;
    requirePinCode: boolean;
    sessionTimeout: number;
    autoLogout: boolean;
  };
  performance: {
    enableCodePush: boolean;
    enableCrashReporting: boolean;
    enablePerformanceMonitoring: boolean;
  };
}

export interface FeatureFlagTargeting {
  rolloutPercentage: number;
  environments: string[];
  userSegments?: string[];
}

export interface FeatureFlagMetadata {
  tags: string[];
  owner: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category:
    | 'ui'
    | 'feature'
    | 'social'
    | 'analytics'
    | 'experimental'
    | 'debug';
  type: 'boolean' | 'string' | 'number' | 'json';
  enabled: boolean;
  defaultValue: any;
  targeting: FeatureFlagTargeting;
  config?: Record<string, any>;
  metadata: FeatureFlagMetadata;
}

export interface FeatureFlagsConfig {
  flags: FeatureFlag[];
  version?: string;
  lastUpdated?: string;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

/**
 * Configuration Service
 * Manages app configuration with support for local JSON and remote API sources
 */
class ConfigService {
  private static instance: ConfigService;
  private localConfig: AppConfig = appConfig as AppConfig;
  private remoteConfig: AppConfig | null = null;
  private useRemoteConfig: boolean = false;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Initialize configuration service
   * Loads cached remote config if available
   */
  async initialize(): Promise<void> {
    try {
      await this.loadCachedRemoteConfig();
      if (this.localConfig.network.enableOfflineMode) {
        this.fetchRemoteConfigInBackground();
      }
      // Fire-and-forget — keeps local defaults until backend responds
      this.syncPlatformConfig().catch(() => {});
    } catch (error) {
      console.error('❌ Error initializing config service:', error);
    }
  }

  /**
   * Get app configuration
   * Returns remote config if available, otherwise local config
   */
  getConfig(): AppConfig {
    if (this.useRemoteConfig && this.remoteConfig) {
      return this.remoteConfig;
    }
    return this.localConfig;
  }

  /**
   * Get specific configuration value by path
   * Example: getConfigValue('api.baseUrl')
   */
  getConfigValue<T>(path: string): T | undefined {
    const config = this.getConfig();
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value as T;
  }

  /**
   * Check if feature flag is enabled — delegates to the Zustand store which
   * holds the backend-synced flags.
   */
  isFeatureEnabled(flagKey: string): boolean {
    return useFeatureFlagsStore.getState().isFeatureEnabled(flagKey);
  }

  getFeatureFlag(flagKey: string): FeatureFlag | null {
    return useFeatureFlagsStore.getState().getFeatureFlag(flagKey);
  }

  getFeatureFlagConfig<T>(flagKey: string): T | null {
    const flag = this.getFeatureFlag(flagKey);
    return (flag?.config as T) ?? null;
  }

  getAllFeatureFlags(): FeatureFlag[] {
    return useFeatureFlagsStore.getState().getAllFeatureFlags();
  }

  getFeatureFlagsByCategory(category: string): FeatureFlag[] {
    return useFeatureFlagsStore.getState().getFeatureFlagsByCategory(category as any);
  }

  /**
   * Fetch remote configuration from API
   */
  private async fetchRemoteConfigInBackground(): Promise<void> {
    try {
      setTimeout(async () => {
        await this.fetchRemoteConfig();
      }, 1000);
    } catch (error) {
      console.error('❌ Error fetching remote config:', error);
    }
  }

  /**
   * Fetch remote app configuration
   */
  async fetchRemoteConfig(): Promise<AppConfig | null> {
    try {
      // Get baseUrl from config or fallback to centralized config
      const baseUrl = this.localConfig.api.baseUrl || apiConfig.baseUrl;
      const timeout = this.localConfig.api.timeout || 30000;

      const url = `${baseUrl}${this.localConfig.api.configEndpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: timeout,
      } as any);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.remoteConfig = data;
      this.useRemoteConfig = true;

      // Cache the remote config
      await this.cacheRemoteConfig(data);

      console.log('✅ Remote config fetched successfully');
      return data;
    } catch (error) {
      console.log('ℹ️  Using local config (remote fetch failed):', error);
      return null;
    }
  }


  /**
   * Cache remote configuration
   */
  private async cacheRemoteConfig(config: AppConfig): Promise<void> {
    try {
      const cacheData: CacheData<AppConfig> = {
        data: config,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        this.localConfig.storage.keys.config,
        JSON.stringify(cacheData),
      );
    } catch (error) {
      console.error('❌ Error caching remote config:', error);
    }
  }


  /**
   * Load cached remote configuration
   */
  private async loadCachedRemoteConfig(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(
        this.localConfig.storage.keys.config,
      );
      if (!cached) return;

      const cacheData: CacheData<AppConfig> = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      if (age < this.localConfig.storage.cacheDuration.appConfig) {
        this.remoteConfig = cacheData.data;
        this.useRemoteConfig = true;
        console.log('✅ Loaded cached remote config');
      } else {
        console.log('ℹ️  Cached remote config expired');
      }
    } catch (error) {
      console.error('❌ Error loading cached remote config:', error);
    }
  }


  /**
   * Force refresh configuration from remote
   */
  async refreshConfig(): Promise<void> {
    await this.fetchRemoteConfig();
    await useFeatureFlagsStore.getState().syncFromBackend();
  }

  /**
   * Clear cached configuration
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.localConfig.storage.keys.config);
      await AsyncStorage.removeItem(this.localConfig.storage.keys.featureFlags);
      this.remoteConfig = null;
      this.remoteFeatureFlags = null;
      this.useRemoteConfig = false;
      console.log('✅ Configuration cache cleared');
    } catch (error) {
      console.error('❌ Error clearing config cache:', error);
    }
  }

  /**
   * Fetch platform config from the backend and apply it.
   * Falls back silently to the local default (platformconfig.json) on failure.
   */
  async syncPlatformConfig(): Promise<void> {
    try {
      const response = await apiClient.get<Partial<PlatformConfig>>(
        ENDPOINTS.PLATFORM_CONFIG.GET,
      );
      if (response.data && typeof response.data === 'object') {
        setPlatformConfig(response.data);
      }
    } catch {
      // Keep local defaults — backend not ready yet
    }
  }

  /**
   * Override feature flag (for testing)
   */
  async overrideFeatureFlag(flagKey: string, enabled: boolean): Promise<void> {
    try {
      const overridesKey = '@app_feature_flag_overrides';
      const existingOverrides = await AsyncStorage.getItem(overridesKey);
      const overrides = existingOverrides ? JSON.parse(existingOverrides) : {};

      overrides[flagKey] = enabled;
      await AsyncStorage.setItem(overridesKey, JSON.stringify(overrides));

      console.log(`✅ Feature flag ${flagKey} overridden to ${enabled}`);
    } catch (error) {
      console.error('❌ Error overriding feature flag:', error);
    }
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();
export default configService;
