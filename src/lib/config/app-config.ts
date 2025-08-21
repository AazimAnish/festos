/**
 * Application Configuration
 * 
 * This file contains all application configuration following clean code principles.
 * Environment variables and configuration are centralized here for better maintainability.
 */

import { BLOCKCHAIN_CONFIG } from '@/lib/constants';

/**
 * Environment configuration
 */
export const env = {
  // Next.js environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',

  // Application
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Festos',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Filebase
  FILEBASE_ACCESS_KEY_ID: process.env.FILEBASE_ACCESS_KEY_ID,
  FILEBASE_SECRET_ACCESS_KEY: process.env.FILEBASE_SECRET_ACCESS_KEY,
  FILEBASE_BUCKET: process.env.FILEBASE_BUCKET,
  FILEBASE_ENDPOINT: process.env.FILEBASE_ENDPOINT || 'https://s3.filebase.com',
  FILEBASE_REGION: process.env.FILEBASE_REGION || 'us-east-1',

  // Blockchain
  AVALANCHE_RPC_URL: process.env.AVALANCHE_RPC_URL,
  AVALANCHE_TESTNET_RPC_URL: process.env.AVALANCHE_TESTNET_RPC_URL,
  EVENT_FACTORY_ADDRESS: process.env.EVENT_FACTORY_ADDRESS,
  EVENT_FACTORY_TESTNET_ADDRESS: process.env.EVENT_FACTORY_TESTNET_ADDRESS,

  // Analytics
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,
  MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,

  // External APIs
  MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Feature flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_SENTRY: process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true',
  ENABLE_MAPBOX: process.env.NEXT_PUBLIC_ENABLE_MAPBOX === 'true',
} as const;

/**
 * Application configuration
 */
export const appConfig = {
  // General
  name: env.APP_NAME,
  version: env.APP_VERSION,
  url: env.APP_URL,
  environment: env.NODE_ENV,

  // Database
  database: {
    enabled: !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // File storage
  fileStorage: {
    enabled: !!(env.FILEBASE_ACCESS_KEY_ID && env.FILEBASE_SECRET_ACCESS_KEY && env.FILEBASE_BUCKET),
    provider: 'filebase',
    accessKeyId: env.FILEBASE_ACCESS_KEY_ID,
    secretAccessKey: env.FILEBASE_SECRET_ACCESS_KEY,
    bucket: env.FILEBASE_BUCKET,
    endpoint: env.FILEBASE_ENDPOINT,
    region: env.FILEBASE_REGION,
  },

  // Blockchain
  blockchain: {
    enabled: !!(env.AVALANCHE_RPC_URL || env.AVALANCHE_TESTNET_RPC_URL),
    avalanche: {
      mainnet: {
        rpcUrl: env.AVALANCHE_RPC_URL,
        chainId: BLOCKCHAIN_CONFIG.AVALANCHE_MAINNET,
        factoryAddress: env.EVENT_FACTORY_ADDRESS,
      },
      testnet: {
        rpcUrl: env.AVALANCHE_TESTNET_RPC_URL,
        chainId: BLOCKCHAIN_CONFIG.AVALANCHE_TESTNET,
        factoryAddress: env.EVENT_FACTORY_TESTNET_ADDRESS,
      },
    },
  },

  // Analytics
  analytics: {
    enabled: env.ENABLE_ANALYTICS,
    googleAnalytics: {
      enabled: !!env.GOOGLE_ANALYTICS_ID,
      id: env.GOOGLE_ANALYTICS_ID,
    },
    mixpanel: {
      enabled: !!env.MIXPANEL_TOKEN,
      token: env.MIXPANEL_TOKEN,
    },
  },

  // Monitoring
  monitoring: {
    sentry: {
      enabled: env.ENABLE_SENTRY,
      dsn: env.SENTRY_DSN,
    },
  },

  // Maps
  maps: {
    mapbox: {
      enabled: env.ENABLE_MAPBOX && !!env.MAPBOX_ACCESS_TOKEN,
      accessToken: env.MAPBOX_ACCESS_TOKEN,
    },
  },

  // Feature flags
  features: {
    analytics: env.ENABLE_ANALYTICS,
    sentry: env.ENABLE_SENTRY,
    mapbox: env.ENABLE_MAPBOX,
  },
} as const;

/**
 * Validate required configuration
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required environment variables
  if (!env.SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!env.SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  // Optional but recommended
  if (!env.FILEBASE_ACCESS_KEY_ID) {
    console.warn('FILEBASE_ACCESS_KEY_ID not set - file storage will be disabled');
  }

  if (!env.FILEBASE_SECRET_ACCESS_KEY) {
    console.warn('FILEBASE_SECRET_ACCESS_KEY not set - file storage will be disabled');
  }

  if (!env.FILEBASE_BUCKET) {
    console.warn('FILEBASE_BUCKET not set - file storage will be disabled');
  }

  if (!env.AVALANCHE_RPC_URL && !env.AVALANCHE_TESTNET_RPC_URL) {
    console.warn('No Avalanche RPC URL set - blockchain features will be disabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get configuration for current environment
 */
export function getEnvironmentConfig() {
  const config = validateConfig();
  
  if (!config.isValid) {
    console.error('Configuration validation failed:', config.errors);
  }

  return {
    ...appConfig,
    validation: config,
  };
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof appConfig.features): boolean {
  return appConfig.features[feature];
}

/**
 * Check if database is available
 */
export function isDatabaseAvailable(): boolean {
  return appConfig.database.enabled;
}

/**
 * Check if file storage is available
 */
export function isFileStorageAvailable(): boolean {
  return appConfig.fileStorage.enabled;
}

/**
 * Check if blockchain is available
 */
export function isBlockchainAvailable(): boolean {
  return appConfig.blockchain.enabled;
}

/**
 * Get blockchain configuration for specified network
 */
export function getBlockchainConfig(network: 'mainnet' | 'testnet') {
  return appConfig.blockchain.avalanche[network];
}

/**
 * Get current blockchain configuration based on environment
 */
export function getCurrentBlockchainConfig() {
  return env.IS_PRODUCTION 
    ? getBlockchainConfig('mainnet')
    : getBlockchainConfig('testnet');
}
