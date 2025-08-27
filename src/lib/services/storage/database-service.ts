/**
 * Database Service - Performance Layer
 * 
 * Handles all Supabase PostgreSQL operations for fast queries,
 * complex relationships, and user management.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  StorageProvider, 
  HealthStatus, 
  EventData, 
  CreateEventInput,
  EventSearchInput,
  EventSearchResult,
  StorageOperationResult,
  DatabaseOperationResult,
  ValidationError
} from '../core/interfaces';
import { appConfig } from '@/lib/config/app-config';

interface DatabaseEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  max_capacity: number;
  ticket_price: string;
  require_approval: boolean;
  has_poap: boolean;
  poap_metadata?: string;
  visibility: 'public' | 'private' | 'unlisted';
  timezone: string;
  banner_image?: string;
  category?: string;
  tags?: (string | null)[];
  creator_id: string;
  status: string;
  contract_event_id?: number;
  contract_address?: string;
  contract_chain_id?: number;
  transaction_hash?: string;
  filebase_metadata_url?: string;
  filebase_image_url?: string;
  storage_provider?: string;
  created_at: string;
  updated_at: string;
  users?: {
    wallet_address: string;
    display_name: string;
    avatar_url: string;
  };
}

export class DatabaseService implements StorageProvider {
  readonly name = 'Supabase PostgreSQL';
  readonly type = 'database' as const;
  
  private client: SupabaseClient;
  private healthCheckCache: { status: HealthStatus; timestamp: number } | null = null;
  private readonly HEALTH_CACHE_DURATION = 30000; // 30 seconds

  constructor() {
    this.client = createClient(
      appConfig.database.url!,
      appConfig.database.anonKey!
    );
  }

  /**
   * Health check for database connectivity
   */
  async healthCheck(): Promise<HealthStatus> {
    const now = Date.now();
    
    // Return cached result if still valid
    if (this.healthCheckCache && (now - this.healthCheckCache.timestamp) < this.HEALTH_CACHE_DURATION) {
      return this.healthCheckCache.status;
    }

    const startTime = Date.now();
    
    try {
      // Simple query to test connectivity
      const { data, error } = await this.client
        .from('events')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;
      
      const status: HealthStatus = {
        status: error ? 'unhealthy' : 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          tableCount: data?.length || 0,
          error: error?.message
        }
      };

      // Cache the result
      this.healthCheckCache = { status, timestamp: now };
      
      return status;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const status: HealthStatus = {
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.healthCheckCache = { status, timestamp: now };
      return status;
    }
  }

  /**
   * Get database configuration
   */
  getConfig(): Record<string, unknown> {
    return {
      url: appConfig.database.url,
      hasAnonKey: !!appConfig.database.anonKey,
      hasServiceKey: !!appConfig.database.serviceRoleKey,
    };
  }

  /**
   * Create event in database
   */
  async createEvent(
    eventId: string,
    input: CreateEventInput,
    userId: string,
    slug: string,
    contractEventId?: number,
    transactionHash?: string,
    filebaseMetadataUrl?: string,
    filebaseImageUrl?: string,
    contractChainId?: number,
    contractAddress?: string
  ): Promise<StorageOperationResult<DatabaseOperationResult>> {
    const startTime = Date.now();
    
    try {
      // Validate required fields
      if (!input.title || !input.description || !input.location) {
        throw new ValidationError('Title, description, and location are required');
      }

      const eventData: Partial<DatabaseEvent> = {
        id: eventId,
        title: input.title,
        description: input.description,
        location: input.location,
        start_date: input.startDate,
        end_date: input.endDate,
        max_capacity: input.maxCapacity,
        ticket_price: input.ticketPrice,
        require_approval: input.requireApproval,
        has_poap: input.hasPOAP,
        poap_metadata: input.poapMetadata,
        visibility: input.visibility,
        timezone: input.timezone,
        banner_image: typeof input.bannerImage === 'string' ? input.bannerImage : filebaseImageUrl,
        category: input.category,
        tags: input.tags,
        creator_id: userId,
        status: 'active',
        contract_event_id: contractEventId,
        contract_address: contractAddress,
        contract_chain_id: contractChainId,
        filebase_metadata_url: filebaseMetadataUrl,
        filebase_image_url: filebaseImageUrl,
        storage_provider: 'supabase',
      };

      const { data, error } = await this.client
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          id: data.id,
          affectedRows: 1,
          timestamp: new Date()
        },
        metadata: {
          operationId: `db_create_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `db_create_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Update event with blockchain data
   */
  async updateEventWithBlockchainData(
    eventId: string,
    contractEventId: number,
    transactionHash: string,
    contractAddress: string,
    contractChainId: number
  ): Promise<StorageOperationResult<DatabaseOperationResult>> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.client
        .from('events')
        .update({
          contract_event_id: contractEventId,
          transaction_hash: transactionHash,
          contract_address: contractAddress,
          contract_chain_id: contractChainId,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database update failed: ${error.message}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          id: data.id,
          affectedRows: 1,
          timestamp: new Date()
        },
        metadata: {
          operationId: `db_update_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `db_update_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Get events from database with filters
   */
  async getEvents(filters: EventSearchInput): Promise<StorageOperationResult<EventSearchResult>> {
    const startTime = Date.now();
    
    try {
      let query = this.client
        .from('events')
        .select(`
          *,
          users!inner (
            wallet_address,
            display_name,
            avatar_url
          )
        `);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.creatorId) {
        query = query.eq('creator_id', filters.creatorId);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'start_date';
      const order = filters.order || 'asc';
      query = query.order(sortBy, { ascending: order === 'asc' });

      // Get total count first
      let countQuery = this.client
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Apply the same filters to count query
      if (filters.status) {
        countQuery = countQuery.eq('status', filters.status);
      }
      
      if (filters.category) {
        countQuery = countQuery.eq('category', filters.category);
      }
      
      if (filters.location) {
        countQuery = countQuery.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.creatorId) {
        countQuery = countQuery.eq('creator_id', filters.creatorId);
      }
      
      if (filters.search) {
        countQuery = countQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.startDate) {
        countQuery = countQuery.gte('start_date', filters.startDate);
      }
      
      if (filters.endDate) {
        countQuery = countQuery.lte('end_date', filters.endDate);
      }

      const { count } = await countQuery;

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Transform database events to EventData format
      const events: EventData[] = (data || []).map(this.transformDatabaseEvent);

      // Get available filters
      const availableFilters = await this.getAvailableFilters();

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          events,
          total: count || 0,
          page,
          limit,
          hasMore: (count || 0) > page * limit,
          availableFilters
        },
        metadata: {
          operationId: `db_search_${Date.now()}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `db_search_${Date.now()}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<StorageOperationResult<EventData>> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.client
        .from('events')
        .select(`
          *,
          users!inner (
            wallet_address,
            display_name,
            avatar_url
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data) {
        return {
          success: false,
          error: 'Event not found',
          metadata: {
            operationId: `db_get_${eventId}`,
            timestamp: new Date(),
            provider: this.name,
            responseTime: Date.now() - startTime
          }
        };
      }

      const event = this.transformDatabaseEvent(data);
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: event,
        metadata: {
          operationId: `db_get_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `db_get_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Get or create user
   */
  async getOrCreateUser(walletAddress: string): Promise<string> {
    try {
      // Try to get existing user
      const { data: existingUser } = await this.client
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        return existingUser.id;
      }

      // Create new user
      const { data: newUser, error } = await this.client
        .from('users')
        .insert({
          wallet_address: walletAddress,
          display_name: `User_${walletAddress.slice(0, 8)}`,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      return newUser.id;
    } catch (error) {
      throw new Error(`User operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available filters for events
   */
  private async getAvailableFilters(): Promise<{
    categories: string[];
    locations: string[];
    priceRanges: { min: number; max: number };
  }> {
    try {
      // Get categories
      const { data: categories } = await this.client
        .from('events')
        .select('category')
        .not('category', 'is', null);

      // Get locations
      const { data: locations } = await this.client
        .from('events')
        .select('location');

      // Get price ranges
      const { data: prices } = await this.client
        .from('events')
        .select('ticket_price');

      const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))];
      const uniqueLocations = [...new Set(locations?.map(l => l.location))];
      
      const priceValues = prices?.map(p => parseFloat(p.ticket_price)).filter(p => !isNaN(p)) || [];
      const priceRanges = {
        min: priceValues.length > 0 ? Math.min(...priceValues) : 0,
        max: priceValues.length > 0 ? Math.max(...priceValues) : 0
      };

      return {
        categories: uniqueCategories,
        locations: uniqueLocations,
        priceRanges
      };
    } catch {
      // Failed to get available filters
      return {
        categories: [],
        locations: [],
        priceRanges: { min: 0, max: 0 }
      };
    }
  }

  /**
   * Delete event from database
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Delete event failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get events without blockchain proof (orphaned records)
   */
  async getEventsWithoutBlockchainProof(): Promise<DatabaseEvent[]> {
    try {
      const { data, error } = await this.client
        .from('events')
        .select('*')
        .is('transaction_hash', null)
        .is('contract_event_id', null);

      if (error) {
        throw new Error(`Failed to get orphaned events: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get orphaned events:', error);
      return [];
    }
  }

  /**
   * Transform database event to EventData format
   */
  private transformDatabaseEvent(dbEvent: DatabaseEvent): EventData {
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      location: dbEvent.location,
      startDate: dbEvent.start_date,
      endDate: dbEvent.end_date,
      maxCapacity: dbEvent.max_capacity,
      ticketPrice: dbEvent.ticket_price,
      requireApproval: dbEvent.require_approval,
      hasPOAP: dbEvent.has_poap,
      poapMetadata: dbEvent.poap_metadata,
      visibility: dbEvent.visibility,
      timezone: dbEvent.timezone,
      bannerImage: dbEvent.banner_image,
      category: dbEvent.category,
      tags: dbEvent.tags?.filter((tag): tag is string => tag !== null) || [],
      creatorId: dbEvent.creator_id,
      status: dbEvent.status,
      contractEventId: dbEvent.contract_event_id,
      contractAddress: dbEvent.contract_address,
      contractChainId: dbEvent.contract_chain_id,
      transactionHash: dbEvent.transaction_hash,
      filebaseMetadataUrl: dbEvent.filebase_metadata_url,
      filebaseImageUrl: dbEvent.filebase_image_url,
      storageProvider: dbEvent.storage_provider,
      createdAt: dbEvent.created_at,
      updatedAt: dbEvent.updated_at
    };
  }
}
