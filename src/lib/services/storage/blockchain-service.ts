/**
 * Blockchain Service - Immutable Layer
 * 
 * Handles all Avalanche blockchain operations for event creation,
 * ticket ownership, and transaction verification.
 */

import { 
  StorageProvider, 
  HealthStatus, 
  EventData, 
  CreateEventInput,
  EventSearchInput,
  EventSearchResult,
  StorageOperationResult,
  BlockchainTransactionResult,
  ValidationError
} from '../core/interfaces';
import {
  createAvalanchePublicClient,
  getAvalancheFujiEventFactoryContract,
  createEventOnAvalanche,
  getActiveEventsFromAvalanche,
  getEventsByCreatorFromAvalanche
} from '@/lib/contracts/avalanche-client';
import { parseEther } from 'viem';
import type { CreateEventParams } from '@/lib/contracts/types/EventFactory';
import type { TransactionSigningData } from '@/lib/services/frontend/user-wallet-service';

export class BlockchainService implements StorageProvider {
  readonly name = 'Avalanche Blockchain';
  readonly type = 'blockchain' as const;
  
  private healthCheckCache: { status: HealthStatus; timestamp: number } | null = null;
  private readonly HEALTH_CACHE_DURATION = 60000; // 1 minute

  constructor() {}

  /**
   * Health check for blockchain connectivity
   */
  async healthCheck(): Promise<HealthStatus> {
    const now = Date.now();
    
    // Return cached result if still valid
    if (this.healthCheckCache && (now - this.healthCheckCache.timestamp) < this.HEALTH_CACHE_DURATION) {
      return this.healthCheckCache.status;
    }

    const startTime = Date.now();
    
    try {
      // Test blockchain connectivity by getting latest block
      const publicClient = createAvalanchePublicClient();
      const blockNumber = await publicClient.getBlockNumber();
      
      const responseTime = Date.now() - startTime;
      
      const status: HealthStatus = {
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          latestBlock: blockNumber.toString(),
          network: 'Avalanche C-Chain'
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
   * Get blockchain configuration
   */
  getConfig(): Record<string, unknown> {
    return {
      network: 'Avalanche Fuji Testnet',
      rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL,
      chainId: 43113,
      hasContractAddress: !!process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS
    };
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const publicClient = createAvalanchePublicClient();
      const balance = await publicClient.getBalance({ address: walletAddress as `0x${string}` });
      return Number(balance) / Math.pow(10, 18); // Convert from wei to AVAX
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return 0;
    }
  }

  /**
   * Get network ID
   */
  async getNetworkId(): Promise<number> {
    try {
      const publicClient = createAvalanchePublicClient();
      const chainId = await publicClient.getChainId();
      return chainId;
    } catch (error) {
      console.error('Failed to get network ID:', error);
      return 0;
    }
  }

  /**
   * Prepare transaction for user signing
   */
  async prepareCreateEventTransaction(
    input: CreateEventInput,
    metadataUri: string,
    userWalletAddress: string
  ): Promise<TransactionSigningData> {
    try {
      // Parse dates
      const startTimeUnix = BigInt(Math.floor(new Date(input.startDate).getTime() / 1000));
      const endTimeUnix = BigInt(Math.floor(new Date(input.endDate).getTime() / 1000));
      
      if (startTimeUnix >= endTimeUnix) {
        throw new ValidationError('End date must be after start date');
      }

      // Convert ticket price to Wei
      const ticketPriceWei = parseEther(input.ticketPrice);

      // Create event parameters
      const eventParams: CreateEventParams = {
        title: input.title,
        description: input.description,
        location: input.location,
        startTime: startTimeUnix,
        endTime: endTimeUnix,
        maxCapacity: BigInt(input.maxCapacity),
        ticketPrice: ticketPriceWei,
        requireApproval: input.requireApproval,
        hasPOAP: input.hasPOAP,
        poapMetadata: input.poapMetadata || ''
      };

      // Get contract instance
      const contract = getAvalancheFujiEventFactoryContract();
      
      // Prepare transaction data with BigInt values converted to strings for JSON serialization
      const transactionData = {
        address: contract.address,
        abi: contract.abi,
        functionName: 'createEvent',
        args: [
          eventParams.title,
          eventParams.description,
          eventParams.location,
          eventParams.startTime.toString(), // Convert BigInt to string
          eventParams.endTime.toString(), // Convert BigInt to string
          eventParams.maxCapacity.toString(), // Convert BigInt to string
          eventParams.ticketPrice.toString(), // Convert BigInt to string
          eventParams.requireApproval,
          eventParams.hasPOAP,
          eventParams.poapMetadata,
        ] as const,
        account: userWalletAddress as `0x${string}`,
        chainId: 43113, // Avalanche Fuji testnet
      };

      return transactionData;

    } catch (error) {
      throw new ValidationError(
        `Failed to prepare transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sign transaction with user wallet
   */
  async signTransactionWithUserWallet(
    _transactionData: TransactionSigningData,
    _userWalletAddress: string
  ): Promise<{
    transactionHash: string;
    eventId: number;
    contractAddress: string;
    chainId: number;
    userSignature: string;
  }> {
    try {
      // This method will be implemented to work with user's wallet
      // For now, we'll throw an error indicating this needs frontend implementation
      throw new Error('User wallet signing must be implemented in frontend');
    } catch (error) {
      throw new ValidationError(
        `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create event on blockchain
   */
  async createEvent(
    input: CreateEventInput,
    _metadataUri: string
  ): Promise<StorageOperationResult<BlockchainTransactionResult>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!input.privateKey) {
        throw new ValidationError('Private key is required for blockchain operations');
      }

      if (!input.title || !input.description || !input.location) {
        throw new ValidationError('Title, description, and location are required');
      }

      // Parse dates
      const startTimeUnix = BigInt(Math.floor(new Date(input.startDate).getTime() / 1000));
      const endTimeUnix = BigInt(Math.floor(new Date(input.endDate).getTime() / 1000));
      
      if (startTimeUnix >= endTimeUnix) {
        throw new ValidationError('End date must be after start date');
      }

      // Convert ticket price to Wei
      const ticketPriceWei = parseEther(input.ticketPrice);

      // Create event parameters
      const eventParams: CreateEventParams = {
        title: input.title,
        description: input.description,
        location: input.location,
        startTime: startTimeUnix,
        endTime: endTimeUnix,
        maxCapacity: BigInt(input.maxCapacity),
        ticketPrice: ticketPriceWei,
        requireApproval: input.requireApproval,
        hasPOAP: input.hasPOAP,
        poapMetadata: input.poapMetadata || ''
      };

      // Create event on blockchain (using testnet since we're on Fuji)
      const result = await createEventOnAvalanche(eventParams, input.privateKey, true);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          transactionHash: result.transactionHash,
          eventId: Number(result.eventId),
          contractAddress: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS || '0xa81684e63745b8d74057da2eeac655590fb4c7ea',
          contractChainId: 43113, // Fuji testnet chain ID
          status: 'success' as const
        },
        metadata: {
          operationId: `bc_create_${Date.now()}`,
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
          operationId: `bc_create_${Date.now()}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Get events from blockchain
   */
  async getEvents(filters: EventSearchInput): Promise<StorageOperationResult<EventSearchResult>> {
    const startTime = Date.now();
    
    try {
      let events: EventData[] = [];

      // Get active events from blockchain
      if (filters.status === 'active' || !filters.status) {
        const activeEvents = await getActiveEventsFromAvalanche(0n, 100n, true);
        // Transform blockchain events to EventData format
        const transformedActiveEvents = activeEvents.map(event => ({
          id: event.eventId.toString(),
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
          tags: undefined,
          creatorId: event.creator,
          status: event.isActive ? 'active' : 'inactive',
          contractEventId: Number(event.eventId),
          contractAddress: undefined,
          contractChainId: undefined,
          ipfsMetadataUrl: undefined,
          ipfsImageUrl: undefined,
          storageProvider: 'blockchain',
          createdAt: new Date(Number(event.createdAt) * 1000).toISOString(),
          updatedAt: new Date(Number(event.updatedAt) * 1000).toISOString(),
        }));
        events = [...events, ...transformedActiveEvents];
      }

      // Get events by creator if specified
      if (filters.creatorId) {
        const creatorEvents = await getEventsByCreatorFromAvalanche(filters.creatorId as `0x${string}`, 0n, 100n, true);
        // Transform blockchain events to EventData format
        const transformedCreatorEvents = creatorEvents.map(event => ({
          id: event.eventId.toString(),
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
          tags: undefined,
          creatorId: event.creator,
          status: event.isActive ? 'active' : 'inactive',
          contractEventId: Number(event.eventId),
          contractAddress: undefined,
          contractChainId: undefined,
          ipfsMetadataUrl: undefined,
          ipfsImageUrl: undefined,
          storageProvider: 'blockchain',
          createdAt: new Date(Number(event.createdAt) * 1000).toISOString(),
          updatedAt: new Date(Number(event.updatedAt) * 1000).toISOString(),
        }));
        events = [...events, ...transformedCreatorEvents];
      }

      // Apply filters
      let filteredEvents = events;

      if (filters.category) {
        filteredEvents = filteredEvents.filter(event => 
          event.category?.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      if (filters.location) {
        filteredEvents = filteredEvents.filter(event => 
          event.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.startDate) >= new Date(filters.startDate!)
        );
      }

      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.endDate) <= new Date(filters.endDate!)
        );
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'startDate';
      const order = filters.order || 'asc';
      
      filteredEvents.sort((a, b) => {
        const aValue = a[sortBy as keyof EventData];
        const bValue = b[sortBy as keyof EventData];
        
        let aComparable: number;
        let bComparable: number;
        
        if (sortBy === 'startDate' || sortBy === 'endDate') {
          aComparable = new Date(aValue as string).getTime();
          bComparable = new Date(bValue as string).getTime();
        } else if (sortBy === 'ticketPrice') {
          aComparable = parseFloat(aValue as string);
          bComparable = parseFloat(bValue as string);
        } else {
          // For other fields, convert to string for comparison
          aComparable = String(aValue).localeCompare(String(bValue));
          bComparable = 0;
          return order === 'asc' ? aComparable : -aComparable;
        }
        
        if (order === 'asc') {
          return aComparable > bComparable ? 1 : -1;
        } else {
          return aComparable < bComparable ? 1 : -1;
        }
      });

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);

      // Get available filters
      const availableFilters = this.getAvailableFilters(events);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          events: paginatedEvents,
          total: filteredEvents.length,
          page,
          limit,
          hasMore: filteredEvents.length > page * limit,
          availableFilters
        },
        metadata: {
          operationId: `bc_search_${Date.now()}`,
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
          operationId: `bc_search_${Date.now()}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Get event by contract ID
   */
  async getEventByContractId(contractEventId: number): Promise<StorageOperationResult<EventData>> {
    const startTime = Date.now();
    
    try {
      // Get contract instance (using Fuji testnet since we're on testnet)
      const contract = getAvalancheFujiEventFactoryContract();
      
      // Get event details from contract
      const eventDetails = await contract.publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'getEvent',
        args: [BigInt(contractEventId)]
      });

      if (!eventDetails) {
        return {
          success: false,
          error: 'Event not found on blockchain',
          metadata: {
            operationId: `bc_get_${contractEventId}`,
            timestamp: new Date(),
            provider: this.name,
            responseTime: Date.now() - startTime
          }
        };
      }

      // Transform blockchain event to EventData format
      const event = this.transformBlockchainEvent(eventDetails, contractEventId);
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: event,
        metadata: {
          operationId: `bc_get_${contractEventId}`,
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
          operationId: `bc_get_${contractEventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(transactionHash: string): Promise<StorageOperationResult<{
    status: 'success' | 'failed' | 'pending';
    blockNumber?: number;
    gasUsed?: string;
  }>> {
    const startTime = Date.now();
    
    try {
      const publicClient = createAvalanchePublicClient();
      
      // Get transaction receipt
      const receipt = await publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          status: receipt.status === 'success' ? 'success' : 'failed',
          blockNumber: Number(receipt.blockNumber),
          gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : undefined
        },
        metadata: {
          operationId: `bc_verify_${transactionHash}`,
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
          operationId: `bc_verify_${transactionHash}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Get available filters from blockchain events
   */
  private getAvailableFilters(events: EventData[]): {
    categories: string[];
    locations: string[];
    priceRanges: { min: number; max: number };
  } {
    const categories = [...new Set(events.map(e => e.category).filter((c): c is string => Boolean(c)))];
    const locations = [...new Set(events.map(e => e.location))];
    
    const priceValues = events
      .map(e => parseFloat(e.ticketPrice))
      .filter(p => !isNaN(p));
    
    const priceRanges = {
      min: priceValues.length > 0 ? Math.min(...priceValues) : 0,
      max: priceValues.length > 0 ? Math.max(...priceValues) : 0
    };

    return {
      categories,
      locations,
      priceRanges
    };
  }

  /**
   * Transform blockchain event to EventData format
   */
  private transformBlockchainEvent(eventDetails: readonly [bigint, `0x${string}`, string, string, string, bigint, bigint, bigint, bigint, bigint, boolean, boolean, boolean, string, bigint, bigint], contractEventId: number): EventData {
    const [, creator, title, description, location, startTime, endTime, maxCapacity, , ticketPrice, isActive, requireApproval, hasPOAP, poapMetadata, createdAt, updatedAt] = eventDetails;

    return {
      id: `bc_${contractEventId}`,
      title,
      description,
      location,
      startDate: new Date(Number(startTime) * 1000).toISOString(),
      endDate: new Date(Number(endTime) * 1000).toISOString(),
      maxCapacity: Number(maxCapacity),
      ticketPrice: ticketPrice.toString(),
      requireApproval,
      hasPOAP,
      poapMetadata,
      visibility: 'public' as const, // Blockchain doesn't store visibility
      timezone: 'UTC', // Blockchain doesn't store timezone
      bannerImage: undefined, // Not stored on blockchain
      category: undefined, // Not stored on blockchain
      tags: undefined, // Not stored on blockchain
      creatorId: creator,
      status: isActive ? 'active' : 'inactive',
      contractEventId,
      contractAddress: undefined, // Not available in this context
      contractChainId: 43114,
      ipfsMetadataUrl: undefined, // Not stored on blockchain
      ipfsImageUrl: undefined, // Not stored on blockchain
      storageProvider: 'blockchain',
      createdAt: new Date(Number(createdAt) * 1000).toISOString(),
      updatedAt: new Date(Number(updatedAt) * 1000).toISOString()
    };
  }
}
