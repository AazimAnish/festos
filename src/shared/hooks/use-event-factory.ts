import { useState, useCallback, useEffect } from 'react';
// import { useAccount } from 'wagmi'; // Will be used for write operations
import { usePublicClient, useWalletClient } from 'wagmi';
import {
  getContract,
  parseEther,
  formatEther,
  type Abi,
  type Client,
} from 'viem';
import type {
  Event,
  Ticket,
  EventStats,
  CreateEventParams,
  UpdateEventParams,
} from '@/lib/contracts/types/EventFactory';

// Contract ABI - This should be imported from the compiled artifacts
const EVENT_FACTORY_ABI = [
  // Events
  {
    type: 'event',
    name: 'EventCreated',
    inputs: [
      { type: 'uint256', name: 'eventId', indexed: true },
      { type: 'address', name: 'creator', indexed: true },
      { type: 'string', name: 'title' },
      { type: 'uint256', name: 'startTime' },
      { type: 'uint256', name: 'ticketPrice' },
    ],
  },
  {
    type: 'event',
    name: 'TicketPurchased',
    inputs: [
      { type: 'uint256', name: 'ticketId', indexed: true },
      { type: 'uint256', name: 'eventId', indexed: true },
      { type: 'address', name: 'attendee', indexed: true },
      { type: 'uint256', name: 'price' },
    ],
  },
  // Read functions
  {
    type: 'function',
    name: 'getEvent',
    inputs: [{ type: 'uint256', name: 'eventId' }],
    outputs: [
      { type: 'uint256', name: 'eventId' },
      { type: 'address', name: 'creator' },
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'string', name: 'location' },
      { type: 'uint256', name: 'startTime' },
      { type: 'uint256', name: 'endTime' },
      { type: 'uint256', name: 'maxCapacity' },
      { type: 'uint256', name: 'currentAttendees' },
      { type: 'uint256', name: 'ticketPrice' },
      { type: 'bool', name: 'isActive' },
      { type: 'bool', name: 'requireApproval' },
      { type: 'bool', name: 'hasPOAP' },
      { type: 'string', name: 'poapMetadata' },
      { type: 'uint256', name: 'createdAt' },
      { type: 'uint256', name: 'updatedAt' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTicket',
    inputs: [{ type: 'uint256', name: 'ticketId' }],
    outputs: [
      { type: 'uint256', name: 'ticketId' },
      { type: 'uint256', name: 'eventId' },
      { type: 'address', name: 'attendee' },
      { type: 'uint256', name: 'purchaseTime' },
      { type: 'bool', name: 'isUsed' },
      { type: 'bool', name: 'isApproved' },
      { type: 'uint256', name: 'pricePaid' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEventStats',
    inputs: [{ type: 'uint256', name: 'eventId' }],
    outputs: [
      { type: 'uint256', name: 'totalRevenue' },
      { type: 'uint256', name: 'totalTicketsSold' },
      { type: 'uint256', name: 'totalAttendees' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserEvents',
    inputs: [{ type: 'address', name: 'user' }],
    outputs: [{ type: 'uint256[]', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserTickets',
    inputs: [{ type: 'address', name: 'user' }],
    outputs: [{ type: 'uint256[]', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasTicket',
    inputs: [
      { type: 'uint256', name: 'eventId' },
      { type: 'address', name: 'user' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserTicketId',
    inputs: [
      { type: 'uint256', name: 'eventId' },
      { type: 'address', name: 'user' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalEvents',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalTickets',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'platformFee',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'createEvent',
    inputs: [
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'string', name: 'location' },
      { type: 'uint256', name: 'startTime' },
      { type: 'uint256', name: 'endTime' },
      { type: 'uint256', name: 'maxCapacity' },
      { type: 'uint256', name: 'ticketPrice' },
      { type: 'bool', name: 'requireApproval' },
      { type: 'bool', name: 'hasPOAP' },
      { type: 'string', name: 'poapMetadata' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'purchaseTicket',
    inputs: [{ type: 'uint256', name: 'eventId' }],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'approveTicket',
    inputs: [{ type: 'uint256', name: 'ticketId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'useTicket',
    inputs: [{ type: 'uint256', name: 'ticketId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateEvent',
    inputs: [
      { type: 'uint256', name: 'eventId' },
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'string', name: 'location' },
      { type: 'uint256', name: 'startTime' },
      { type: 'uint256', name: 'endTime' },
      { type: 'uint256', name: 'maxCapacity' },
      { type: 'uint256', name: 'ticketPrice' },
      { type: 'bool', name: 'requireApproval' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelEvent',
    inputs: [{ type: 'uint256', name: 'eventId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const satisfies Abi;

// Use a permissive contract type to avoid over-constraining generics from viem
// while keeping our call-sites strongly typed by parameters and return casting.
// This is necessary for complex Viem contract types that don't have simple generic constraints
// and the ABI types are too complex to manually define without losing functionality
type ViemContract = {
  read: Record<string, (...args: unknown[]) => Promise<unknown>>;
  write: Record<string, (...args: unknown[]) => Promise<`0x${string}`>>;
} | null;

interface UseEventFactoryReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Read functions
  getEvent: (eventId: bigint) => Promise<Event | null>;
  getTicket: (ticketId: bigint) => Promise<Ticket | null>;
  getEventStats: (eventId: bigint) => Promise<EventStats | null>;
  getUserEvents: (userAddress: `0x${string}`) => Promise<bigint[]>;
  getUserTickets: (userAddress: `0x${string}`) => Promise<bigint[]>;
  hasTicket: (eventId: bigint, userAddress: `0x${string}`) => Promise<boolean>;
  getUserTicketId: (
    eventId: bigint,
    userAddress: `0x${string}`
  ) => Promise<bigint>;
  getTotalEvents: () => Promise<bigint>;
  getTotalTickets: () => Promise<bigint>;
  getPlatformFee: () => Promise<bigint>;

  // Write functions
  createEvent: (params: CreateEventParams) => Promise<`0x${string}` | null>;
  purchaseTicket: (
    eventId: bigint,
    ticketPrice: string
  ) => Promise<`0x${string}` | null>;
  approveTicket: (ticketId: bigint) => Promise<`0x${string}` | null>;
  useTicket: (ticketId: bigint) => Promise<`0x${string}` | null>;
  updateEvent: (params: UpdateEventParams) => Promise<`0x${string}` | null>;
  cancelEvent: (eventId: bigint) => Promise<`0x${string}` | null>;

  // Utility functions
  formatTicketPrice: (price: bigint) => string;
  parseTicketPrice: (price: string) => bigint;
  isEventActive: (event: Event) => boolean;
  isEventFull: (event: Event) => boolean;
  canPurchaseTicket: (
    event: Event,
    userAddress: `0x${string}`
  ) => Promise<boolean>;
}

export function useEventFactory(
  contractAddress?: `0x${string}`
): UseEventFactoryReturn {
  // const { address: userAddress } = useAccount(); // Will be used for write operations
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [contract, setContract] = useState<ViemContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract
  useEffect(() => {
    if (!contractAddress) {
      setContract(null);
      return;
    }

    // Prefer wallet client when available (enables writes); fallback to public client for read-only.
    const client = (walletClient as Client) ?? publicClient;
    if (!client) {
      setContract(null);
      return;
    }

    try {
      const eventFactoryContract = getContract({
        address: contractAddress,
        abi: EVENT_FACTORY_ABI,
        client,
      });
      setContract(eventFactoryContract as ViemContract);
      setError(null);
    } catch (err) {
      setContract(null);
      setError('Failed to initialize contract');
      console.error('Contract initialization error:', err);
    }
  }, [publicClient, walletClient, contractAddress]);

  // Read functions
  const getEvent = useCallback(
    async (eventId: bigint): Promise<Event | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const event = await contract.read.getEvent([eventId]);
        return event as unknown as Event;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get event';
        setError(errorMessage);
        console.error('Get event error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const getTicket = useCallback(
    async (ticketId: bigint): Promise<Ticket | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const ticket = await contract.read.getTicket([ticketId]);
        return ticket as unknown as Ticket;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get ticket';
        setError(errorMessage);
        console.error('Get ticket error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const getEventStats = useCallback(
    async (eventId: bigint): Promise<EventStats | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const stats = await contract.read.getEventStats([eventId]);
        return stats as unknown as EventStats;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get event stats';
        setError(errorMessage);
        console.error('Get event stats error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const getUserEvents = useCallback(
    async (addr: `0x${string}`): Promise<bigint[]> => {
      if (!contract) return [];
      try {
        setIsLoading(true);
        setError(null);
        const events = await contract.read.getUserEvents([addr]);
        return events as unknown as bigint[];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get user events';
        setError(errorMessage);
        console.error('Get user events error:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const getUserTickets = useCallback(
    async (addr: `0x${string}`): Promise<bigint[]> => {
      if (!contract) return [];
      try {
        setIsLoading(true);
        setError(null);
        const tickets = await contract.read.getUserTickets([addr]);
        return tickets as unknown as bigint[];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get user tickets';
        setError(errorMessage);
        console.error('Get user tickets error:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const hasTicket = useCallback(
    async (eventId: bigint, addr: `0x${string}`): Promise<boolean> => {
      if (!contract) return false;
      try {
        setIsLoading(true);
        setError(null);
        const ok = await contract.read.hasTicket([eventId, addr]);
        return Boolean(ok);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to check ticket status';
        setError(errorMessage);
        console.error('Has ticket error:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const getUserTicketId = useCallback(
    async (eventId: bigint, addr: `0x${string}`): Promise<bigint> => {
      if (!contract) return BigInt(0);
      try {
        setIsLoading(true);
        setError(null);
        const ticketId = await contract.read.getUserTicketId([eventId, addr]);
        return ticketId as unknown as bigint;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get user ticket ID';
        setError(errorMessage);
        console.error('Get user ticket ID error:', err);
        return BigInt(0);
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const getTotalEvents = useCallback(async (): Promise<bigint> => {
    if (!contract) return BigInt(0);
    try {
      setIsLoading(true);
      setError(null);
      const total = await contract.read.getTotalEvents();
      return total as unknown as bigint;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get total events';
      setError(errorMessage);
      console.error('Get total events error:', err);
      return BigInt(0);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  const getTotalTickets = useCallback(async (): Promise<bigint> => {
    if (!contract) return BigInt(0);
    try {
      setIsLoading(true);
      setError(null);
      const total = await contract.read.getTotalTickets();
      return total as unknown as bigint;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get total tickets';
      setError(errorMessage);
      console.error('Get total tickets error:', err);
      return BigInt(0);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  const getPlatformFee = useCallback(async (): Promise<bigint> => {
    if (!contract) return BigInt(0);
    try {
      setIsLoading(true);
      setError(null);
      const fee = await contract.read.platformFee();
      return fee as unknown as bigint;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get platform fee';
      setError(errorMessage);
      console.error('Get platform fee error:', err);
      return BigInt(0);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Write functions
  const createEvent = useCallback(
    async (params: CreateEventParams): Promise<`0x${string}` | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const hash = await contract.write.createEvent([
          params.title,
          params.description,
          params.location,
          params.startTime,
          params.endTime,
          params.maxCapacity,
          params.ticketPrice,
          params.requireApproval,
          params.hasPOAP,
          params.poapMetadata,
        ]);
        return hash as `0x${string}`;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create event';
        setError(errorMessage);
        console.error('Create event error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const purchaseTicket = useCallback(
    async (
      eventId: bigint,
      ticketPrice: string
    ): Promise<`0x${string}` | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const value = parseEther(ticketPrice);
        const hash = await contract.write.purchaseTicket([eventId], { value });
        return hash as `0x${string}`;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to purchase ticket';
        setError(errorMessage);
        console.error('Purchase ticket error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const approveTicket = useCallback(
    async (ticketId: bigint): Promise<`0x${string}` | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const hash = await contract.write.approveTicket([ticketId]);
        return hash as `0x${string}`;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to approve ticket';
        setError(errorMessage);
        console.error('Approve ticket error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const useTicket = useCallback(
    async (ticketId: bigint): Promise<`0x${string}` | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const hash = await contract.write.useTicket([ticketId]);
        return hash as `0x${string}`;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to use ticket';
        setError(errorMessage);
        console.error('Use ticket error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const updateEvent = useCallback(
    async (params: UpdateEventParams): Promise<`0x${string}` | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const hash = await contract.write.updateEvent([
          params.eventId,
          params.title,
          params.description,
          params.location,
          params.startTime,
          params.endTime,
          params.maxCapacity,
          params.ticketPrice,
          params.requireApproval,
        ]);
        return hash as `0x${string}`;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update event';
        setError(errorMessage);
        console.error('Update event error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  const cancelEvent = useCallback(
    async (eventId: bigint): Promise<`0x${string}` | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        setError(null);
        const hash = await contract.write.cancelEvent([eventId]);
        return hash as `0x${string}`;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to cancel event';
        setError(errorMessage);
        console.error('Cancel event error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  // Utility functions
  const formatTicketPrice = useCallback((price: bigint): string => {
    return formatEther(price);
  }, []);

  const parseTicketPrice = useCallback((price: string): bigint => {
    return parseEther(price);
  }, []);

  const isEventActive = useCallback((event: Event): boolean => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return event.isActive && event.startTime > now;
  }, []);

  const isEventFull = useCallback((event: Event): boolean => {
    return (
      event.maxCapacity > BigInt(0) &&
      event.currentAttendees >= event.maxCapacity
    );
  }, []);

  const canPurchaseTicket = useCallback(
    async (event: Event, addr: `0x${string}`): Promise<boolean> => {
      if (!isEventActive(event) || isEventFull(event)) return false;
      const has = await hasTicket(event.eventId, addr);
      return !has;
    },
    [isEventActive, isEventFull, hasTicket]
  );

  return {
    isLoading,
    error,
    getEvent,
    getTicket,
    getEventStats,
    getUserEvents,
    getUserTickets,
    hasTicket,
    getUserTicketId,
    getTotalEvents,
    getTotalTickets,
    getPlatformFee,
    createEvent,
    purchaseTicket,
    approveTicket,
    useTicket,
    updateEvent,
    cancelEvent,
    formatTicketPrice,
    parseTicketPrice,
    isEventActive,
    isEventFull,
    canPurchaseTicket,
  };
}
