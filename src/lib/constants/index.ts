/**
 * Application Constants
 *
 * This file contains all application-wide constants organized by category.
 * Following clean code principles, all magic numbers and strings are defined here.
 */

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Event Configuration
export const EVENT_CONFIG = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_LOCATION_LENGTH: 200,
  MAX_CAPACITY: 100000,
  MIN_TICKET_PRICE: '0',
  MAX_TICKET_PRICE: '1000',
  DEFAULT_TIMEZONE: 'UTC',
  SLUG_SEPARATOR: '-',
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  AVALANCHE_MAINNET: 43114,
  AVALANCHE_TESTNET: 43113,
  DEFAULT_GAS_LIMIT: 3000000,
  DEFAULT_GAS_PRICE: '20000000000', // 20 gwei
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  INFINITE_SCROLL_THRESHOLD: 100,
  TOAST_DURATION: 5000,
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  MIN_PAGE_SIZE: 5,
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_WALLET_ADDRESS: 'Please enter a valid wallet address',
  INVALID_URL: 'Please enter a valid URL',
  TOO_LONG: (field: string, max: number) =>
    `${field} must be ${max} characters or less`,
  TOO_SHORT: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  INVALID_DATE: 'Please enter a valid date',
  FUTURE_DATE_REQUIRED: 'Date must be in the future',
  END_DATE_AFTER_START: 'End date must be after start date',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_UPLOAD_ERROR: 'Failed to upload file. Please try again.',
  BLOCKCHAIN_ERROR: 'Blockchain transaction failed. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  EVENT_DELETED: 'Event deleted successfully!',
  REGISTRATION_SUCCESS: 'Registration successful!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'festos_user_preferences',
  WALLET_CONNECTION: 'festos_wallet_connection',
  THEME: 'festos_theme',
  LANGUAGE: 'festos_language',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  CREATE: '/create',
  DISCOVER: '/discover',
  DASHBOARD: '/dashboard',
  MARKETPLACE: '/marketplace',
  FEED: '/feed',
  POAPS: '/poaps',
  EVENT: (slug: string) => `/events/${slug}`,
  USER_PROFILE: (username: string) => `/user/${username}`,
  EVENT_MANAGE: (eventId: string) => `/event/manage/${eventId}`,
  CHECK_IN: (eventId: string) => `/check-in/${eventId}`,
} as const;

// Social Media Configuration
export const SOCIAL_CONFIG = {
  TWITTER_HANDLE: '@festos_app',
  TWITTER_URL: 'https://twitter.com/festos_app',
  DISCORD_URL: 'https://discord.gg/festos',
  GITHUB_URL: 'https://github.com/festos-app',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_POAP: true,
  ENABLE_MARKETPLACE: true,
  ENABLE_SOCIAL_FEED: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
} as const;
