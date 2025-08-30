import { createClient } from '@supabase/supabase-js';
import { appConfig } from '@/lib/config/app-config';
import { pinataService } from '@/lib/clients/pinata-client';
import { 
  getActiveEventsFromAvalanche,
  getEventsByCreatorFromAvalanche
} from '@/lib/contracts/avalanche-client';
import type { EventData, CreateEventInput, EventSearchInput, TicketData } from '@/lib/services/core/interfaces';

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
  ipfs_metadata_url?: string;
  ipfs_image_url?: string;
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

      // Upload metadata and image to IPFS (Pinata)
      const { metadataUrl, imageUrl } = await this.uploadToIPFS(eventId, input);

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
        ipfsMetadataUrl: metadataUrl,
        ipfsImageUrl: imageUrl,
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
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<EventData | null> {
    try {
      // Get event from database
      const { data: event, error } = await this.supabase
        .from('events')
        .select(`
          *,
          users!events_creator_id_fkey (
            wallet_address,
            display_name,
            avatar_url
          )
        `)
        .eq('id', eventId)
        .single();

      if (error || !event) {
        return null;
      }

      // Convert to EventData format
      const eventData: EventData = {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.start_date,
        endDate: event.end_date,
        maxCapacity: event.max_capacity,
        currentAttendees: event.current_attendees || 0,
        ticketPrice: event.ticket_price,
        requireApproval: event.require_approval,
        hasPOAP: event.has_poap,
        poapMetadata: event.poap_metadata || '',
        visibility: event.visibility,
        timezone: event.timezone,
        bannerImage: await this.generateImageUrl(event.ipfs_image_url || event.banner_image) || undefined,
        category: event.category,
        tags: event.tags?.filter(Boolean) || [],
        creatorId: event.creator_id,
        status: event.status,
        contractEventId: event.contract_event_id,
        contractAddress: event.contract_address,
        contractChainId: event.contract_chain_id,
        ipfsMetadataUrl: event.ipfs_metadata_url,
        ipfsImageUrl: event.ipfs_image_url,
        storageProvider: event.storage_provider || 'database',
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      };

      return eventData;
    } catch (error) {
      console.error('Failed to get event by ID:', error);
      return null;
    }
  }

  /**
   * Generate IPFS URL for image access
   */
  private async generateImageUrl(imageUrl: string | null | undefined): Promise<string | null | undefined> {
    if (!imageUrl) return imageUrl;
    
    // If it's already an IPFS gateway URL, return as is
    if (imageUrl.includes('gateway.pinata.cloud') || imageUrl.includes('ipfs.io') || imageUrl.includes('ipfs://')) {
      return imageUrl;
    }

    // If it looks like an IPFS hash, convert to gateway URL
    if (imageUrl.match(/^Qm[a-zA-Z0-9]{44}$/) || imageUrl.match(/^[a-zA-Z0-9]{46,59}$/)) {
      return pinataService.getFileUrl(imageUrl);
    }

    // Otherwise return as is (could be a traditional URL)
    return imageUrl;
  }

  /**
   * Get user ticket for event
   */
  async getUserTicketForEvent(eventId: string, walletAddress: string): Promise<TicketData | null> {
    try {
      // First get the user ID for the wallet address
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (userError || !user) {
        return null;
      }

      // Then check for existing ticket using the user ID
      const { data: ticket, error } = await this.supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)
        .eq('attendee_id', user.id)
        .single();

      if (error || !ticket) {
        return null;
      }

      return ticket;
    } catch (error) {
      console.error('Failed to get user ticket for event:', error);
      return null;
    }
  }

  /**
   * Create ticket
   */
  async createTicket(ticketData: {
    eventId: string;
    attendeeId: string;
    attendeeName: string;
    attendeeEmail: string;
    pricePaid: string;
    ticketType: string;
    contractTicketId?: number;
    contractAddress?: string;
    contractChainId?: number;
    transactionHash?: string;
  }): Promise<TicketData> {
    try {
      const { data: ticket, error } = await this.supabase
        .from('tickets')
        .insert({
          event_id: ticketData.eventId,
          attendee_id: ticketData.attendeeId,
          // Note: attendee_name and attendee_email columns don't exist in current schema
          // These will be stored in the users table or as metadata
          price_paid: ticketData.pricePaid,
          ticket_type: ticketData.ticketType,
          contract_ticket_id: ticketData.contractTicketId,
          contract_address: ticketData.contractAddress,
          contract_chain_id: ticketData.contractChainId,
          transaction_hash: ticketData.transactionHash,
          is_approved: true,
          purchase_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Return ticket data with attendee info from the request
      return {
        ...ticket,
        attendee_name: ticketData.attendeeName,
        attendee_email: ticketData.attendeeEmail,
      };
    } catch (error) {
      console.error('Failed to create ticket:', error);
      
      // Handle specific database constraint violations
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string; message: string };
        
        if (dbError.code === '23505' && dbError.message.includes('tickets_event_id_attendee_id_key')) {
          throw new Error('You already have a ticket for this event');
        }
      }
      
      // Handle other constraint violations
      if (error instanceof Error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          throw new Error('You already have a ticket for this event');
        }
      }
      
      throw error;
    }
  }

  /**
   * Update event attendee count
   */
  async updateEventAttendeeCount(eventId: string, newCount: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('events')
        .update({ current_attendees: newCount })
        .eq('id', eventId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to update event attendee count:', error);
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
          ipfsMetadataUrl: undefined,
          ipfsImageUrl: undefined,
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
   * Upload event data to IPFS (Pinata)
   */
  private async uploadToIPFS(
    eventId: string,
    input: CreateEventInput
  ): Promise<{ metadataUrl: string; imageUrl?: string }> {
    try {
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

      // Upload metadata to IPFS
      const metadataResult = await pinataService.uploadEventMetadata(eventId, metadata);
      if (!metadataResult.success) {
        throw new Error(metadataResult.error || 'Failed to upload metadata to IPFS');
      }
      const metadataUrl = metadataResult.data!.url;

      // Upload image if provided
      let imageUrl: string | undefined;
      if (input.bannerImage) {
        try {
          if (typeof input.bannerImage === 'string') {
            // Handle base64 string (compressed image from client)
            const imageBuffer = Buffer.from(input.bannerImage, 'base64');
            const imageResult = await pinataService.uploadEventBanner(
              eventId,
              imageBuffer,
              'image/webp' // Assume compressed images are webp
            );
            if (imageResult.success) {
              imageUrl = imageResult.data!.url;
            }
          } else if (input.bannerImage instanceof File) {
            // Handle File object (compressed image from client)
            const imageBuffer = Buffer.from(await input.bannerImage.arrayBuffer());
            const imageResult = await pinataService.uploadEventBanner(
              eventId,
              imageBuffer,
              input.bannerImage.type || 'image/webp'
            );
            if (imageResult.success) {
              imageUrl = imageResult.data!.url;
            }
          }
        } catch (error) {
          console.error('Failed to upload image to IPFS:', error);
        }
      }

      return { metadataUrl, imageUrl };
    } catch (error) {
      console.error('Failed to upload to IPFS:', error);
      throw new Error(`Failed to upload to IPFS: ${error}`);
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
          ipfs_metadata_url: metadataUrl,
          ipfs_image_url: imageUrl,
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
  async getOrCreateUser(walletAddress: string): Promise<string> {
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
      
      // Generate presigned URLs for images
      const processedEvents = await Promise.all(
        mappedEvents.map(async (event) => ({
          ...event,
          bannerImage: await this.generateImageUrl(event.bannerImage) || undefined,
        }))
      );

      return {
        events: processedEvents,
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

      const mappedEvents = events?.map(event => this.mapDatabaseEventToEventData(event)) || [];
      
      // Generate presigned URLs for images
      const processedEvents = await Promise.all(
        mappedEvents.map(async (event) => ({
          ...event,
          bannerImage: await this.generateImageUrl(event.bannerImage) || undefined,
        }))
      );

      return processedEvents;
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
          ipfsMetadataUrl: undefined,
          ipfsImageUrl: undefined,
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
      bannerImage: event.ipfs_image_url || event.banner_image,
      category: event.category,
      tags: (event.tags || []).filter((tag): tag is string => tag !== null),
      creatorId: event.users?.wallet_address || event.creator_id,
      status: event.status,
      contractEventId: event.contract_event_id,
      contractAddress: event.contract_address,
      contractChainId: event.contract_chain_id,
      transactionHash: event.transaction_hash,
      ipfsMetadataUrl: event.ipfs_metadata_url,
      ipfsImageUrl: event.ipfs_image_url,
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
   * Generate IPFS metadata key
   */
  private generateEventMetadataKey(eventId: string): string {
    return `events/${eventId}/metadata.json`;
  }

  /**
   * Generate IPFS image key
   */
  private generateEventImageKey(eventId: string, filename: string): string {
    return `events/${eventId}/${filename}`;
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
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('events')
        .update({
          contract_event_id: contractEventId,
          transaction_hash: transactionHash,
          contract_address: contractAddress,
          contract_chain_id: contractChainId,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) {
        throw new Error(`Failed to update event with blockchain data: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update event with blockchain data:', error);
      throw error;
    }
  }

  /**
   * Update event with POAP information
   */
  async updateEventPOAPInfo(eventId: string, poapInfo: {
    poapEventId: number;
    poapSecretCode: string;
    poapDropCreated: boolean;
    poapDropCreatedAt: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('events')
        .update({
          poap_event_id: poapInfo.poapEventId,
          poap_secret_code: poapInfo.poapSecretCode,
          poap_drop_created: poapInfo.poapDropCreated,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to update event POAP info:', error);
      throw error;
    }
  }

  /**
   * Get user registration for an event
   */
  async getUserRegistration(eventId: string, userAddress: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('attendee_address', userAddress.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user registration:', error);
      return null;
    }
  }

  /**
   * Get user POAP for an event
   */
  async getUserPOAPForEvent(eventId: string, userAddress: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('poap_claims')
        .select('*')
        .eq('event_id', eventId)
        .eq('attendee_address', userAddress.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user POAP:', error);
      return null;
    }
  }

  /**
   * Create POAP claim record
   */
  async createPOAPClaim(claimData: {
    eventId: string;
    attendeeAddress: string;
    poapTokenId: number;
    poapEventId: number;
    transactionHash?: string;
    claimedAt: string;
  }): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('poap_claims')
        .insert({
          event_id: claimData.eventId,
          attendee_address: claimData.attendeeAddress.toLowerCase(),
          poap_token_id: claimData.poapTokenId,
          poap_event_id: claimData.poapEventId,
          transaction_hash: claimData.transactionHash,
          claimed_at: claimData.claimedAt,
          poap_url: `https://app.poap.xyz/token/${claimData.poapTokenId}`
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create POAP claim:', error);
      throw error;
    }
  }

  /**
   * Create registration record
   */
  async createRegistration(registrationData: {
    eventId: string;
    attendeeAddress: string;
    attendeeName: string;
    attendeeEmail: string;
    transactionHash: string;
    ticketTokenId?: number | null;
    amountPaid: string;
    registrationDate: string;
  }): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('registrations')
        .insert({
          event_id: registrationData.eventId,
          attendee_address: registrationData.attendeeAddress.toLowerCase(),
          attendee_name: registrationData.attendeeName,
          attendee_email: registrationData.attendeeEmail,
          transaction_hash: registrationData.transactionHash,
          ticket_token_id: registrationData.ticketTokenId,
          amount_paid: parseFloat(registrationData.amountPaid),
          registration_date: registrationData.registrationDate,
          is_verified: true // Auto-verify for now
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create registration:', error);
      throw error;
    }
  }

  /**
   * Get user tickets
   */
  async getUserTickets(userAddress: string, options?: { 
    includeMetadata?: boolean; 
    status?: string; 
  }): Promise<any[]> {
    try {
      let query = this.supabase
        .from('tickets')
        .select(`
          *,
          events (
            id,
            title,
            start_date,
            end_date,
            location
          )
        `)
        .eq('owner_address', userAddress.toLowerCase());

      if (options?.status === 'active') {
        query = query.eq('is_used', false);
      } else if (options?.status === 'used') {
        query = query.eq('is_used', true);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user tickets:', error);
      return [];
    }
  }
}
