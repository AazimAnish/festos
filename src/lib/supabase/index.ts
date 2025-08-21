// Re-export all Supabase clients for easy importing
export { createClient as createServerClient } from './server';
export { createClient as createBrowserClient } from './client';
export { createClient as createMiddlewareClient } from './middleware';

// Re-export utility functions
export * from './utils';

// Re-export types
export type { Database } from './types';
