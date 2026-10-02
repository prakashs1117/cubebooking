/**
 * Centralized Configuration
 * Combines environment variables with app configuration
 */

import {
  API_BASE_URL,
  ATLAS_BASE_URL,
  ATLAS_APP_KEY,
  ATLAS_IDENTIFIER,
  API_TIMEOUT,
  NODE_ENV,
} from '@env';
import appConfigJson from './appConfig.json';

/**
 * API Configuration from environment variables
 */
export const apiConfig = {
  baseUrl: API_BASE_URL || 'http://192.168.0.167:8000/api/v1',
  // Atlas API — SDS / chemical data (HMAC token auth, no /api/v1 prefix)
  atlasBaseUrl: ATLAS_BASE_URL || 'https://atlasdev.mymsafety.de/api',
  atlasHmacUrl: (ATLAS_BASE_URL || 'https://atlasdev.mymsafety.de/api').replace(
    '/api',
    '/v1/getHmacToken',
  ),
  atlasAppKey: ATLAS_APP_KEY || '441c8fdb2acab27405bf4d9c96a535fc',
  atlasIdentifier: ATLAS_IDENTIFIER || '0cxTYJ9Ayo',
  timeout: parseInt(API_TIMEOUT || '30000', 10),
  retryAttempts: appConfigJson.api.retryAttempts,
  featureFlagsEndpoint: appConfigJson.api.featureFlagsEndpoint,
  configEndpoint: appConfigJson.api.configEndpoint,
} as const;

/**
 * Environment Configuration
 */
export const envConfig = {
  nodeEnv: NODE_ENV || 'development',
  isDevelopment: (NODE_ENV || 'development') === 'development',
  isProduction: (NODE_ENV || 'development') === 'production',
} as const;

/**
 * Full App Configuration
 * Merges all configuration sources
 */
export const config = {
  app: appConfigJson.app,
  api: apiConfig,
  env: envConfig,
  localization: appConfigJson.localization,
  theme: appConfigJson.theme,
  storage: appConfigJson.storage,
  network: appConfigJson.network,
  analytics: appConfigJson.analytics,
  notifications: appConfigJson.notifications,
  security: appConfigJson.security,
  performance: appConfigJson.performance,
} as const;

export default config;
