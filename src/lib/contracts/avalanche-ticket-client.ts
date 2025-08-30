import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
  decodeEventLog,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche, avalancheFuji } from '@/lib/chains';
import { getContractAddress } from '@/lib/config/contracts';
import { CONTRACT_ABIS } from '@/lib/config/contracts';
import type { 
  CreateEventParams, 
  PurchaseTicketParams,
  TicketMetadata,
  EventTicketEvent 
} from '@/lib/contracts/types/EventTicket';

// Avalanche RPC URLs
const AVALANCHE_RPC_URL =
  process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL ||
  'https://api.avax.network/ext/bc/C/rpc';
const AVALANCHE_FUJI_RPC_URL =
  process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL ||
  'https://api.avax-test.network/ext/bc/C/rpc';

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
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return createWalletClient({
    chain: avalanche,
    transport: http(AVALANCHE_RPC_URL),
    account,
  });
}

// Create wallet client for Avalanche Fuji testnet
export function createAvalancheFujiWalletClient(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return createWalletClient({
    chain: avalancheFuji,
    transport: http(AVALANCHE_FUJI_RPC_URL),
    account,
  });
}

// Get EventTicket contract instance for Avalanche mainnet
export function getAvalancheEventTicketContract(privateKey?: string) {
  const contractAddress = getContractAddress(
    'EventTicket',
    avalanche.id
  ) as Address;

  if (!contractAddress) {
    throw new Error(
      'EventTicket contract address not found for Avalanche mainnet'
    );
  }

  if (privateKey) {
    const walletClient = createAvalancheWalletClient(privateKey);
    const publicClient = createAvalanchePublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventTicket,
      publicClient,
      walletClient,
    };
  } else {
    const publicClient = createAvalanchePublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventTicket,
      publicClient,
    };
  }
}

// Get EventTicket contract instance for Avalanche Fuji testnet
export function getAvalancheFujiEventTicketContract(privateKey?: string) {
  const contractAddress = getContractAddress(
    'EventTicket',
    avalancheFuji.id
  ) as Address;

  if (!contractAddress) {
    throw new Error(
      'EventTicket contract address not found for Avalanche Fuji testnet'
    );
  }

  if (privateKey) {
    const walletClient = createAvalancheFujiWalletClient(privateKey);
    const publicClient = createAvalancheFujiPublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventTicket,
      publicClient,
      walletClient,
    };
  } else {
    const publicClient = createAvalancheFujiPublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventTicket,
      publicClient,
    };
  }
}

// Create event on Avalanche blockchain using EventTicket contract
export async function createEventOnAvalancheTicket(
  params: CreateEventParams,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ eventId: bigint; transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract(privateKey)
    : getAvalancheEventTicketContract(privateKey);

  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }

  // Convert ticket price to wei if it's a string
  const ticketPrice =
    typeof params.ticketPrice === 'string'
      ? parseEther(params.ticketPrice)
      : params.ticketPrice;

  // Prepare contract parameters
  const contractParams = [
    params.title,
    params.location,
    params.startTime,
    params.endTime,
    params.maxCapacity,
    ticketPrice,
    ticketPrice > 0n, // requiresEscrow for paid events
    params.baseURI,
  ] as const;

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'createEvent',
    args: contractParams,
  });

  // Wait for transaction confirmation
  const receipt = await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

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

// Purchase ticket on Avalanche blockchain
export async function purchaseTicketOnAvalanche(
  params: PurchaseTicketParams,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ tokenId: bigint; transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract(privateKey)
    : getAvalancheEventTicketContract(privateKey);

  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }

  // Convert value to wei if it's a string
  const value =
    typeof params.value === 'string'
      ? parseEther(params.value)
      : params.value;

  // Prepare contract parameters
  const contractParams = [
    params.eventId,
    params.attendeeName,
    params.attendeeEmail,
  ] as const;

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'purchaseTicket',
    args: contractParams,
    value,
  });

  // Wait for transaction confirmation
  const receipt = await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

  // Parse event logs to get the token ID
  const ticketMintedLog = receipt.logs.find(log => {
    try {
      const decoded = decodeEventLog({
        abi: contract.abi,
        data: log.data,
        topics: log.topics,
      });
      return decoded.eventName === 'TicketMinted';
    } catch {
      return false;
    }
  });

  if (!ticketMintedLog) {
    throw new Error('TicketMinted event not found in transaction logs');
  }

  const decoded = decodeEventLog({
    abi: contract.abi,
    data: ticketMintedLog.data,
    topics: ticketMintedLog.topics,
  });

  if (decoded.eventName !== 'TicketMinted') {
    throw new Error('Expected TicketMinted event');
  }

  const tokenId = decoded.args.tokenId as bigint;

  return {
    tokenId,
    transactionHash: hash,
  };
}

// Get event from Avalanche blockchain using EventTicket contract
export async function getEventFromAvalancheTicket(
  eventId: bigint,
  isTestnet: boolean = false
): Promise<EventTicketEvent> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract()
    : getAvalancheEventTicketContract();

  const eventTuple = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getEvent',
    args: [eventId],
  });

  // Convert tuple to EventTicketEvent
  const event: EventTicketEvent = {
    eventId: eventTuple[0],
    creator: eventTuple[1],
    title: eventTuple[2],
    location: eventTuple[3],
    startTime: eventTuple[4],
    endTime: eventTuple[5],
    maxCapacity: eventTuple[6],
    currentTickets: eventTuple[7],
    ticketPrice: eventTuple[8],
    isActive: eventTuple[9],
    baseURI: eventTuple[10],
  };

  return event;
}

// Get ticket metadata from Avalanche blockchain
export async function getTicketMetadataFromAvalanche(
  tokenId: bigint,
  isTestnet: boolean = false
): Promise<TicketMetadata> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract()
    : getAvalancheEventTicketContract();

  const metadataTuple = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getTicketMetadata',
    args: [tokenId],
  });

  // Convert tuple to TicketMetadata
  const metadata: TicketMetadata = {
    eventId: metadataTuple[0],
    eventCreator: metadataTuple[1],
    eventTitle: metadataTuple[2],
    eventLocation: metadataTuple[3],
    eventStartTime: metadataTuple[4],
    eventEndTime: metadataTuple[5],
    attendeeName: metadataTuple[6],
    attendeeEmail: metadataTuple[7],
    purchaseTime: metadataTuple[8],
    pricePaid: metadataTuple[9],
    isUsed: metadataTuple[10],
    isApproved: metadataTuple[11],
  };

  return metadata;
}

// Get user's tickets from Avalanche blockchain
export async function getUserTicketsFromAvalanche(
  userAddress: `0x${string}`,
  isTestnet: boolean = false
): Promise<bigint[]> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract()
    : getAvalancheEventTicketContract();

  const tickets = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getUserTickets',
    args: [userAddress],
  });

  return Array.from(tickets);
}

// Check if user has ticket for event
export async function hasTicketForEvent(
  eventId: bigint,
  userAddress: `0x${string}`,
  isTestnet: boolean = false
): Promise<boolean> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract()
    : getAvalancheEventTicketContract();

  const hasTicket = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'hasTicket',
    args: [eventId, userAddress],
  });

  return hasTicket;
}

// Get user's ticket ID for event
export async function getUserTicketIdForEvent(
  eventId: bigint,
  userAddress: `0x${string}`,
  isTestnet: boolean = false
): Promise<bigint> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract()
    : getAvalancheEventTicketContract();

  const ticketId = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getUserTicketId',
    args: [eventId, userAddress],
  });

  return ticketId;
}

// Use ticket (mark as attended)
export async function useTicketOnAvalanche(
  tokenId: bigint,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract(privateKey)
    : getAvalancheEventTicketContract(privateKey);

  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'useTicket',
    args: [tokenId],
  });

  // Wait for transaction confirmation
  await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

  return {
    transactionHash: hash,
  };
}

// Approve ticket
export async function approveTicketOnAvalanche(
  tokenId: bigint,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventTicketContract(privateKey)
    : getAvalancheEventTicketContract(privateKey);

  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'approveTicket',
    args: [tokenId],
  });

  // Wait for transaction confirmation
  await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

  return {
    transactionHash: hash,
  };
}
