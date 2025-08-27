import { createClient } from '@supabase/supabase-js';
import { appConfig } from '@/lib/config/app-config';
import { getFilebaseClient } from '@/lib/filebase/client';
import { 
  getActiveEventsFromAvalanche,
  getEventsByCreatorFromAvalanche
} from '@/lib/contracts/avalanche-client';
import type { EventData, CreateEventInput, EventSearchInput } from '@/lib/services/core/interfaces';

// Extended filter interface for internal use
interface ExtendedEventFilters extends EventSearchInput {
  query?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
}

// Database event interface
interface DatabaseEventRow {
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

export class EventService {
  private supabase = createClient(
    appConfig.database.url!,
    appConfig.database.anonKey!
  );

  /**
   * Create a new event
   */
  async createEvent(input: CreateEventInput): Promise<EventData> {
    try {
      // Generate unique event ID
      const eventId = crypto.randomUUID();

      // Generate unique slug
      const slug = this.generateSlug(input.title);

      // Upload metadata and image to Filebase
      const { metadataUrl, imageUrl } = await this.uploadToFilebase(eventId, input);

      // Store event in database
      await this.storeInDatabase(eventId, slug, input, metadataUrl, imageUrl);

      // Create event data object
      const eventData: EventData = {
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
        poapMetadata: input.poapMetadata || '',
        visibility: input.visibility,
        timezone: input.timezone,
        bannerImage: imageUrl,
        category: input.category,
        tags: input.tags || [],
        creatorId: input.walletAddress,
        status: 'active',
        contractEventId: undefined,
        contractAddress: undefined,
        contractChainId: undefined,
        filebaseMetadataUrl: metadataUrl,
        filebaseImageUrl: imageUrl,
        storageProvider: 'database',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return eventData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * List events with optional blockchain integration
   */
  async listEvents(
    filters: ExtendedEventFilters,
    includeBlockchain: boolean = false
  ): Promise<{ events: EventData[]; total: number }> {
    try {
      // Get events from database
      const databaseResult = await this.getEventsFromDatabase(filters);
      
      let blockchainEvents: EventData[] = [];
      
      // Optionally get events from blockchain
      if (includeBlockchain) {
        try {
          blockchainEvents = await this.getEventsFromBlockchain(filters);
        } catch {
          // Continue with database events only
        }
      }

      // Combine and deduplicate events
      const allEvents = this.combineAndDeduplicateEvents(
        databaseResult.events,
        blockchainEvents
      );

      // Apply additional filters
      const filteredEvents = this.applyAdditionalFilters(allEvents, filters);

      return {
        events: filteredEvents,
        total: filteredEvents.length,
      };
    } catch (error) {
      console.error('Failed to list events:', error);
      throw error;
    }
  }

  /**
   * Get events by creator
   */
  async getEventsByCreator(creatorId: string): Promise<EventData[]> {
    try {
      // Get events from database
      const databaseEvents = await this.getEventsFromDatabaseByCreator(creatorId);
      
      // Get events from blockchain
      let blockchainEvents: EventData[] = [];
      try {
        const blockchainResult = await getEventsByCreatorFromAvalanche(creatorId as `0x${string}`, 0n, 100n, true); // Use testnet
        blockchainEvents = Array.from(blockchainResult).map(event => ({
          id: `blockchain-${event.eventId.toString()}`,
          title: event.title,
          description: event.description,
          location: event.location,
          startDate: new Date(Number(event.startTime) * 1000).toISOString(),
          endDate: new Date(Number(event.endTime) * 1000).toISOString(),
          maxCapacity: Number(event.maxCapacity),
          ticketPrice: event.ticketPrice.toString(),
          requireApproval: event.requireApproval,
          hasPOAP: event.hasPOAP,
          poapMetadata: event.poapMetadata,
          visibility: 'public' as const,
          timezone: 'UTC',
          bannerImage: undefined,
          category: undefined,
          tags: [],
          creatorId: event.creator.toLowerCase(),
          status: event.isActive ? 'active' : 'cancelled',
          contractEventId: Number(event.eventId),
          contractAddress: event.creator,
          contractChainId: 43113, // Fuji testnet
          filebaseMetadataUrl: undefined,
          filebaseImageUrl: undefined,
          storageProvider: 'blockchain',
          createdAt: new Date(Number(event.createdAt) * 1000).toISOString(),
          updatedAt: new Date(Number(event.updatedAt) * 1000).toISOString(),
        }));
      } catch (error) {
        console.error('Failed to fetch blockchain events by creator:', error);
      }

      // Combine and deduplicate
      const allEvents = this.combineAndDeduplicateEvents(databaseEvents, blockchainEvents);
      
      return allEvents;
    } catch (error) {
      console.error('Failed to get events by creator:', error);
      throw error;
    }
  }

  /**
   * Upload event data to Filebase
   */
  private async uploadToFilebase(
    eventId: string,
    input: CreateEventInput
  ): Promise<{ metadataUrl: string; imageUrl?: string }> {
    try {
      const filebaseClient = getFilebaseClient();

      // Prepare metadata
      const metadata = {
        eventId,
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
        creatorId: input.walletAddress,
        createdAt: new Date().toISOString(),
      };

      // Upload metadata
      const metadataKey = this.generateEventMetadataKey(eventId);
      const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
      const metadataResult = await filebaseClient.uploadFile(
        metadataKey,
        metadataBuffer,
        'application/json'
      );
      const metadataUrl = metadataResult.url;

      // Upload image if provided
      let imageUrl: string | undefined;
      if (input.bannerImage && typeof input.bannerImage === 'string') {
        try {
          const imageKey = this.generateEventImageKey(eventId, 'banner.jpg');
          const imageBuffer = Buffer.from(input.bannerImage as string, 'base64');
          const imageResult = await filebaseClient.uploadImage(
            imageKey,
            imageBuffer,
            'image/jpeg'
          );
          imageUrl = imageResult.url;
        } catch (error) {
          console.error('Failed to upload image to Filebase:', error);
        }
      }

      return { metadataUrl, imageUrl };
    } catch (error) {
      console.error('Failed to upload to Filebase:', error);
      throw new Error(`Failed to upload to Filebase: ${error}`);
    }
  }

  /**
   * Store event in database
   */
  private async storeInDatabase(
    eventId: string,
    slug: string,
    input: CreateEventInput,
    metadataUrl: string,
    imageUrl?: string
  ): Promise<boolean> {
    try {
      // Get or create user
      const userId = await this.getOrCreateUser(input.walletAddress);

      const { error } = await this.supabase
        .from('events')
        .insert({
          id: eventId,
          slug,
          title: input.title,
          description: input.description,
          location: input.location,
          start_date: input.startDate,
          end_date: input.endDate,
          max_capacity: input.maxCapacity,
          ticket_price: input.ticketPrice,
          require_approval: input.requireApproval,
          has_poap: input.hasPOAP,
          poap_metadata: input.poapMetadata || '',
          visibility: input.visibility,
          timezone: input.timezone,
          banner_image: imageUrl,
          category: input.category,
          tags: input.tags || [],
          creator_id: userId,
          status: 'active',
          filebase_metadata_url: metadataUrl,
          filebase_image_url: imageUrl,
        });

      if (error) {
        throw new Error(`Failed to store event in database: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to store event in database:', error);
      throw error;
    }
  }

  /**
   * Get or create user in database
   */
  private async getOrCreateUser(walletAddress: string): Promise<string> {
    try {
      // Check if user exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        return existingUser.id;
      }

      // Create new user
      const { data: newUser, error: insertError } = await this.supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          display_name: `User ${walletAddress.slice(0, 8)}`,
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to create user: ${insertError.message}`);
      }

      return newUser.id;
    } catch (error) {
      console.error('Failed to get or create user:', error);
      throw error;
    }
  }

  /**
   * Get events from database
   */
  private async getEventsFromDatabase(filters: ExtendedEventFilters): Promise<{ events: EventData[]; total: number }> {
    try {
      let query = this.supabase
        .from('events')
        .select(`
          *,
          users!events_creator_id_fkey (
            wallet_address,
            display_name,
            avatar_url
          )
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate);
      }

      // Apply pagination
      const offset = ((filters.page || 1) - 1) * (filters.limit || 10);
      query = query.range(offset, offset + (filters.limit || 10) - 1);

      const { data: events, error, count } = await query;

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      const mappedEvents = events?.map(event => this.mapDatabaseEventToEventData(event)) || [];

      return {
        events: mappedEvents,
        total: count || 0,
      };
    } catch (error) {
      console.error('Failed to get events from database:', error);
      return { events: [], total: 0 };
    }
  }

  /**
   * Get events from database by creator
   */
  private async getEventsFromDatabaseByCreator(creatorId: string): Promise<EventData[]> {
    try {
      const { data: events, error } = await this.supabase
        .from('events')
        .select(`
          *,
          users!events_creator_id_fkey (
            wallet_address,
            display_name,
            avatar_url
          )
        `)
        .eq('creator_id', creatorId)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return events?.map(event => this.mapDatabaseEventToEventData(event)) || [];
    } catch (error) {
      console.error('Failed to get events by creator from database:', error);
      return [];
    }
  }

  /**
   * Get events from blockchain
   */
  private async getEventsFromBlockchain(filters: ExtendedEventFilters): Promise<EventData[]> {
    try {
      const blockchainEvents = await getActiveEventsFromAvalanche(
        BigInt(((filters.page || 1) - 1) * (filters.limit || 10)),
        BigInt(filters.limit || 10),
        true // Use testnet by default
      );

      const events: EventData[] = Array.from(blockchainEvents)
        .filter((event) => event.eventId !== 0n)
        .map((event) => ({
          id: `blockchain-${event.eventId.toString()}`,
          title: event.title,
          description: event.description,
          location: event.location,
          startDate: new Date(Number(event.startTime) * 1000).toISOString(),
          endDate: new Date(Number(event.endTime) * 1000).toISOString(),
          maxCapacity: Number(event.maxCapacity),
          ticketPrice: event.ticketPrice.toString(),
          requireApproval: event.requireApproval,
          hasPOAP: event.hasPOAP,
          poapMetadata: event.poapMetadata,
          visibility: 'public',
          timezone: 'UTC',
          bannerImage: undefined,
          category: undefined,
          tags: [],
          creatorId: event.creator.toLowerCase(),
          status: event.isActive ? 'active' : 'cancelled',
          contractEventId: Number(event.eventId),
          contractAddress: event.creator,
          contractChainId: 43113, // Fuji testnet
          filebaseMetadataUrl: undefined,
          filebaseImageUrl: undefined,
          storageProvider: 'blockchain',
          createdAt: new Date(Number(event.createdAt) * 1000).toISOString(),
          updatedAt: new Date(Number(event.updatedAt) * 1000).toISOString(),
        }));

      return events;
    } catch (error) {
      console.error('Failed to get events from blockchain:', error);
      return [];
    }
  }

  /**
   * Map database event to EventData
   */
  private mapDatabaseEventToEventData(event: DatabaseEventRow): EventData {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      maxCapacity: event.max_capacity,
      ticketPrice: event.ticket_price,
      requireApproval: event.require_approval,
      hasPOAP: event.has_poap,
      poapMetadata: event.poap_metadata,
      visibility: event.visibility,
      timezone: event.timezone,
      bannerImage: event.banner_image,
      category: event.category,
      tags: (event.tags || []).filter((tag): tag is string => tag !== null),
      creatorId: event.users?.wallet_address || event.creator_id,
      status: event.status,
      contractEventId: event.contract_event_id,
      contractAddress: event.contract_address,
      contractChainId: event.contract_chain_id,
      transactionHash: event.transaction_hash,
      filebaseMetadataUrl: event.filebase_metadata_url,
      filebaseImageUrl: event.filebase_image_url,
      storageProvider: 'database',
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    };
  }

  /**
   * Combine and deduplicate events from different sources
   */
  private combineAndDeduplicateEvents(
    databaseEvents: EventData[],
    blockchainEvents: EventData[]
  ): EventData[] {
    const allEvents = [...databaseEvents];
    
    // Add blockchain events that don't exist in database
    for (const blockchainEvent of blockchainEvents) {
      const exists = allEvents.some(dbEvent => 
        dbEvent.contractEventId === blockchainEvent.contractEventId ||
        dbEvent.title === blockchainEvent.title
      );
      
      if (!exists) {
        allEvents.push(blockchainEvent);
      }
    }

    return allEvents;
  }

  /**
   * Apply additional filters to events
   */
  private applyAdditionalFilters(events: EventData[], filters: ExtendedEventFilters): EventData[] {
    let filteredEvents = events;

    // Filter by price range
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) {
      filteredEvents = filteredEvents.filter(event => {
        const price = parseFloat(event.ticketPrice);
        if (filters.priceRange!.min !== undefined && price < filters.priceRange!.min) return false;
        if (filters.priceRange!.max !== undefined && price > filters.priceRange!.max) return false;
        return true;
      });
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filteredEvents = filteredEvents.filter(event =>
        filters.tags!.some((tag: string) => (event.tags || []).includes(tag))
      );
    }

    return filteredEvents;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate unique slug
   */
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${baseSlug}-${timestamp}`;
  }

  /**
   * Generate Filebase metadata key
   */
  private generateEventMetadataKey(eventId: string): string {
    return `events/${eventId}/metadata.json`;
  }

  /**
   * Generate Filebase image key
   */
  private generateEventImageKey(eventId: string, filename: string): string {
    return `events/${eventId}/${filename}`;
  }
}
