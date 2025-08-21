/**
 * Event Helper Utilities
 *
 * This file contains utility functions specifically for event operations
 * following clean code principles and best practices.
 */

/**
 * Generate a unique event ID (Lu.ma style)
 */
export function generateUniqueEventId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate event slug from title and ID
 * @deprecated Use generateSlug from event service instead
 */
export function generateEventSlug(event: {
  id: number;
  title: string;
}): string {
  if (!event.title || !event.id) {
    throw new Error('Invalid event data for slug generation');
  }

  const titleSlug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${titleSlug}-${event.id}`;
}

/**
 * Extract event ID from slug
 * @deprecated Legacy function for backward compatibility
 */
export function extractEventIdFromSlug(slug: string): number {
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
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(startDate: string): boolean {
  return new Date(startDate) > new Date();
}

/**
 * Check if event is ongoing
 */
export function isEventOngoing(startDate: string, endDate: string): boolean {
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
}

/**
 * Check if event is completed
 */
export function isEventCompleted(endDate: string): boolean {
  return new Date(endDate) < new Date();
}

/**
 * Format event date range
 */
export function formatEventDateRange(
  startDate: string,
  endDate: string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  if (start.toDateString() === end.toDateString()) {
    // Same day event
    return start.toLocaleDateString('en-US', options);
  } else {
    // Multi-day event
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }
}

/**
 * Format event time range
 */
export function formatEventTimeRange(
  startDate: string,
  endDate: string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return `${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
}

/**
 * Calculate event duration in hours
 */
export function calculateEventDuration(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

/**
 * Check if event registration is open
 */
export function isRegistrationOpen(
  startDate: string,
  registrationDeadline?: string
): boolean {
  const now = new Date();
  const eventStart = new Date(startDate);
  const deadline = registrationDeadline
    ? new Date(registrationDeadline)
    : eventStart;

  return now < deadline;
}

/**
 * Format ticket price with currency
 */
export function formatTicketPrice(
  price: string,
  currency: string = 'AVAX'
): string {
  const numPrice = parseFloat(price);

  if (numPrice === 0) {
    return 'Free';
  }

  return `${numPrice} ${currency}`;
}

/**
 * Generate QR code data for event check-in
 */
export function generateCheckInQRData(
  eventId: string,
  attendeeId: string
): string {
  return JSON.stringify({
    eventId,
    attendeeId,
    timestamp: Date.now(),
  });
}

/**
 * Parse QR code data for event check-in
 */
export function parseCheckInQRData(
  qrData: string
): { eventId: string; attendeeId: string; timestamp: number } | null {
  try {
    const data = JSON.parse(qrData);
    if (data.eventId && data.attendeeId && data.timestamp) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract event ID from unique ID
 * @deprecated Legacy function for backward compatibility
 */
export function extractEventIdFromUniqueId(uniqueId: string): number {
  // Simple hash-based approach for backward compatibility
  let hash = 0;
  for (let i = 0; i < uniqueId.length; i++) {
    const char = uniqueId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return (Math.abs(hash) % 1000) + 1; // Return a number between 1-1000
}

/**
 * Generate username from wallet address
 */
export function generateUsernameFromAddress(address: string): string {
  // Remove 0x prefix and take first 8 characters
  const cleanAddress = address.replace('0x', '');
  const shortAddress = cleanAddress.substring(0, 8);

  // Convert to lowercase and ensure it's alphanumeric
  return shortAddress.toLowerCase();
}

/**
 * Get username from wallet address or return default
 */
export function getUsernameFromWallet(address?: string): string {
  if (!address) return 'anonymous';
  return generateUsernameFromAddress(address);
}

/**
 * Format price for display
 * @deprecated Use formatTicketPrice instead
 */
export function formatPrice(price: string | number): string {
  if (typeof price === 'number') {
    return `${price} AVAX`;
  }
  return price;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
