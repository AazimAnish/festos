/**
 * Event Validation Schemas
 *
 * This file contains all Zod validation schemas for event-related operations.
 * Following clean code principles, all validation logic is centralized here.
 */

import { z } from 'zod';
import { EVENT_CONFIG, VALIDATION_MESSAGES } from '@/lib/constants';

// Base event schema with common fields
const baseEventSchema = z.object({
  title: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(
      EVENT_CONFIG.MAX_TITLE_LENGTH,
      VALIDATION_MESSAGES.TOO_LONG('Title', EVENT_CONFIG.MAX_TITLE_LENGTH)
    )
    .trim(),

  description: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(
      EVENT_CONFIG.MAX_DESCRIPTION_LENGTH,
      VALIDATION_MESSAGES.TOO_LONG(
        'Description',
        EVENT_CONFIG.MAX_DESCRIPTION_LENGTH
      )
    )
    .trim(),

  location: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(
      EVENT_CONFIG.MAX_LOCATION_LENGTH,
      VALIDATION_MESSAGES.TOO_LONG('Location', EVENT_CONFIG.MAX_LOCATION_LENGTH)
    )
    .trim(),

  startDate: z.string().datetime(VALIDATION_MESSAGES.INVALID_DATE),

  endDate: z.string().datetime(VALIDATION_MESSAGES.INVALID_DATE),

  maxCapacity: z
    .number()
    .int()
    .min(0, 'Capacity must be 0 or positive')
    .max(
      EVENT_CONFIG.MAX_CAPACITY,
      `Capacity cannot exceed ${EVENT_CONFIG.MAX_CAPACITY}`
    ),

  ticketPrice: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .refine(price => {
      const numPrice = parseFloat(price);
      return !isNaN(numPrice) && numPrice >= 0;
    }, 'Ticket price must be a valid number'),

  requireApproval: z.boolean().default(false),

  hasPOAP: z.boolean().default(false),

  poapMetadata: z.string().optional(),

  visibility: z.enum(['public', 'private']).default('public'),

  timezone: z.string().default(EVENT_CONFIG.DEFAULT_TIMEZONE),

  bannerImage: z.string().url(VALIDATION_MESSAGES.INVALID_URL).optional(),

  category: z.string().optional(),

  tags: z.array(z.string()).optional(),
});

// Wallet address validation
const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, VALIDATION_MESSAGES.INVALID_WALLET_ADDRESS);

// Create event schema with blockchain integration
export const createEventSchema = baseEventSchema.extend({
  walletAddress: walletAddressSchema,
  privateKey: z.string().optional(), // For server-side contract interaction
  useTestnet: z.boolean().default(true), // Default to testnet for safety
});

// Update event schema (without blockchain fields)
export const updateEventSchema = baseEventSchema.partial().extend({
  id: z.string().uuid(),
});

// Event registration schema
export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid(),
  attendeeName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(100, VALIDATION_MESSAGES.TOO_LONG('Name', 100)),

  attendeeEmail: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL),

  walletAddress: walletAddressSchema,

  ticketQuantity: z
    .number()
    .int()
    .min(1, 'Must purchase at least 1 ticket')
    .max(10, 'Cannot purchase more than 10 tickets at once'),

  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
});

// Event search/filter schema
export const eventSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  priceRange: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
  includeBlockchain: z.boolean().optional(),
});

// Event review schema
export const eventReviewSchema = z.object({
  eventId: z.string().uuid(),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),

  comment: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .max(500, VALIDATION_MESSAGES.TOO_LONG('Review', 500))
    .trim(),

  walletAddress: walletAddressSchema,
});

// Event check-in schema
export const eventCheckInSchema = z.object({
  eventId: z.string().uuid(),
  attendeeId: z.string().uuid(),
  walletAddress: walletAddressSchema,
  qrCode: z.string().optional(),
});

// Type exports for TypeScript
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
export type EventSearchInput = z.infer<typeof eventSearchSchema>;
export type EventReviewInput = z.infer<typeof eventReviewSchema>;
export type EventCheckInInput = z.infer<typeof eventCheckInSchema>;
