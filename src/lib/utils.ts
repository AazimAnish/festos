import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Event slug utilities
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
