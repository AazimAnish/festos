import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Event ID utilities (Lu.ma style)
export const generateUniqueEventId = (): string => {
  // Generate a short, unique ID like Lu.ma (e.g., fpvxrdl3)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Event slug utilities (for backward compatibility)
export const generateEventSlug = (event: { id: number; title: string }) => {
  if (!event.title || !event.id) {
    throw new Error('Invalid event data for slug generation');
  }
  
  const titleSlug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${titleSlug}-${event.id}`;
};

export const extractEventIdFromSlug = (slug: string): number => {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid slug provided');
  }
  
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart);
  
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid event ID in slug');
  }
  
  return id;
};

// New function to extract event ID from unique ID
export const extractEventIdFromUniqueId = (uniqueId: string): number => {
  // In a real app, this would query the database to find the event by unique ID
  // For now, we'll use a simple hash-based approach
  let hash = 0;
  for (let i = 0; i < uniqueId.length; i++) {
    const char = uniqueId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000 + 1; // Return a number between 1-1000
};

// Generate username from wallet address
export const generateUsernameFromAddress = (address: string): string => {
  // Remove 0x prefix and take first 8 characters
  const cleanAddress = address.replace('0x', '');
  const shortAddress = cleanAddress.substring(0, 8);
  
  // Convert to lowercase and ensure it's alphanumeric
  return shortAddress.toLowerCase();
};

// Get username from wallet address or return default
export const getUsernameFromWallet = (address?: string): string => {
  if (!address) return 'anonymous';
  return generateUsernameFromAddress(address);
};

// Validation utilities
export const validateEventData = (data: Record<string, unknown>) => {
  const errors: string[] = [];
  
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Event title is required');
  }
  
  if (!data.location || typeof data.location !== 'string' || !data.location.trim()) {
    errors.push('Event location is required');
  }
  
  if (!data.date) {
    errors.push('Event date is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format utilities
export const formatPrice = (price: string | number): string => {
  if (typeof price === 'number') {
    return `${price} ETH`;
  }
  return price;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
