/**
 * Error Handling Utilities
 *
 * This file contains centralized error handling utilities following clean code principles.
 * All error handling logic is centralized here for consistency and maintainability.
 */

import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Custom error types for better error handling
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}

/**
 * Error handler for async operations
 */
export const asyncHandler = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch(error => {
      console.error('Async operation failed:', error);
      throw error;
    });
  };
};

/**
 * Error handler for API routes
 */
export const apiErrorHandler = (error: unknown) => {
  console.error('API Error:', error);

  // Handle known error types
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return {
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: (error as { issues: unknown }).issues,
      statusCode: 400,
    };
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      error: ERROR_MESSAGES.NETWORK_ERROR,
      statusCode: 503,
    };
  }

  // Handle unknown errors
  return {
    error: ERROR_MESSAGES.SERVER_ERROR,
    statusCode: 500,
  };
};

/**
 * Error handler for client-side operations
 */
export const clientErrorHandler = (error: unknown): string => {
  console.error('Client Error:', error);

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Error handler for file operations
 */
export const fileErrorHandler = (error: unknown): string => {
  console.error('File Operation Error:', error);

  if (error instanceof Error) {
    if (error.message.includes('permission')) {
      return 'Permission denied. Please check file permissions.';
    }
    if (error.message.includes('not found')) {
      return 'File not found.';
    }
    if (error.message.includes('size')) {
      return 'File size exceeds the maximum allowed limit.';
    }
    if (error.message.includes('type')) {
      return 'File type not supported.';
    }
  }

  return ERROR_MESSAGES.FILE_UPLOAD_ERROR;
};

/**
 * Error handler for blockchain operations
 */
export const blockchainErrorHandler = (error: unknown): string => {
  console.error('Blockchain Error:', error);

  if (error instanceof Error) {
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction.';
    }
    if (error.message.includes('gas')) {
      return 'Gas estimation failed. Please try again.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected by user.';
    }
  }

  return ERROR_MESSAGES.BLOCKCHAIN_ERROR;
};

/**
 * Error handler for database operations
 */
export const databaseErrorHandler = (error: unknown): string => {
  console.error('Database Error:', error);

  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string };

    switch (dbError.code) {
      case '23505': // Unique violation
        return 'This record already exists.';
      case '23503': // Foreign key violation
        return 'Referenced record does not exist.';
      case '23502': // Not null violation
        return 'Required field is missing.';
      case '42P01': // Table doesn't exist
        return 'Database table not found.';
      case 'PGRST116': // Not found
        return 'Record not found.';
      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Error handler for validation operations
 */
export const validationErrorHandler = (error: unknown): string => {
  console.error('Validation Error:', error);

  if (error && typeof error === 'object' && 'issues' in error) {
    const validationError = error as { issues?: Array<{ message?: string }> };
    const firstIssue = validationError.issues?.[0];

    if (firstIssue?.message) {
      return firstIssue.message;
    }
  }

  return ERROR_MESSAGES.VALIDATION_ERROR;
};

/**
 * Error handler for external API calls
 */
export const externalApiErrorHandler = (error: unknown): string => {
  console.error('External API Error:', error);

  if (error instanceof Response) {
    switch (error.status) {
      case 400:
        return 'Invalid request to external service.';
      case 401:
        return 'Authentication failed with external service.';
      case 403:
        return 'Access denied by external service.';
      case 404:
        return 'External service not found.';
      case 429:
        return 'Rate limit exceeded for external service.';
      case 500:
        return 'External service is temporarily unavailable.';
      default:
        return 'External service error.';
    }
  }

  return ERROR_MESSAGES.NETWORK_ERROR;
};

/**
 * Utility to check if error is operational
 */
export const isOperationalError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Utility to format error for logging
 */
export const formatErrorForLogging = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack}`;
  }
  return String(error);
};

/**
 * Utility to create user-friendly error messages
 */
export const createUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Don't expose internal error messages to users
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};
