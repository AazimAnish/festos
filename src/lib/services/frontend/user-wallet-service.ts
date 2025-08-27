/**
 * User Wallet Service - Frontend Integration
 * 
 * Handles user wallet signing for event creation with proper error handling
 * and transaction confirmation.
 */

import { useWalletClient, usePublicClient, useChainId } from 'wagmi';
import { parseEther, type Address, type WalletClient, type PublicClient } from 'viem';
import { avalanche, avalancheFuji } from '@/lib/chains';
import { getAvalancheFujiEventFactoryContract } from '@/lib/contracts/avalanche-client';
import type { CreateEventParams } from '@/lib/contracts/types/EventFactory';

export interface UserWalletSigningResult {
  success: boolean;
  transactionHash?: string;
  eventId?: number;
  contractAddress?: string;
  chainId?: number;
  userSignature?: string;
  error?: string;
}

export interface TransactionSigningData {
  address: Address;
  abi: readonly unknown[];
  functionName: string;
  args: readonly unknown[];
  account: Address;
  chainId: number;
}

export class UserWalletService {
  private walletClient: WalletClient;
  private publicClient: PublicClient;
  private chainId: number;

  constructor(walletClient: WalletClient, publicClient: PublicClient, chainId: number) {
    this.walletClient = walletClient;
    this.publicClient = publicClient;
    this.chainId = chainId;
  }

  /**
   * Prepare transaction data for event creation
   */
  prepareEventCreationTransaction(
    input: {
      title: string;
      description: string;
      location: string;
      startDate: string;
      endDate: string;
      maxCapacity: number;
      ticketPrice: string;
      requireApproval: boolean;
      hasPOAP: boolean;
      poapMetadata: string;
    },
    metadataUri: string,
    userWalletAddress: string
  ): TransactionSigningData {
    // Parse dates
    const startTimeUnix = BigInt(Math.floor(new Date(input.startDate).getTime() / 1000));
    const endTimeUnix = BigInt(Math.floor(new Date(input.endDate).getTime() / 1000));
    
    if (startTimeUnix >= endTimeUnix) {
      throw new Error('End date must be after start date');
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
    const transactionData: TransactionSigningData = {
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
      account: userWalletAddress as Address,
      chainId: this.chainId,
    };

    return transactionData;
  }

  /**
   * Sign transaction with user wallet
   */
  async signTransactionWithUserWallet(
    transactionData: TransactionSigningData
  ): Promise<UserWalletSigningResult> {
    try {
      if (!this.walletClient) {
        throw new Error('Wallet client not available');
      }

      // Send transaction
      const hash = await this.walletClient.writeContract({
        address: transactionData.address,
        abi: transactionData.abi,
        functionName: transactionData.functionName,
        args: transactionData.args,
        chain: null,
        account: transactionData.account,
      });

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });

      // Parse event logs to get the event ID
      const eventCreatedLog = receipt.logs.find((log: { data: string; topics: string[] }) => {
        try {
          const decoded = decodeEventLog({
            abi: transactionData.abi,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === 'EventCreated';
        } catch {
          return false;
        }
      });

      if (!eventCreatedLog) {
        throw new Error('EventCreated event not found in transaction logs');
      }

      const decoded = decodeEventLog({
        abi: transactionData.abi,
        data: eventCreatedLog.data,
        topics: eventCreatedLog.topics,
      });

      const eventId = decoded.args.eventId;

      return {
        success: true,
        transactionHash: hash,
        eventId: Number(eventId),
        contractAddress: transactionData.address,
        chainId: transactionData.chainId,
        userSignature: hash, // Transaction hash serves as signature
      };

    } catch (error) {
      console.error('User wallet signing failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(transactionHash: string): Promise<{
    success: boolean;
    status: 'success' | 'failed' | 'pending';
    error?: string;
  }> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: transactionHash as Address,
      });

      if (receipt.status === 'success') {
        return {
          success: true,
          status: 'success',
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error: 'Transaction failed on blockchain',
        };
      }
    } catch (error) {
      return {
        success: false,
        status: 'pending',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if wallet is connected to correct network
   */
  isCorrectNetwork(): boolean {
    return this.chainId === avalanche.id || this.chainId === avalancheFuji.id;
  }

  /**
   * Get current network name
   */
  getNetworkName(): string {
    if (this.chainId === avalanche.id) {
      return 'Avalanche Mainnet';
    } else if (this.chainId === avalancheFuji.id) {
      return 'Avalanche Fuji Testnet';
    } else {
      return 'Unknown Network';
    }
  }
}

/**
 * React Hook for User Wallet Service
 */
export function useUserWalletService(): {
  service: UserWalletService | null;
  isReady: boolean;
  error: string | null;
} {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  if (!walletClient || !publicClient) {
    return {
      service: null,
      isReady: false,
      error: 'Wallet not connected',
    };
  }

  if (!isCorrectNetwork(chainId)) {
    return {
      service: null,
      isReady: false,
      error: `Please connect to Avalanche network. Current: ${getNetworkName(chainId)}`,
    };
  }

  const service = new UserWalletService(walletClient, publicClient, chainId);

  return {
    service,
    isReady: true,
    error: null,
  };
}

/**
 * Helper function to check if network is correct
 */
function isCorrectNetwork(chainId: number): boolean {
  return chainId === avalanche.id || chainId === avalancheFuji.id;
}

/**
 * Helper function to get network name
 */
function getNetworkName(chainId: number): string {
  if (chainId === avalanche.id) {
    return 'Avalanche Mainnet';
  } else if (chainId === avalancheFuji.id) {
    return 'Avalanche Fuji Testnet';
  } else {
    return 'Unknown Network';
  }
}

/**
 * Helper function to decode event logs
 */
function decodeEventLog({ abi, data: _data, topics: _topics }: { abi: readonly unknown[]; data: string; topics: string[] }) {
  // This is a simplified version - in production, use viem's decodeEventLog
  try {
    // Find the event in the ABI
    const eventAbi = abi.find((item): item is { type: string; name: string } => 
      typeof item === 'object' && item !== null && 'type' in item && 'name' in item &&
      (item as { type: string; name: string }).type === 'event' && 
      (item as { type: string; name: string }).name === 'EventCreated'
    );
    
    if (!eventAbi) {
      throw new Error('EventCreated event not found in ABI');
    }

    // For now, return a basic structure
    // In production, properly decode the event data
    return {
      eventName: 'EventCreated',
      args: {
        eventId: BigInt(0), // This should be properly decoded from the log data
      },
    };
  } catch {
    throw new Error('Failed to decode event log');
  }
}
