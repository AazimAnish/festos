/**
 * Form Validation Utilities
 * 
 * This file contains utilities for form validation following clean code principles.
 * It provides reusable validation functions and error handling.
 */

import { z } from 'zod';
import { VALIDATION_MESSAGES, ERROR_MESSAGES, EVENT_CONFIG } from '@/lib/constants';

/**
 * Generic validation result type
 */
export type ValidationResult<T> = 
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: string[];
    };

/**
 * Validate form data against a Zod schema
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [ERROR_MESSAGES.VALIDATION_ERROR],
    };
  }
}

/**
 * Validate form data asynchronously
 */
export async function validateFormDataAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const validatedData = await schema.parseAsync(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [ERROR_MESSAGES.VALIDATION_ERROR],
    };
  }
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number
): string | null {
  if (value.length < minLength) {
    return VALIDATION_MESSAGES.TOO_SHORT(fieldName, minLength);
  }
  if (value.length > maxLength) {
    return VALIDATION_MESSAGES.TOO_LONG(fieldName, maxLength);
  }
  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  return null;
}

/**
 * Validate wallet address format
 */
export function validateWalletAddress(address: string): string | null {
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!walletRegex.test(address)) {
    return VALIDATION_MESSAGES.INVALID_WALLET_ADDRESS;
  }
  return null;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): string | null {
  try {
    new URL(url);
    return null;
  } catch {
    return VALIDATION_MESSAGES.INVALID_URL;
  }
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(date: Date | string): string | null {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  if (dateObj <= now) {
    return VALIDATION_MESSAGES.FUTURE_DATE_REQUIRED;
  }
  return null;
}

/**
 * Validate date range (end date after start date)
 */
export function validateDateRange(startDate: Date | string, endDate: Date | string): string | null {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (end <= start) {
    return VALIDATION_MESSAGES.END_DATE_AFTER_START;
  }
  return null;
}

/**
 * Validate numeric range
 */
export function validateNumericRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
): string | null {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number): string | null {
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return null;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
}

/**
 * Validate event-specific fields
 */
export const eventValidation = {
  title: (title: string): string | null => {
    const required = validateRequired(title, 'Title');
    if (required) return required;
    
    return validateStringLength(title, 'Title', 1, EVENT_CONFIG.MAX_TITLE_LENGTH);
  },

  description: (description: string): string | null => {
    const required = validateRequired(description, 'Description');
    if (required) return required;
    
    return validateStringLength(description, 'Description', 1, EVENT_CONFIG.MAX_DESCRIPTION_LENGTH);
  },

  location: (location: string): string | null => {
    const required = validateRequired(location, 'Location');
    if (required) return required;
    
    return validateStringLength(location, 'Location', 1, EVENT_CONFIG.MAX_LOCATION_LENGTH);
  },

  capacity: (capacity: number): string | null => {
    return validateNumericRange(capacity, 'Capacity', 0, EVENT_CONFIG.MAX_CAPACITY);
  },

  ticketPrice: (price: string): string | null => {
    const required = validateRequired(price, 'Ticket price');
    if (required) return required;
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return 'Ticket price must be a valid positive number';
    }
    
    return null;
  },

  dates: (startDate: string, endDate: string): string | null => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return VALIDATION_MESSAGES.INVALID_DATE;
    }
    
    const futureDate = validateFutureDate(start);
    if (futureDate) return futureDate;
    
    return validateDateRange(start, end);
  },

  bannerImage: (imageUrl: string): string | null => {
    if (!imageUrl) return null; // Optional field
    return validateUrl(imageUrl);
  },
};

/**
 * Create a validation function for a specific field
 */
export function createFieldValidator<T>(
  validator: (value: T) => string | null
) {
  return (value: T): { isValid: boolean; error: string | null } => {
    const error = validator(value);
    return {
      isValid: !error,
      error,
    };
  };
}

/**
 * Validate multiple fields and return all errors
 */
export function validateMultipleFields(
  validations: Array<{ field: string; value: unknown; validator: (value: unknown) => string | null }>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  validations.forEach(({ field, value, validator }) => {
    const error = validator(value);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}

/**
 * Debounced validation function
 */
export function createDebouncedValidator<T>(
  validator: (value: T) => string | null,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (value: T): Promise<string | null> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const error = validator(value);
        resolve(error);
      }, delay);
    });
  };
}
