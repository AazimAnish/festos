/**
 * Event Service
 * 
 * This service handles all event-related business logic following clean code principles.
 * It separates business logic from data access and presentation layers.
 */

import { createClient } from '@/lib/supabase/server';
import { getFilebaseClient, generateEventMetadataKey, generateEventImageKey } from '@/lib/filebase/client';
import { createEventOnAvalanche } from '@/lib/contracts/avalanche-client';
import type { CreateEventParams } from '@/lib/contracts/types/EventFactory';
import type { CreateEventInput } from '@/lib/schemas/event';
import { parseEther } from 'viem';
import { 
  NotFoundError, 
  ValidationError
} from '@/lib/utils/error-handler';
import { EVENT_CONFIG } from '@/lib/constants';

export interface EventCreationResult {
  eventId: string;
  slug: string;
  contractEventId?: number;
  transactionHash?: string;
  filebaseMetadataUrl?: string;
  filebaseImageUrl?: string;
  contractChainId?: number;
  contractAddress?: string;
  createdOn: {
    blockchain: boolean;
    database: boolean;
    filebase: boolean;
  };
}

export interface EventData {
  id: string;
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
  visibility: 'public' | 'private';
  timezone: string;
  bannerImage?: string;
  category?: string;
  tags?: string[];
  creatorId: string;
  status: string;
  contractEventId?: number;
  contractAddress?: string;
  contractChainId?: number;
  filebaseMetadataUrl?: string;
  filebaseImageUrl?: string;
  storageProvider?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Event Service Class
 */
export class EventService {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  constructor() {
    // Don't initialize in constructor to avoid build-time issues
  }

  /**
   * Initialize Supabase client lazily
   */
  private async initializeSupabase(): Promise<void> {
    if (this.supabase !== null) {
      return; // Already initialized
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = await createClient();
      } else {
        this.supabase = null;
      }
    } catch (error) {
      console.warn('Supabase initialization failed:', error);
      this.supabase = null;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(input: CreateEventInput): Promise<EventCreationResult> {
    // Initialize Supabase if needed
    await this.initializeSupabase();

    // Validate input
    this.validateEventInput(input);

    // Get or create user
    const userId = await this.getOrCreateUser(input.walletAddress);

    // Convert dates to Unix timestamps
    const startTime = BigInt(Math.floor(new Date(input.startDate).getTime() / 1000));
    const endTime = BigInt(Math.floor(new Date(input.endDate).getTime() / 1000));

    // Validate dates
    this.validateEventDates(startTime, endTime);

    // Parse ticket price
    const ticketPriceWei = this.parseTicketPrice(input.ticketPrice);

    // Generate unique event ID
    const eventId = this.generateEventId();

    // Upload to Filebase
    const filebaseResult = await this.uploadToFilebase(eventId, input, userId);

    // Create on blockchain
    const blockchainResult = await this.createOnBlockchain(input, startTime, endTime, ticketPriceWei);

    // Store in database
    const databaseResult = await this.storeInDatabase(input, userId, eventId, blockchainResult, filebaseResult);

    return {
      eventId: databaseResult?.id || eventId,
      slug: databaseResult?.slug || this.generateSlug(input.title),
      contractEventId: blockchainResult?.eventId,
      transactionHash: blockchainResult?.transactionHash,
      filebaseMetadataUrl: filebaseResult?.metadataUrl,
      filebaseImageUrl: filebaseResult?.imageUrl,
      contractChainId: blockchainResult?.chainId,
      contractAddress: blockchainResult?.address,
      createdOn: {
        blockchain: blockchainResult !== null,
        database: databaseResult !== null,
        filebase: filebaseResult !== null,
      },
    };
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<EventData | null> {
    await this.initializeSupabase();
    
    if (!this.supabase) {
      throw new NotFoundError('Database not available');
    }

    const { data: event, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return event as EventData;
  }

  /**
   * Get event by slug
   */
  async getEventBySlug(slug: string): Promise<EventData | null> {
    await this.initializeSupabase();
    
    if (!this.supabase) {
      throw new NotFoundError('Database not available');
    }

    const { data: event, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return event as EventData;
  }

  /**
   * Get events by creator
   */
  async getEventsByCreator(creatorId: string): Promise<EventData[]> {
    await this.initializeSupabase();
    
    if (!this.supabase) {
      throw new NotFoundError('Database not available');
    }

    const { data: events, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return events as EventData[];
  }

  /**
   * Search events
   */
  async searchEvents(query: string, filters?: Record<string, unknown>): Promise<EventData[]> {
    await this.initializeSupabase();
    
    if (!this.supabase) {
      throw new NotFoundError('Database not available');
    }

    let queryBuilder = this.supabase
      .from('events')
      .select('*')
      .eq('visibility', 'public')
      .gte('start_date', new Date().toISOString());

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);
    }

    if (filters?.category) {
      queryBuilder = queryBuilder.eq('category', filters.category as string);
    }

    if (filters?.location) {
      queryBuilder = queryBuilder.ilike('location', `%${filters.location as string}%`);
    }

    const { data: events, error } = await queryBuilder.order('start_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to search events: ${error.message}`);
    }

    return events as EventData[];
  }

  /**
   * Validate event input
   */
  private validateEventInput(input: CreateEventInput): void {
    if (!input.title.trim()) {
      throw new ValidationError('Title is required');
    }

    if (input.title.length > EVENT_CONFIG.MAX_TITLE_LENGTH) {
      throw new ValidationError(`Title must be ${EVENT_CONFIG.MAX_TITLE_LENGTH} characters or less`);
    }

    if (!input.description.trim()) {
      throw new ValidationError('Description is required');
    }

    if (input.description.length > EVENT_CONFIG.MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(`Description must be ${EVENT_CONFIG.MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    if (!input.location.trim()) {
      throw new ValidationError('Location is required');
    }

    if (input.location.length > EVENT_CONFIG.MAX_LOCATION_LENGTH) {
      throw new ValidationError(`Location must be ${EVENT_CONFIG.MAX_LOCATION_LENGTH} characters or less`);
    }

    if (input.maxCapacity < 0 || input.maxCapacity > EVENT_CONFIG.MAX_CAPACITY) {
      throw new ValidationError(`Capacity must be between 0 and ${EVENT_CONFIG.MAX_CAPACITY}`);
    }
  }

  /**
   * Validate event dates
   */
  private validateEventDates(startTime: bigint, endTime: bigint): void {
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    if (startTime <= now) {
      throw new ValidationError('Start time must be in the future');
    }

    if (endTime <= startTime) {
      throw new ValidationError('End time must be after start time');
    }
  }

  /**
   * Parse ticket price to wei
   */
  private parseTicketPrice(price: string): bigint {
    try {
      return parseEther(price);
    } catch {
      throw new ValidationError('Invalid ticket price format');
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate URL slug
   */
  private generateSlug(title: string): string {
    return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
  }

  /**
   * Get or create user by wallet address
   */
  private async getOrCreateUser(walletAddress: string): Promise<string> {
    if (!this.supabase) {
      return walletAddress.toLowerCase();
    }

    try {
      // Try to get existing user
      const { data: existingUser, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (userError && userError.code === '42P01') {
        // Table doesn't exist
        throw new Error('Table not found');
      }

      if (existingUser) {
        return existingUser.id;
      }

      // Create new user
      const { data: newUser, error: createError } = await this.supabase
        .from('users')
        .insert([{
          wallet_address: walletAddress.toLowerCase(),
          created_at: new Date().toISOString(),
        }])
        .select('id')
        .single();

      if (createError) {
        throw new Error('User creation failed');
      }

      return newUser.id;
    } catch {
      // Fallback to wallet address as user ID
      return walletAddress.toLowerCase();
    }
  }

  /**
   * Upload event data to Filebase
   */
  private async uploadToFilebase(
    eventId: string, 
    input: CreateEventInput, 
    userId: string
  ): Promise<{ metadataUrl?: string; imageUrl?: string } | null> {
    try {
      const filebaseClient = getFilebaseClient();

      // Prepare event metadata
      const eventMetadata = {
        id: eventId,
        title: input.title,
        description: input.description,
        location: input.location,
        startDate: input.startDate,
        endDate: input.endDate,
        maxCapacity: input.maxCapacity,
        ticketPrice: input.ticketPrice,
        requireApproval: input.requireApproval,
        hasPOAP: input.hasPOAP,
        poapMetadata: input.poapMetadata,
        visibility: input.visibility,
        timezone: input.timezone,
        category: input.category,
        tags: input.tags,
        creator: {
          id: userId,
          walletAddress: input.walletAddress,
        },
        createdAt: new Date().toISOString(),
        storageProvider: 'filebase',
      };

      // Upload metadata
      const metadataKey = generateEventMetadataKey(eventId);
      const metadataResult = await filebaseClient.uploadMetadata(metadataKey, eventMetadata);

      let imageUrl: string | undefined;

      // Upload banner image if provided
      if (input.bannerImage) {
        try {
          const imageResponse = await fetch(input.bannerImage);
          if (imageResponse.ok) {
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            const imageKey = generateEventImageKey(eventId, 'banner-image.webp');
            const imageResult = await filebaseClient.uploadImage(
              imageKey, 
              imageBuffer, 
              'image/jpeg',
              true, // Enable compression
              'banner' // Use banner compression preset
            );
            imageUrl = imageResult.url;
          }
        } catch (error) {
          console.warn('Failed to upload banner image to Filebase:', error);
        }
      }

      return {
        metadataUrl: metadataResult.url,
        imageUrl,
      };
    } catch (error) {
      console.warn('Filebase upload failed:', error);
      return null;
    }
  }

  /**
   * Create event on blockchain
   */
  private async createOnBlockchain(
    input: CreateEventInput,
    startTime: bigint,
    endTime: bigint,
    ticketPriceWei: bigint
  ): Promise<{ eventId: number; transactionHash: string; chainId: number; address: string } | null> {
    if (!input.privateKey || input.privateKey.trim() === '') {
      return null;
    }

    try {
      const contractParams: CreateEventParams = {
        title: input.title,
        description: input.description,
        location: input.location,
        startTime,
        endTime,
        maxCapacity: BigInt(input.maxCapacity),
        ticketPrice: ticketPriceWei,
        requireApproval: input.requireApproval,
        hasPOAP: input.hasPOAP,
        poapMetadata: input.poapMetadata || '',
      };

      const result = await createEventOnAvalanche(
        contractParams,
        input.privateKey,
        input.useTestnet
      );

      return {
        eventId: Number(result.eventId),
        transactionHash: result.transactionHash,
        chainId: input.useTestnet ? 43113 : 43114,
        address: input.walletAddress,
      };
    } catch (error) {
      console.warn('Blockchain creation failed:', error);
      return null;
    }
  }

  /**
   * Store event in database
   */
  private async storeInDatabase(
    input: CreateEventInput,
    userId: string,
    eventId: string,
    blockchainResult: { eventId: number; transactionHash: string; chainId: number; address: string } | null,
    filebaseResult: { metadataUrl?: string; imageUrl?: string } | null
  ): Promise<{ id: string; slug: string } | null> {
    if (!this.supabase) {
      return null;
    }

    try {
      const eventData = {
        title: input.title,
        description: input.description,
        location: input.location,
        start_date: input.startDate,
        end_date: input.endDate,
        max_capacity: input.maxCapacity,
        ticket_price: input.ticketPrice,
        require_approval: input.requireApproval,
        has_poap: input.hasPOAP,
        poap_metadata: input.poapMetadata || null,
        visibility: input.visibility,
        timezone: input.timezone,
        banner_image: input.bannerImage || null,
        category: input.category || null,
        tags: input.tags || [],
        creator_id: userId,
        status: 'active',
        contract_event_id: blockchainResult?.eventId,
        contract_address: blockchainResult?.address,
        contract_chain_id: blockchainResult?.chainId,
        filebase_metadata_url: filebaseResult?.metadataUrl,
        filebase_image_url: filebaseResult?.imageUrl,
        storage_provider: filebaseResult ? 'filebase' : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedEvent, error: dbError } = await this.supabase
        .from('events')
        .insert([eventData])
        .select('id')
        .single();

      if (dbError) {
        if (dbError.code === '42P01') {
          throw new Error('Events table not found');
        }
        throw new Error(`Failed to create event in database: ${dbError.message}`);
      }

      const slug = this.generateSlug(input.title);

      // Update with slug
      await this.supabase
        .from('events')
        .update({ slug })
        .eq('id', insertedEvent.id);

      return {
        id: insertedEvent.id,
        slug,
      };
    } catch (error) {
      console.warn('Database storage failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const eventService = new EventService();
