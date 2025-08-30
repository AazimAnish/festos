/**
 * Core Interfaces for Three-Layer Storage Architecture
 * 
 * This module defines the abstract interfaces that all storage providers
 * must implement, ensuring consistency across the three layers:
 * - Avalanche Blockchain (Immutable Layer)
 * - Supabase PostgreSQL (Performance Layer) 
 * - Pinata IPFS (Media Layer)
 */

export interface StorageProvider {
  readonly name: string;
  readonly type: 'blockchain' | 'database' | 'ipfs';
  
  /**
   * Health check for the storage provider
   */
  healthCheck(): Promise<HealthStatus>;
  
  /**
   * Get provider-specific configuration
   */
  getConfig(): Record<string, unknown>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  details?: Record<string, unknown>;
  error?: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  currentAttendees?: number;
  ticketPrice: string;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata?: string;
  visibility: 'public' | 'private' | 'unlisted';
  timezone: string;
  bannerImage?: string;
  category?: string;
  tags?: string[];
  creatorId: string;
  status: string;
  isActive?: boolean;
  blockchainEventId?: number;
  contractEventId?: number;
  contractAddress?: string;
  contractChainId?: number;
  transactionHash?: string;
  ipfsMetadataUrl?: string;
  ipfsImageUrl?: string;
  storageProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketData {
  id: string;
  event_id: string;
  attendee_id: string;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  price_paid: string;
  is_used: boolean;
  is_approved: boolean;
  is_refunded: boolean;
  contract_ticket_id?: number;
  contract_address?: string;
  contract_chain_id?: number;
  transaction_hash?: string;
  ticket_metadata_cid?: string;
  purchase_time: string;
  used_time?: string;
  approved_time?: string;
  refunded_time?: string;
  created_at: string;
  updated_at: string;
  events?: {
    title: string;
    start_date: string;
    location: string;
    banner_image?: string;
  };
}

export interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  ticketPrice: string;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata?: string;
  visibility: 'public' | 'private' | 'unlisted';
  timezone: string;
  bannerImage?: File | string;
  category?: string;
  tags?: string[];
  walletAddress: string;
  privateKey?: string;
}

export interface EventSearchInput {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  creatorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface EventSearchResult {
  events: EventData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  availableFilters: {
    categories: string[];
    locations: string[];
    priceRanges: { min: number; max: number };
  };
}

export interface EventCreationResult {
  success: boolean;
  eventId: string;
  slug: string;
  contractEventId?: number;
  transactionHash?: string;
  ipfsMetadataUrl?: string;
  ipfsImageUrl?: string;
  contractChainId?: number;
  contractAddress?: string;
  createdOn: {
    blockchain: boolean;
    database: boolean;
    ipfs: boolean;
  };
  errors?: string[];
}

export interface StorageOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    operationId: string;
    timestamp: Date;
    provider: string;
    responseTime: number;
  };
}

export interface DataConsistencyCheck {
  eventId: string;
  database: boolean;
  blockchain: boolean;
  ipfs: boolean;
  discrepancies: string[];
  lastChecked: Date;
}

export interface SyncStatus {
  totalEvents: number;
  syncedEvents: number;
  failedEvents: number;
  lastSyncTime: Date;
  errors: string[];
}

export interface MediaUploadResult {
  url: string;
  hash: string;
  size: number;
  contentType: string;
  metadata?: Record<string, unknown>;
}

export interface BlockchainTransactionResult {
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: bigint;
  status: 'success' | 'failed' | 'pending';
  contractAddress?: string;
  contractChainId?: number;
  eventId?: number;
}

export interface DatabaseOperationResult {
  id: string;
  affectedRows: number;
  timestamp: Date;
}

// Error types for better error handling
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly operation: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ConsistencyError extends Error {
  constructor(
    message: string,
    public readonly eventId: string,
    public readonly discrepancies: string[]
  ) {
    super(message);
    this.name = 'ConsistencyError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
