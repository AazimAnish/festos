import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche, avalancheFuji } from '@/lib/chains';
import { getContractAddress } from '@/lib/config/contracts';
import { CONTRACT_ABIS } from '@/lib/config/contracts';
import type { 
  CreateEscrowParams, 
  PurchaseTicketParams,
  EventEscrowData,
  EscrowStats 
} from '@/lib/contracts/types/EventEscrow';

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

// Get EventEscrow contract instance for Avalanche mainnet
export function getAvalancheEventEscrowContract(privateKey?: string) {
  const contractAddress = getContractAddress(
    'EventEscrow',
    avalanche.id
  ) as Address;

  if (!contractAddress) {
    throw new Error(
      'EventEscrow contract address not found for Avalanche mainnet'
    );
  }

  if (privateKey) {
    const walletClient = createAvalancheWalletClient(privateKey);
    const publicClient = createAvalanchePublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventEscrow,
      publicClient,
      walletClient,
    };
  } else {
    const publicClient = createAvalanchePublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventEscrow,
      publicClient,
    };
  }
}

// Get EventEscrow contract instance for Avalanche Fuji testnet
export function getAvalancheFujiEventEscrowContract(privateKey?: string) {
  const contractAddress = getContractAddress(
    'EventEscrow',
    avalancheFuji.id
  ) as Address;

  if (!contractAddress) {
    throw new Error(
      'EventEscrow contract address not found for Avalanche Fuji testnet'
    );
  }

  if (privateKey) {
    const walletClient = createAvalancheFujiWalletClient(privateKey);
    const publicClient = createAvalancheFujiPublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventEscrow,
      publicClient,
      walletClient,
    };
  } else {
    const publicClient = createAvalancheFujiPublicClient();

    return {
      address: contractAddress,
      abi: CONTRACT_ABIS.EventEscrow,
      publicClient,
    };
  }
}

// Create event escrow on Avalanche blockchain
export async function createEventEscrowOnAvalanche(
  params: CreateEscrowParams,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventEscrowContract(privateKey)
    : getAvalancheEventEscrowContract(privateKey);

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
    params.eventId,
    ticketPrice,
    params.eventEndTime,
  ] as const;

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'createEventEscrow',
    args: contractParams,
  });

  // Wait for transaction confirmation
  await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

  return {
    transactionHash: hash,
  };
}

// Purchase ticket through escrow on Avalanche blockchain
export async function purchaseTicketThroughEscrow(
  params: PurchaseTicketParams,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventEscrowContract(privateKey)
    : getAvalancheEventEscrowContract(privateKey);

  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }

  // Convert value to wei if it's a string
  const value =
    typeof params.value === 'string'
      ? parseEther(params.value)
      : params.value;

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'purchaseTicket',
    args: [params.eventId],
    value,
  });

  // Wait for transaction confirmation
  await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

  return {
    transactionHash: hash,
  };
}

// Complete event on Avalanche blockchain
export async function completeEventOnAvalanche(
  eventId: bigint,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventEscrowContract(privateKey)
    : getAvalancheEventEscrowContract(privateKey);

  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'completeEvent',
    args: [eventId],
  });

  // Wait for transaction confirmation
  await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

  return {
    transactionHash: hash,
  };
}

// Release funds to event creator
export async function releaseFundsOnAvalanche(
  eventId: bigint,
  privateKey: string,
  isTestnet: boolean = false
): Promise<{ transactionHash: string }> {
  const contract = isTestnet
    ? getAvalancheFujiEventEscrowContract(privateKey)
    : getAvalancheEventEscrowContract(privateKey);

  if (!contract.walletClient) {
    throw new Error('Wallet client not available');
  }

  // Send transaction
  const hash = await contract.walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'releaseFunds',
    args: [eventId],
  });

  // Wait for transaction confirmation
  await contract.publicClient.waitForTransactionReceipt({
    hash,
  });

  return {
    transactionHash: hash,
  };
}

// Get escrow details from Avalanche blockchain
export async function getEscrowDetailsFromAvalanche(
  eventId: bigint,
  isTestnet: boolean = false
): Promise<EventEscrowData> {
  const contract = isTestnet
    ? getAvalancheFujiEventEscrowContract()
    : getAvalancheEventEscrowContract();

  const escrowTuple = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getEscrowDetails',
    args: [eventId],
  });

  // Convert tuple to EventEscrowData
  const escrowData: EventEscrowData = {
    eventCreator: escrowTuple[0],
    totalAmount: escrowTuple[1],
    ticketPrice: escrowTuple[2],
    ticketCount: escrowTuple[3],
    eventEndTime: escrowTuple[4],
    isCompleted: escrowTuple[5],
    isCancelled: escrowTuple[6],
    isFundsReleased: escrowTuple[7],
  };

  return escrowData;
}

// Get attendee payment amount
export async function getAttendeePaymentFromAvalanche(
  eventId: bigint,
  attendeeAddress: `0x${string}`,
  isTestnet: boolean = false
): Promise<bigint> {
  const contract = isTestnet
    ? getAvalancheFujiEventEscrowContract()
    : getAvalancheEventEscrowContract();

  const payment = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getAttendeePayment',
    args: [eventId, attendeeAddress],
  });

  return payment;
}

// Get escrow statistics
export async function getEscrowStatsFromAvalanche(
  isTestnet: boolean = false
): Promise<EscrowStats> {
  const contract = isTestnet
    ? getAvalancheFujiEventEscrowContract()
    : getAvalancheEventEscrowContract();

  const statsTuple = await contract.publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getStats',
    args: [],
  });

  // Convert tuple to EscrowStats
  const stats: EscrowStats = {
    totalEvents: statsTuple[0],
    totalAmountLocked: statsTuple[1],
    totalCompletedEvents: statsTuple[2],
    totalReleasedAmount: statsTuple[3],
  };

  return stats;
}
