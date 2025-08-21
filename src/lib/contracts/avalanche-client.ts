import { createPublicClient, createWalletClient, http, parseEther, type Address, decodeEventLog } from 'viem';
import { avalanche, avalancheFuji } from '@/lib/chains';
import { getContractAddress } from '@/lib/config/contracts';
import { CONTRACT_ABIS } from '@/lib/config/contracts';
import type { CreateEventParams } from '@/lib/contracts/types/EventFactory';

// Avalanche RPC URLs
const AVALANCHE_RPC_URL = process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';
const AVALANCHE_FUJI_RPC_URL = process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

// Create public client for Avalanche mainnet
export function createAvalanchePublicClient() {
  return createPublicClient({
    chain: avalanche,
    transport: http(AVALANCHE_RPC_URL),
  });
}

// Create public client for Avalanche Fuji testnet
export function createAvalancheFujiPublicClient() {
  return createPublicClient({
    chain: avalancheFuji,
    transport: http(AVALANCHE_FUJI_RPC_URL),
  });
}

// Create wallet client for Avalanche mainnet
export function createAvalancheWalletClient(privateKey: string) {
  return createWalletClient({
    chain: avalanche,
    transport: http(AVALANCHE_RPC_URL),
    account: privateKey as Address,
  });
}

// Create wallet client for Avalanche Fuji testnet
export function createAvalancheFujiWalletClient(privateKey: string) {
  return createWalletClient({
    chain: avalancheFuji,
    transport: http(AVALANCHE_FUJI_RPC_URL),
    account: privateKey as Address,
  });
}

// Get EventFactory contract instance for Avalanche mainnet
export function getAvalancheEventFactoryContract(privateKey?: string) {
  const contractAddress = getContractAddress('EventFactory', avalanche.id) as Address;
  
  if (!contractAddress) {
    throw new Error('EventFactory contract address not found for Avalanche mainnet');
  }
  
  if (privateKey) {
    const walletClient = createAvalancheWalletClient(privateKey);
    const publicClient = createAvalanchePublicClient();
    
    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventFactory,
      publicClient,
      walletClient,
    };
  } else {
    const publicClient = createAvalanchePublicClient();
    
    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventFactory,
      publicClient,
    };
  }
}

// Get EventFactory contract instance for Avalanche Fuji testnet
export function getAvalancheFujiEventFactoryContract(privateKey?: string) {
  const contractAddress = getContractAddress('EventFactory', avalancheFuji.id) as Address;
  
  if (!contractAddress) {
    throw new Error('EventFactory contract address not found for Avalanche Fuji testnet');
  }
  
  if (privateKey) {
    const walletClient = createAvalancheFujiWalletClient(privateKey);
    const publicClient = createAvalancheFujiPublicClient();
    
    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventFactory,
      publicClient,
      walletClient,
    };
  } else {
    const publicClient = createAvalancheFujiPublicClient();
    
    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventFactory,
      publicClient,
    };
  }
}

// Create event on Avalanche blockchain
export async function createEventOnAvalanche(
  params: CreateEventParams,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ eventId: bigint; transactionHash: string }> {
  const contract = isTestnet 
    ? getAvalancheFujiEventFactoryContract(privateKey)
    : getAvalancheEventFactoryContract(privateKey);
  
  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }
  
  // Convert ticket price to wei if it's a string
  const ticketPrice = typeof params.ticketPrice === 'string' 
    ? parseEther(params.ticketPrice)
    : params.ticketPrice;
  
  // Prepare contract parameters
  const contractParams = [
    params.title,
    params.description,
    params.location,
    params.startTime,
    params.endTime,
    params.maxCapacity,
    ticketPrice,
    params.requireApproval,
    params.hasPOAP,
    params.poapMetadata,
  ] as const;
  
  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'createEvent',
    args: contractParams,
  });
  
  // Wait for transaction confirmation
  const receipt = await contract.publicClient.waitForTransactionReceipt({ hash });
  
  // Parse event logs to get the event ID
  const eventCreatedLog = receipt.logs.find(log => {
    try {
      const decoded = decodeEventLog({
        abi: contract.abi,
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
    abi: contract.abi,
    data: eventCreatedLog.data,
    topics: eventCreatedLog.topics,
  });
  
  const eventId = decoded.args.eventId;
  
  return {
    eventId,
    transactionHash: hash,
  };
}

// Get event from Avalanche blockchain
export async function getEventFromAvalanche(
  eventId: bigint,
  isTestnet: boolean = false
) {
  const contract = isTestnet 
    ? getAvalancheFujiEventFactoryContract()
    : getAvalancheEventFactoryContract();
  
  const event = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getEvent',
    args: [eventId],
  });
  
  return event;
}
