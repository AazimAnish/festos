/**
 * Event Service
 *
 * This service handles all event-related business logic following clean code principles.
 * It separates business logic from data access and presentation layers.
 * Currently uses only Avalanche blockchain and Filebase for storage.
 */

import {
  getFilebaseClient,
  generateEventMetadataKey,
  generateEventImageKey,
} from '@/lib/filebase/client';
import { 
  createEventOnAvalanche, 
  getActiveEventsFromAvalanche
} from '@/lib/contracts/avalanche-client';
import type { CreateEventParams } from '@/lib/contracts/types/EventFactory';
import type { CreateEventInput, EventSearchInput } from '@/lib/schemas/event';
import { parseEther } from 'viem';
import { ValidationError } from '@/shared/utils/error-handler';

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
 * Handles event creation and retrieval using blockchain and Filebase only
 */
export class EventService {
  constructor() {
    // Service initialization
  }

  /**
   * Create a new event
   */
  async createEvent(input: CreateEventInput): Promise<EventCreationResult> {
    // Validate input
    if (!input.title || !input.description || !input.location) {
      throw new ValidationError('Title, description, and location are required');
    }

    // Parse dates
    const startTime = BigInt(Math.floor(new Date(input.startDate).getTime() / 1000));
    const endTime = BigInt(Math.floor(new Date(input.endDate).getTime() / 1000));
    
    if (startTime >= endTime) {
      throw new ValidationError('End date must be after start date');
    }

    // Convert ticket price to Wei
    const ticketPriceWei = parseEther(input.ticketPrice);

    // Generate unique event ID
    const eventId = this.generateEventId();

    // Use wallet address as userId (no database)
    const userId = input.walletAddress;

    // Upload to Filebase
    const filebaseResult = await this.uploadToFilebase(eventId, input, userId);

    // Create on blockchain
    const blockchainResult = await this.createOnBlockchain(
      input,
      startTime,
      endTime,
      ticketPriceWei
    );

    return {
      eventId: eventId,
      slug: this.generateSlug(input.title),
      contractEventId: blockchainResult?.eventId,
      transactionHash: blockchainResult?.transactionHash,
      filebaseMetadataUrl: filebaseResult?.metadataUrl,
      filebaseImageUrl: filebaseResult?.imageUrl,
      contractChainId: blockchainResult?.chainId,
      contractAddress: blockchainResult?.address,
      createdOn: {
        blockchain: blockchainResult !== null,
        database: false,
        filebase: filebaseResult !== null,
      },
    };
  }

  /**
   * List events with filters
   */
  async listEvents(filters: EventSearchInput): Promise<{
    events: EventData[];
    total: number;
    availableFilters: {
      categories: string[];
      locations: string[];
      priceRanges: { min: number; max: number };
    };
  }> {
    try {
      const blockchainResult = await this.getEventsFromBlockchain(filters, true);
      return {
        events: blockchainResult.events,
        total: blockchainResult.total,
        availableFilters: {
          categories: [],
          locations: [...new Set(blockchainResult.events.map(e => e.location))],
          priceRanges: this.calculatePriceRanges(blockchainResult.events),
        },
      };
    } catch {
      return {
        events: [],
        total: 0,
        availableFilters: { categories: [], locations: [], priceRanges: { min: 0, max: 0 } },
      };
    }
  }

  /**
   * Get event by ID (from blockchain)
   */
  async getEventById(eventId: string): Promise<EventData | null> {
    try {
      const events = await this.getEventsFromBlockchain({ page: 1, limit: 100 }, false);
      return events.events.find(event => event.id === eventId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get event by slug (from blockchain)
   */
  async getEventBySlug(slug: string): Promise<EventData | null> {
    try {
      const events = await this.getEventsFromBlockchain({ page: 1, limit: 100 }, false);
      return events.events.find(event => event.contractEventId?.toString() === slug) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get events by creator (from blockchain)
   */
  async getEventsByCreator(creatorId: string): Promise<EventData[]> {
    try {
      const events = await this.getEventsFromBlockchain({ page: 1, limit: 100 }, false);
      return events.events.filter(event => 
        event.creatorId.toLowerCase() === creatorId.toLowerCase()
      );
    } catch {
      return [];
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
  ): Promise<{
    eventId: number;
    transactionHash: string;
    chainId: number;
    address: string;
  } | null> {
    // Use private key from input or fallback to environment variable
    let privateKey = input.privateKey;
    if (!privateKey || privateKey.trim() === '') {
      privateKey = process.env.PRIVATE_KEY;
    }
    
    if (!privateKey || privateKey.trim() === '') {
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
        privateKey,
        input.useTestnet
      );

      return {
        eventId: Number(result.eventId),
        transactionHash: result.transactionHash,
        chainId: input.useTestnet ? 43113 : 43114,
        address: input.walletAddress,
      };
    } catch {
      return null;
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

      // Prepare metadata
      const metadata = {
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
        creatorId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Upload metadata
      const metadataKey = generateEventMetadataKey(eventId);
      const metadataResult = await filebaseClient.uploadMetadata(metadataKey, metadata);

      let imageUrl: string | undefined;
      if (input.bannerImage) {
        try {
          // Convert base64 to buffer
          const imageBuffer = Buffer.from(input.bannerImage.split(',')[1], 'base64');
          const imageKey = generateEventImageKey(eventId, 'banner.jpg');
          const imageResult = await filebaseClient.uploadImage(imageKey, imageBuffer, 'image/jpeg');
          imageUrl = imageResult.url;
        } catch {
          // Continue without image if upload fails
        }
      }

      return {
        metadataUrl: metadataResult.url,
        imageUrl,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get events from blockchain
   */
  private async getEventsFromBlockchain(
    filters: EventSearchInput,
    includeBlockchain: boolean
  ): Promise<{
    events: EventData[];
    total: number;
  }> {
    if (!includeBlockchain) {
      return { events: [], total: 0 };
    }

    try {
      const blockchainEvents = await getActiveEventsFromAvalanche(BigInt(0), BigInt(100), true);
      
      if (!blockchainEvents || blockchainEvents.length === 0) {
        // If no events found, return empty array
        return { events: [], total: 0 };
      }
      
      const events: EventData[] = blockchainEvents.map((event, index) => ({
        id: `blockchain-${event.eventId || index}`,
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: new Date(Number(event.startTime) * 1000).toISOString(),
        endDate: new Date(Number(event.endTime) * 1000).toISOString(),
        maxCapacity: Number(event.maxCapacity),
        ticketPrice: (Number(event.ticketPrice) / 1e18).toString(),
        requireApproval: event.requireApproval,
        hasPOAP: event.hasPOAP,
        poapMetadata: event.poapMetadata,
        visibility: 'public' as const,
        timezone: 'UTC',
        creatorId: event.creator || 'unknown',
        status: 'active',
        contractEventId: Number(event.eventId),
        contractAddress: event.creator,
        contractChainId: 43113,
        storageProvider: 'blockchain',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return {
        events,
        total: events.length,
      };
    } catch (error) {
      // Log the error for debugging but return empty array
      console.warn('Failed to fetch blockchain events:', error);
      return { events: [], total: 0 };
    }
  }

  /**
   * Calculate price ranges from events
   */
  private calculatePriceRanges(events: EventData[]): { min: number; max: number } {
    if (events.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = events.map(event => parseFloat(event.ticketPrice)).filter(price => !isNaN(price));
    
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now();
  }
}
