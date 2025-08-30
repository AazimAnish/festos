/**
 * Data Models and Interfaces
 *
 * This file contains all TypeScript interfaces and types for data models
 * following clean code principles and type safety best practices.
 */

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User entity
 */
export interface User extends BaseEntity {
  walletAddress: string;
  username?: string;
  email?: string;
  profileImage?: string;
  bio?: string;
  isVerified: boolean;
  preferences: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

/**
 * Event entity
 */
export interface Event extends BaseEntity {
  title: string;
  description: string;
  slug: string;
  location: string;
  startDate: string;
  endDate: string;
  timezone: string;
  maxCapacity: number;
  currentAttendees: number;
  ticketPrice: string;
  currency: string;
  category: EventCategory;
  tags: string[];
  bannerImage?: string;
  images: string[];
  requireApproval: boolean;
  visibility: EventVisibility;
  status: EventStatus;

  // Creator information
  creatorId: string;
  creator?: User;

  // POAP integration
  hasPOAP: boolean;
  poapMetadata?: POAPMetadata;

  // Blockchain integration
  contractEventId?: number;
  contractAddress?: string;
  contractChainId?: number;
  transactionHash?: string;

  // IPFS storage
  ipfsMetadataUrl?: string;
  ipfsImageUrl?: string;
  storageProvider?: string;

  // Computed fields
  isUpcoming: boolean;
  isOngoing: boolean;
  isCompleted: boolean;
  isSoldOut: boolean;
  registrationDeadline?: string;
}

/**
 * Event categories
 */
export type EventCategory =
  | 'conference'
  | 'workshop'
  | 'meetup'
  | 'party'
  | 'concert'
  | 'sports'
  | 'festival'
  | 'exhibition'
  | 'networking'
  | 'education'
  | 'charity'
  | 'other';

/**
 * Event visibility options
 */
export type EventVisibility = 'public' | 'private' | 'unlisted';

/**
 * Event status options
 */
export type EventStatus =
  | 'draft'
  | 'active'
  | 'cancelled'
  | 'completed'
  | 'suspended';

/**
 * POAP metadata
 */
export interface POAPMetadata {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  attributes: POAPAttribute[];
}

/**
 * POAP attribute
 */
export interface POAPAttribute {
  traitType: string;
  value: string | number;
}

/**
 * Event registration/ticket
 */
export interface EventRegistration extends BaseEntity {
  eventId: string;
  event?: Event;
  attendeeId: string;
  attendee?: User;

  // Registration details
  attendeeName: string;
  attendeeEmail: string;
  ticketQuantity: number;
  totalAmount: string;
  currency: string;

  // Status and verification
  status: RegistrationStatus;
  approvalStatus?: ApprovalStatus;
  checkedIn: boolean;
  checkedInAt?: string;

  // Payment information
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  paymentStatus: PaymentStatus;

  // Blockchain information
  tokenId?: number;
  mintTransactionHash?: string;

  // QR code for check-in
  qrCode: string;

  // Additional fields
  specialRequests?: string;
  emergencyContact?: string;
  dietaryRestrictions?: string[];
}

/**
 * Registration status options
 */
export type RegistrationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'refunded'
  | 'checked_in';

/**
 * Approval status for events requiring approval
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Payment method options
 */
export type PaymentMethod =
  | 'crypto'
  | 'credit_card'
  | 'paypal'
  | 'bank_transfer'
  | 'free';

/**
 * Payment status options
 */
export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

/**
 * Event review
 */
export interface EventReview extends BaseEntity {
  eventId: string;
  event?: Event;
  reviewerId: string;
  reviewer?: User;

  rating: number; // 1-5 stars
  title?: string;
  comment: string;

  // Verification
  isVerified: boolean; // Did the user actually attend?

  // Moderation
  isHidden: boolean;
  moderationReason?: string;

  // Engagement
  helpfulVotes: number;
  totalVotes: number;
}

/**
 * Marketplace listing for ticket resale
 */
export interface MarketplaceListing extends BaseEntity {
  eventId: string;
  event?: Event;
  sellerId: string;
  seller?: User;

  // Listing details
  ticketQuantity: number;
  pricePerTicket: string;
  currency: string;
  totalPrice: string;

  // Status
  status: ListingStatus;

  // Verification
  isVerified: boolean;

  // Sale information
  buyerId?: string;
  buyer?: User;
  soldAt?: string;
  transactionHash?: string;
}

/**
 * Marketplace listing status
 */
export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired';

/**
 * Analytics data
 */
export interface EventAnalytics {
  eventId: string;

  // Registration metrics
  totalRegistrations: number;
  confirmedRegistrations: number;
  pendingRegistrations: number;
  cancelledRegistrations: number;

  // Revenue metrics
  totalRevenue: string;
  averageTicketPrice: string;

  // Engagement metrics
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;

  // Geographic data
  topCountries: { country: string; count: number }[];
  topCities: { city: string; count: number }[];

  // Time-based data
  registrationsByDay: { date: string; count: number }[];
  trafficByHour: { hour: number; visits: number }[];

  // Demographics
  ageGroups: { range: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
}

/**
 * Notification
 */
export interface Notification extends BaseEntity {
  userId: string;
  user?: User;

  // Content
  title: string;
  message: string;
  type: NotificationType;

  // Status
  isRead: boolean;
  readAt?: string;

  // Context
  relatedEntityType?: string; // 'event', 'registration', etc.
  relatedEntityId?: string;

  // Delivery
  channels: NotificationChannel[];
  sentAt?: string;
}

/**
 * Notification types
 */
export type NotificationType =
  | 'event_reminder'
  | 'registration_confirmation'
  | 'registration_approved'
  | 'registration_rejected'
  | 'event_cancelled'
  | 'event_updated'
  | 'poap_available'
  | 'marketplace_sale'
  | 'system_update'
  | 'security_alert';

/**
 * Notification delivery channels
 */
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Search filters
 */
export interface SearchFilters {
  query?: string;
  category?: EventCategory;
  location?: string;
  startDate?: string;
  endDate?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  sortBy?: SortOption;
  sortOrder?: SortOrder;
}

/**
 * Sort options
 */
export type SortOption =
  | 'date'
  | 'price'
  | 'popularity'
  | 'rating'
  | 'distance'
  | 'created_at';

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * File upload result
 */
export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * Blockchain transaction result
 */
export interface BlockchainTransaction {
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
}

/**
 * Error details
 */
export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Configuration for external services
 */
export interface ServiceConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  options?: Record<string, unknown>;
}
