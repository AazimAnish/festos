/**
 * Fixed Event Orchestrator - User Wallet Signing with Blockchain-First Approach
 * 
 * This version ensures:
 * 1. User must sign transactions with their own wallet
 * 2. Blockchain is the source of truth
 * 3. Proper rollback mechanisms for all layers
 * 4. Consistency checks and cleanup for orphaned records
 */

import { 
  CreateEventInput,
  EventSearchInput,
  EventSearchResult,
  EventCreationResult,
  EventData,
  StorageError,
  ValidationError
} from '../core/interfaces';
import { DatabaseService } from '../storage/database-service';
import { BlockchainService } from '../storage/blockchain-service';
import { IPFSService } from '../storage/ipfs-service';
import { appConfig } from '@/lib/config/app-config';
import type { TransactionSigningData } from '@/lib/services/frontend/user-wallet-service';

interface TransactionState {
  eventId: string;
  slug: string;
  ipfsMetadataUrl?: string;
  ipfsImageUrl?: string;
  blockchainTxHash?: string;
  blockchainEventId?: number;
  contractAddress?: string;
  contractChainId?: number;
  databaseRecordId?: string;
  rollbackActions: Array<() => Promise<void>>;
  userWalletAddress: string;
}

interface UserSignedTransaction {
  transactionHash: string;
  eventId: number;
  contractAddress: string;
  chainId: number;
  userSignature: string;
}

export class EventOrchestrator {
  private databaseService: DatabaseService;
  private blockchainService: BlockchainService;
  private ipfsService: IPFSService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.blockchainService = new BlockchainService();
    this.ipfsService = new IPFSService();
  }

  /**
   * Create event with user wallet signing - Blockchain First Approach
   * 
   * Flow:
   * 1. Validate input and user wallet
   * 2. Upload metadata to IPFS
   * 3. Prepare transaction for user signing
   * 4. Return transaction data for frontend signing
   */
  async prepareEventCreation(input: CreateEventInput): Promise<{
    eventId: string;
    slug: string;
    transactionData: Record<string, unknown>;
    ipfsMetadataUrl: string;
    ipfsImageUrl?: string;
  }> {
    const eventId = this.generateEventId();
    const slug = this.generateSlug(input.title);
    
    const state: TransactionState = {
      eventId,
      slug,
      rollbackActions: [],
      userWalletAddress: input.walletAddress
    };

    try {
      // Phase 1: Pre-validation
      await this.validateInput(input);
      await this.validateUserWallet(input.walletAddress);
      await this.checkSystemHealth();

      // Phase 2: IPFS Upload (Media Layer)
      await this.executeIPFSPhase(input, state);

      // Phase 3: Prepare transaction for user signing
      const transactionData = await this.prepareTransactionForSigning(input, state);

      // Convert any remaining BigInt values to strings for JSON serialization
      const serializableTransactionData = this.convertBigIntToStrings(transactionData) as Record<string, unknown>;

      return {
        eventId: state.eventId,
        slug: state.slug,
        transactionData: serializableTransactionData,
        ipfsMetadataUrl: state.ipfsMetadataUrl!,
        ipfsImageUrl: state.ipfsImageUrl
      };

    } catch (error) {
      // Execute rollback if any phase fails
      await this.executeRollback(state);
      throw error;
    }
  }

  /**
   * Complete event creation - Step 2: Verify blockchain and store in database
   * 
   * This method handles the second part of event creation after user signs:
   * 1. Verify blockchain creation
   * 2. Store in database with blockchain proof
   * 3. Verify consistency across all layers
   */
  async completeEventCreation(
    input: CreateEventInput,
    signedTransaction: UserSignedTransaction,
    eventId: string,
    slug: string,
    ipfsMetadataUrl: string,
    ipfsImageUrl?: string
  ): Promise<EventCreationResult> {
    const state: TransactionState = {
      eventId,
      slug,
      rollbackActions: [],
      userWalletAddress: input.walletAddress,
      ipfsMetadataUrl,
      ipfsImageUrl
    };

    try {
      // Phase 1: Verify blockchain creation
      await this.verifyBlockchainCreation(signedTransaction, state);

      // Phase 2: Store in database with blockchain proof
      await this.executeDatabasePhase(input, state);

      // Phase 3: Cross-Layer Verification
      await this.verifyConsistency(state);

      return this.buildSuccessResult(state);

    } catch (error) {
      // Execute rollback if any phase fails
      await this.executeRollback(state);
      return this.buildErrorResult(state, error);
    }
  }

  /**
   * Convert BigInt values to strings for JSON serialization
   */
  private convertBigIntToStrings(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertBigIntToStrings(item));
    }
    
    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.convertBigIntToStrings(value);
      }
      return result;
    }
    
    return obj;
  }

  /**
   * Phase 1: Validate input and user wallet
   */
  private async validateInput(input: CreateEventInput): Promise<void> {
    if (!input.title || !input.description || !input.location) {
      throw new ValidationError('Title, description, and location are required');
    }

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    if (startDate >= endDate) {
      throw new ValidationError('End date must be after start date');
    }

    if (startDate <= new Date()) {
      throw new ValidationError('Event must start in the future');
    }

    const ticketPrice = parseFloat(input.ticketPrice);
    if (isNaN(ticketPrice) || ticketPrice < 0) {
      throw new ValidationError('Invalid ticket price');
    }

    if (input.maxCapacity < 1 || input.maxCapacity > 1000000) {
      throw new ValidationError('Max capacity must be between 1 and 1,000,000');
    }

    if (!input.walletAddress || !input.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new ValidationError('Valid wallet address is required');
    }

    // Ensure no private key is provided - user must sign with their wallet
    if (input.privateKey) {
      throw new ValidationError('Private key should not be provided - user must sign with their wallet');
    }
  }

  /**
   * Validate user wallet and ensure it's connected
   */
  private async validateUserWallet(walletAddress: string): Promise<void> {
    // Check if wallet has sufficient balance for transaction
    const balance = await this.blockchainService.getWalletBalance(walletAddress);
    if (balance < 0.01) { // Minimum balance for transaction fees
      throw new ValidationError('Insufficient wallet balance for transaction fees');
    }

    // Verify wallet is on correct network
    const networkId = await this.blockchainService.getNetworkId();
    const validChainIds = [appConfig.blockchain.avalanche.mainnet.chainId, appConfig.blockchain.avalanche.testnet.chainId];
    if (!validChainIds.includes(networkId as 43114 | 43113)) {
      throw new ValidationError(`Wallet must be connected to Avalanche network (Mainnet or Testnet)`);
    }
  }

  /**
   * Check system health before proceeding
   */
  private async checkSystemHealth(): Promise<void> {
    const [dbHealth, bcHealth, ipfsHealth] = await Promise.all([
      this.databaseService.healthCheck(),
      this.blockchainService.healthCheck(),
      this.ipfsService.healthCheck()
    ]);

    if (dbHealth.status === 'unhealthy') {
      throw new StorageError('Database is unhealthy', 'database', 'health_check');
    }

    if (bcHealth.status === 'unhealthy') {
      throw new StorageError('Blockchain is unhealthy', 'blockchain', 'health_check');
    }

    if (ipfsHealth.status === 'unhealthy') {
      throw new StorageError('IPFS is unhealthy', 'ipfs', 'health_check');
    }
  }

  /**
   * Phase 2: Upload to IPFS
   */
  private async executeIPFSPhase(input: CreateEventInput, state: TransactionState): Promise<void> {
    try {
      // Upload metadata first
      const metadata = {
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
        creatorWalletAddress: input.walletAddress,
        eventId: state.eventId,
        version: '2.0'
      };

      const metadataResult = await this.ipfsService.uploadEventMetadata(state.eventId, metadata);
      
      if (!metadataResult.success || !metadataResult.data) {
        throw new StorageError(
          metadataResult.error || 'Failed to upload metadata',
          'ipfs',
          'upload_metadata'
        );
      }

      state.ipfsMetadataUrl = metadataResult.data.url;
      
      // Add rollback action for metadata
      state.rollbackActions.push(async () => {
        if (state.ipfsMetadataUrl) {
          await this.ipfsService.deleteFile(`events/${state.eventId}/metadata-${Date.now()}.json`);
        }
      });

      // Upload banner image if provided
      if (input.bannerImage && typeof input.bannerImage !== 'string' && input.bannerImage instanceof File) {
        const imageBuffer = Buffer.from(await input.bannerImage.arrayBuffer());
        const imageResult = await this.ipfsService.uploadEventBanner(
          state.eventId,
          imageBuffer,
          input.bannerImage.type || 'image/jpeg'
        );
        
        if (imageResult.success && imageResult.data) {
          state.ipfsImageUrl = imageResult.data.url;
          
          // Add rollback action for image
          state.rollbackActions.push(async () => {
            if (state.ipfsImageUrl && input.bannerImage && typeof input.bannerImage !== 'string' && input.bannerImage instanceof File) {
              await this.ipfsService.deleteFile(`events/${state.eventId}/banner-${Date.now()}.${this.getFileExtension(input.bannerImage.type)}`);
            }
          });
        }
      }

    } catch (error) {
      throw new StorageError(
        `IPFS phase failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ipfs',
        'upload_phase'
      );
    }
  }

  /**
   * Phase 3: Prepare transaction for user signing
   */
  private async prepareTransactionForSigning(input: CreateEventInput, state: TransactionState): Promise<TransactionSigningData> {
    if (!state.ipfsMetadataUrl) {
      throw new StorageError('IPFS metadata URL required for blockchain creation', 'blockchain', 'missing_metadata');
    }

    try {
      // Prepare transaction data for user signing
      const transactionData = await this.blockchainService.prepareCreateEventTransaction(
        input,
        state.ipfsMetadataUrl,
        state.userWalletAddress
      );

      return transactionData;

    } catch (error) {
      throw new StorageError(
        `Transaction preparation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'blockchain',
        'transaction_preparation'
      );
    }
  }

  /**
   * Phase 4: Wait for user to sign transaction
   * This method will be called by the frontend after user signs
   */
  async waitForUserTransactionSigning(_transactionData: Record<string, unknown>, _state: TransactionState): Promise<UserSignedTransaction> {
    // This is a placeholder - the actual implementation will be in the frontend
    // The frontend will call signTransactionWithUserWallet and pass the result here
    throw new Error('User transaction signing must be handled by frontend');
  }

  /**
   * Sign transaction with user wallet (called by frontend)
   */
  async signTransactionWithUserWallet(transactionData: TransactionSigningData, userWalletAddress: string): Promise<UserSignedTransaction> {
    try {
      const signedTransaction = await this.blockchainService.signTransactionWithUserWallet(
        transactionData,
        userWalletAddress
      );

      return signedTransaction;

    } catch (error) {
      throw new StorageError(
        `User transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'blockchain',
        'user_signing'
      );
    }
  }

  /**
   * Phase 5: Verify blockchain creation
   */
  private async verifyBlockchainCreation(signedTransaction: UserSignedTransaction, state: TransactionState): Promise<void> {
    try {
      // Verify transaction was successful
      const verificationResult = await this.blockchainService.verifyTransaction(signedTransaction.transactionHash);
      
      if (!verificationResult.success || !verificationResult.data) {
        throw new StorageError(
          'Transaction verification failed',
          'blockchain',
          'verification_failed'
        );
      }

      if (verificationResult.data.status !== 'success') {
        throw new StorageError(
          'Transaction failed on blockchain',
          'blockchain',
          'transaction_failed'
        );
      }

      // Store blockchain data
      state.blockchainTxHash = signedTransaction.transactionHash;
      state.blockchainEventId = signedTransaction.eventId;
      state.contractAddress = signedTransaction.contractAddress;
      state.contractChainId = signedTransaction.chainId;

      // Wait for transaction confirmation with retries
      await this.waitForTransactionConfirmation(state.blockchainTxHash, 5, 10000);

      // Verify the event exists on blockchain
      if (state.blockchainEventId) {
        const eventVerificationResult = await this.blockchainService.getEventByContractId(state.blockchainEventId);
        if (!eventVerificationResult.success) {
          throw new StorageError(
            'Event not found on blockchain after creation',
            'blockchain',
            'event_verification_failed'
          );
        }
      }

    } catch (error) {
      throw new StorageError(
        `Blockchain verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'blockchain',
        'verification_phase'
      );
    }
  }

  /**
   * Phase 6: Store in database with blockchain proof
   */
  private async executeDatabasePhase(input: CreateEventInput, state: TransactionState): Promise<void> {
    try {
      // Get or create user
      const userId = await this.databaseService.getOrCreateUser(input.walletAddress);
      
      // Store event in database with blockchain proof
      const dbResult = await this.databaseService.createEvent(
        state.eventId,
        input,
        userId,
        state.slug,
        state.blockchainEventId,
        state.blockchainTxHash,
        state.ipfsMetadataUrl,
        state.ipfsImageUrl,
        state.contractChainId,
        state.contractAddress
      );

      if (!dbResult.success) {
        throw new StorageError(
          dbResult.error || 'Database creation failed',
          'database',
          'create_event'
        );
      }

      state.databaseRecordId = dbResult.data?.id;

      // Add rollback action for database
      state.rollbackActions.push(async () => {
        if (state.databaseRecordId) {
          await this.databaseService.deleteEvent(state.eventId);
        }
      });

    } catch (error) {
      throw new StorageError(
        `Database phase failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'database',
        'creation_phase'
      );
    }
  }

  /**
   * Phase 7: Verify cross-layer consistency
   */
  private async verifyConsistency(state: TransactionState): Promise<void> {
    try {
      // Check database record
      const dbResult = await this.databaseService.getEventById(state.eventId);
      if (!dbResult.success || !dbResult.data) {
        throw new StorageError('Event not found in database after creation', 'database', 'consistency_check');
      }

      // Check blockchain record if we have contract event ID
      if (state.blockchainEventId) {
        const bcResult = await this.blockchainService.getEventByContractId(state.blockchainEventId);
        if (!bcResult.success || !bcResult.data) {
          throw new StorageError('Event not found on blockchain after creation', 'blockchain', 'consistency_check');
        }

        // Verify critical data matches
        const dbEvent = dbResult.data;
        const bcEvent = bcResult.data;

        if (dbEvent.title !== bcEvent.title) {
          throw new StorageError('Title mismatch between database and blockchain', 'consistency', 'data_mismatch');
        }

        if (dbEvent.ticketPrice !== bcEvent.ticketPrice) {
          throw new StorageError('Ticket price mismatch between database and blockchain', 'consistency', 'data_mismatch');
        }
      }

      // Check IPFS metadata accessibility
      if (state.ipfsMetadataUrl) {
        try {
          const response = await fetch(state.ipfsMetadataUrl);
          if (!response.ok) {
            throw new StorageError('IPFS metadata not accessible after upload', 'ipfs', 'consistency_check');
          }
        } catch {
          throw new StorageError('Failed to verify IPFS metadata accessibility', 'ipfs', 'consistency_check');
        }
      }

    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Consistency verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'consistency',
        'verification_failed'
      );
    }
  }

  /**
   * Cleanup orphaned records (events in database without blockchain proof)
   */
  async cleanupOrphanedRecords(): Promise<void> {
    try {
      // Find events in database without blockchain transaction hash
      const orphanedEvents = await this.databaseService.getEventsWithoutBlockchainProof();
      
      for (const event of orphanedEvents) {
        console.log(`Cleaning up orphaned event: ${event.id}`);
        
        // Delete from database
        await this.databaseService.deleteEvent(event.id);
        
        // Delete from IPFS if metadata URL exists
        if (event.filebase_metadata_url) {
          await this.ipfsService.deleteFile(event.filebase_metadata_url);
        }
        
        if (event.filebase_image_url) {
          await this.ipfsService.deleteFile(event.filebase_image_url);
        }
      }
      
      console.log(`Cleaned up ${orphanedEvents.length} orphaned events`);
      
    } catch (error) {
      console.error('Failed to cleanup orphaned records:', error);
    }
  }

  /**
   * Wait for transaction confirmation with retries
   */
  private async waitForTransactionConfirmation(
    txHash: string, 
    maxRetries: number = 5, 
    retryDelay: number = 10000
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const verificationResult = await this.blockchainService.verifyTransaction(txHash);
        
        if (verificationResult.success && verificationResult.data) {
          if (verificationResult.data.status === 'success') {
            return; // Transaction confirmed
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
      } catch (error) {
        console.error(`Transaction confirmation attempt ${i + 1} failed:`, error);
        
        if (i === maxRetries - 1) {
          throw new StorageError(
            'Transaction confirmation timeout',
            'blockchain',
            'confirmation_timeout'
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Execute rollback for all completed phases
   */
  private async executeRollback(state: TransactionState): Promise<void> {
    console.log(`Executing rollback for event ${state.eventId}`);
    
    // Execute rollback actions in reverse order
    for (let i = state.rollbackActions.length - 1; i >= 0; i--) {
      try {
        await state.rollbackActions[i]();
      } catch (error) {
        console.error(`Rollback action ${i} failed:`, error);
      }
    }
  }

  /**
   * Build success result
   */
  private buildSuccessResult(state: TransactionState): EventCreationResult {
    return {
      success: true,
      eventId: state.eventId,
      slug: state.slug,
      transactionHash: state.blockchainTxHash,
      contractEventId: state.blockchainEventId,
      contractAddress: state.contractAddress,
      contractChainId: state.contractChainId,
      filebaseMetadataUrl: state.ipfsMetadataUrl,
      filebaseImageUrl: state.ipfsImageUrl,
      createdOn: {
        database: true,
        blockchain: true,
        filebase: true
      },
      errors: []
    };
  }

  /**
   * Build error result
   */
  private buildErrorResult(state: TransactionState, error: unknown): EventCreationResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      eventId: state.eventId,
      slug: state.slug,
      transactionHash: state.blockchainTxHash,
      contractEventId: state.blockchainEventId,
      contractAddress: state.contractAddress,
      contractChainId: state.contractChainId,
      filebaseMetadataUrl: state.ipfsMetadataUrl,
      filebaseImageUrl: state.ipfsImageUrl,
      createdOn: {
        database: !!state.databaseRecordId,
        blockchain: !!state.blockchainTxHash,
        filebase: !!state.ipfsMetadataUrl
      },
      errors: [errorMessage]
    };
  }

  /**
   * Check data consistency for a specific event
   */
  async checkDataConsistency(eventId: string): Promise<{
    eventId: string;
    database: boolean;
    blockchain: boolean;
    ipfs: boolean;
    discrepancies: string[];
    lastChecked: Date;
  }> {
    const discrepancies: string[] = [];
    
    // Check database
    const dbResult = await this.databaseService.getEventById(eventId);
    const database = dbResult.success;
    
    if (!database) {
      discrepancies.push('Event not found in database');
    }

    // Check blockchain
    let blockchain = false;
    if (dbResult.success && dbResult.data?.contractEventId) {
      const bcResult = await this.blockchainService.getEventByContractId(dbResult.data.contractEventId);
      blockchain = bcResult.success;
      
      if (!blockchain) {
        discrepancies.push('Event not found on blockchain');
      }
    } else if (dbResult.success && dbResult.data && !dbResult.data.contractEventId) {
      discrepancies.push('No blockchain contract event ID in database');
    }

    // Check IPFS
    let ipfs = false;
    if (dbResult.success && dbResult.data?.filebaseMetadataUrl) {
      try {
        const response = await fetch(dbResult.data.filebaseMetadataUrl);
        ipfs = response.ok;
        
        if (!ipfs) {
          discrepancies.push('IPFS metadata not accessible');
        }
      } catch {
        discrepancies.push('IPFS metadata access failed');
      }
    } else if (dbResult.success && dbResult.data && !dbResult.data.filebaseMetadataUrl) {
      discrepancies.push('No IPFS metadata URL in database');
    }

    return {
      eventId,
      database,
      blockchain,
      ipfs,
      discrepancies,
      lastChecked: new Date()
    };
  }

  /**
   * Sync data consistency across all layers
   */
  async syncDataConsistency(): Promise<{
    totalEvents: number;
    syncedEvents: number;
    failedEvents: number;
    lastSyncTime: Date;
    errors: string[];
  }> {
    const errors: string[] = [];
    let syncedEvents = 0;
    let failedEvents = 0;

    try {
      // Get all events that need syncing
      const eventsResult = await this.getEvents({ limit: 1000 });
      const events = eventsResult.events;
      
      for (const event of events) {
        try {
          const consistencyCheck = await this.checkDataConsistency(event.id);
          
          if (consistencyCheck.discrepancies.length > 0) {
            // Attempt to repair
            const repairResult = await this.repairEventConsistency(event.id);
            if (repairResult.success) {
              syncedEvents++;
            } else {
              failedEvents++;
              errors.push(`Failed to sync event ${event.id}: ${repairResult.errors.join(', ')}`);
            }
          } else {
            syncedEvents++;
          }
        } catch {
          failedEvents++;
          errors.push(`Failed to sync event ${event.id}: Unknown error`);
        }
      }

      return {
        totalEvents: events.length,
        syncedEvents,
        failedEvents,
        lastSyncTime: new Date(),
        errors
      };
    } catch (error) {
      return {
        totalEvents: 0,
        syncedEvents: 0,
        failedEvents: 1,
        lastSyncTime: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Enhanced data consistency repair
   */
  async repairEventConsistency(eventId: string): Promise<{
    success: boolean;
    actions: string[];
    errors: string[];
  }> {
    const actions: string[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Get event from database
      const dbResult = await this.databaseService.getEventById(eventId);
      if (!dbResult.success || !dbResult.data) {
        errors.push('Event not found in database');
        return { success: false, actions, errors };
      }

      const dbEvent = dbResult.data;
      actions.push('Retrieved event from database');

      // Step 2: If we have contract data, verify blockchain
      if (dbEvent.contractEventId) {
        const bcResult = await this.blockchainService.getEventByContractId(dbEvent.contractEventId);
        
        if (!bcResult.success || !bcResult.data) {
          // Blockchain record missing - this is the main issue
          errors.push('Event not found on blockchain - blockchain creation may have failed');
          
          // Option 1: Attempt to recreate on blockchain (if we have private key)
          if (appConfig.blockchain.privateKey) {
            try {
              const recreateInput: CreateEventInput = {
                title: dbEvent.title,
                description: dbEvent.description,
                location: dbEvent.location,
                startDate: dbEvent.startDate,
                endDate: dbEvent.endDate,
                maxCapacity: dbEvent.maxCapacity,
                ticketPrice: dbEvent.ticketPrice,
                requireApproval: dbEvent.requireApproval,
                hasPOAP: dbEvent.hasPOAP,
                poapMetadata: dbEvent.poapMetadata,
                visibility: dbEvent.visibility,
                timezone: dbEvent.timezone,
                category: dbEvent.category,
                tags: dbEvent.tags || [],
                walletAddress: dbEvent.creatorId,
                privateKey: appConfig.blockchain.privateKey
              };

              const blockchainResult = await this.blockchainService.createEvent(
                recreateInput,
                dbEvent.filebaseMetadataUrl || ''
              );

              if (blockchainResult.success && blockchainResult.data) {
                // Update database with new blockchain data
                await this.databaseService.updateEventWithBlockchainData(
                  eventId,
                  blockchainResult.data.eventId || 0,
                  blockchainResult.data.transactionHash,
                  blockchainResult.data.contractAddress || '',
                  blockchainResult.data.contractChainId || 43113
                );
                
                actions.push('Recreated event on blockchain and updated database');
              } else {
                errors.push(`Failed to recreate on blockchain: ${blockchainResult.error}`);
              }
            } catch (error) {
              errors.push(`Blockchain recreation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          } else {
            errors.push('No private key available for blockchain recreation');
          }
        } else {
          actions.push('Blockchain record verified');
          
          // Compare critical fields
          const bcEvent = bcResult.data;
          if (dbEvent.title !== bcEvent.title) {
            errors.push('Title mismatch between database and blockchain');
          }
          if (dbEvent.ticketPrice !== bcEvent.ticketPrice) {
            errors.push('Price mismatch between database and blockchain');
          }
        }
      }

      // Step 3: Verify IPFS metadata
      if (dbEvent.filebaseMetadataUrl) {
        try {
          const response = await fetch(dbEvent.filebaseMetadataUrl);
          if (response.ok) {
            actions.push('IPFS metadata accessible');
          } else {
            errors.push('IPFS metadata not accessible');
          }
        } catch (error) {
          errors.push(`IPFS verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        actions,
        errors
      };

    } catch {
      errors.push(`Consistency repair failed: Unknown error`);
      return { success: false, actions, errors };
    }
  }

  /**
   * Get events with intelligent fallback strategy
   */
  async getEvents(filters: EventSearchInput): Promise<EventSearchResult> {
    try {
      // Primary source: Database (for performance)
      const dbResult = await this.databaseService.getEvents(filters);
      
      if (dbResult.success && dbResult.data) {
        // Verify critical events with blockchain if needed
        const verifiedEvents = await this.verifyEventsWithBlockchain(dbResult.data.events);
        
        return {
          ...dbResult.data,
          events: verifiedEvents
        };
      }

      // Fallback: Try blockchain if database fails
      const bcResult = await this.blockchainService.getEvents(filters);
      
      if (bcResult.success && bcResult.data) {
        return bcResult.data;
      }

      // Return empty result if both fail
      return {
        events: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        hasMore: false,
        availableFilters: {
          categories: [],
          locations: [],
          priceRanges: { min: 0, max: 0 }
        }
      };
    } catch {
      // Failed to get events
      return {
        events: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        hasMore: false,
        availableFilters: {
          categories: [],
          locations: [],
          priceRanges: { min: 0, max: 0 }
        }
      };
    }
  }

  /**
   * Get event by ID with cross-layer verification
   */
  async getEventById(eventId: string): Promise<EventData | null> {
    try {
      // Try database first
      const dbResult = await this.databaseService.getEventById(eventId);
      
      if (dbResult.success && dbResult.data) {
        // Verify with blockchain if we have contract data
        if (dbResult.data.contractEventId) {
          const bcResult = await this.blockchainService.getEventByContractId(dbResult.data.contractEventId);
          if (bcResult.success && bcResult.data) {
            // Blockchain verification successful
            return dbResult.data;
          }
        }
        
        // Return database result even if blockchain verification fails
        return dbResult.data;
      }

      // Fallback: Try blockchain if database fails
      // Note: This would require implementing getEventByContractId in blockchain service
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Verify events with blockchain data
   */
  private async verifyEventsWithBlockchain(events: EventData[]): Promise<EventData[]> {
    const verifiedEvents: EventData[] = [];
    
    for (const event of events) {
      if (event.contractEventId) {
        try {
          const bcResult = await this.blockchainService.getEventByContractId(event.contractEventId);
          if (bcResult.success && bcResult.data) {
            // Event verified on blockchain
            verifiedEvents.push(event);
          } else {
            // Event not found on blockchain - mark as inconsistent
            verifiedEvents.push({
              ...event,
              status: 'verification_pending'
            });
          }
        } catch {
          // Verification failed - keep event but mark as pending
          verifiedEvents.push({
            ...event,
            status: 'verification_pending'
          });
        }
      } else {
        // No blockchain data - keep as is
        verifiedEvents.push(event);
      }
    }
    
    return verifiedEvents;
  }

  /**
   * Get file extension helper
   */
  private getFileExtension(contentType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    return extensions[contentType] || 'bin';
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}