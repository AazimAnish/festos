// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Local development
  localhost: {
    EventFactory: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat address
    EventTicket: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Default Hardhat address
    EventEscrow: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // Default Hardhat address
  },

  // Test networks
  sepolia: {
    EventFactory: process.env.NEXT_PUBLIC_SEPOLIA_EVENT_FACTORY_ADDRESS || '',
    EventTicket: process.env.NEXT_PUBLIC_SEPOLIA_EVENT_TICKET_ADDRESS || '',
    EventEscrow: process.env.NEXT_PUBLIC_SEPOLIA_EVENT_ESCROW_ADDRESS || '',
  },

  // Main networks
  mainnet: {
    EventFactory: process.env.NEXT_PUBLIC_MAINNET_EVENT_FACTORY_ADDRESS || '',
    EventTicket: process.env.NEXT_PUBLIC_MAINNET_EVENT_TICKET_ADDRESS || '',
    EventEscrow: process.env.NEXT_PUBLIC_MAINNET_EVENT_ESCROW_ADDRESS || '',
  },

  // Avalanche networks
  avalanche: {
    EventFactory: process.env.NEXT_PUBLIC_AVALANCHE_EVENT_FACTORY_ADDRESS || '',
    EventTicket: process.env.NEXT_PUBLIC_AVALANCHE_EVENT_TICKET_ADDRESS || '',
    EventEscrow: process.env.NEXT_PUBLIC_AVALANCHE_EVENT_ESCROW_ADDRESS || '',
  },

  avalancheFuji: {
    EventFactory:
      process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS || '0x8f0ffd0c3e30df302d3e41a18c06eed5e3a40557', // Fallback to deployment address
    EventTicket:
      process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS || '0xa4723807271cd7bE04D78BA1C6e4E366A3EFD2b8', // From latest deployment
    EventEscrow:
      process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS || '0x6b8AC54D17AfD71cD7348f914EAE9429788098ee', // From latest deployment
  },
} as const;

// Get contract address for current network
export function getContractAddress(
  contractName: keyof typeof CONTRACT_ADDRESSES.localhost,
  chainId?: number
): string {
  const network = getNetworkFromChainId(chainId);
  return CONTRACT_ADDRESSES[network]?.[contractName] || '';
}

// Map chain IDs to network names
function getNetworkFromChainId(
  chainId?: number
): keyof typeof CONTRACT_ADDRESSES {
  switch (chainId) {
    case 1:
      return 'mainnet';
    case 11155111:
      return 'sepolia';
    case 43114:
      return 'avalanche';
    case 43113:
      return 'avalancheFuji';
    case 31337:
    case 1337:
      return 'localhost';
    default:
      return 'localhost';
  }
}

// Contract ABIs (these should be imported from compiled artifacts)
export const CONTRACT_ABIS = {
  EventFactory: [
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
      name: 'getEvents',
      inputs: [{ type: 'uint256[]', name: 'eventIds' }],
      outputs: [
        {
          type: 'tuple[]',
          name: '',
          components: [
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
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getEventsByCreator',
      inputs: [
        { type: 'address', name: 'creator' },
        { type: 'uint256', name: 'offset' },
        { type: 'uint256', name: 'limit' },
      ],
      outputs: [
        {
          type: 'tuple[]',
          name: '',
          components: [
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
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getActiveEvents',
      inputs: [
        { type: 'uint256', name: 'offset' },
        { type: 'uint256', name: 'limit' },
      ],
      outputs: [
        {
          type: 'tuple[]',
          name: '',
          components: [
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
        },
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
  ] as const,
  
  EventTicket: [
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
      name: 'TicketMinted',
      inputs: [
        { type: 'uint256', name: 'tokenId', indexed: true },
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'attendee', indexed: true },
        { type: 'string', name: 'attendeeName' },
        { type: 'uint256', name: 'price' },
      ],
    },
    {
      type: 'event',
      name: 'TicketUsed',
      inputs: [
        { type: 'uint256', name: 'tokenId', indexed: true },
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'attendee', indexed: true },
      ],
    },
    {
      type: 'event',
      name: 'TicketApproved',
      inputs: [
        { type: 'uint256', name: 'tokenId', indexed: true },
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'attendee', indexed: true },
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
        { type: 'string', name: 'location' },
        { type: 'uint256', name: 'startTime' },
        { type: 'uint256', name: 'endTime' },
        { type: 'uint256', name: 'maxCapacity' },
        { type: 'uint256', name: 'currentTickets' },
        { type: 'uint256', name: 'ticketPrice' },
        { type: 'bool', name: 'isActive' },
        { type: 'string', name: 'baseURI' },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getTicketMetadata',
      inputs: [{ type: 'uint256', name: 'tokenId' }],
      outputs: [
        { type: 'uint256', name: 'eventId' },
        { type: 'address', name: 'eventCreator' },
        { type: 'string', name: 'eventTitle' },
        { type: 'string', name: 'eventLocation' },
        { type: 'uint256', name: 'eventStartTime' },
        { type: 'uint256', name: 'eventEndTime' },
        { type: 'string', name: 'attendeeName' },
        { type: 'string', name: 'attendeeEmail' },
        { type: 'uint256', name: 'purchaseTime' },
        { type: 'uint256', name: 'pricePaid' },
        { type: 'bool', name: 'isUsed' },
        { type: 'bool', name: 'isApproved' },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getEventTickets',
      inputs: [{ type: 'uint256', name: 'eventId' }],
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
      name: 'ownerOf',
      inputs: [{ type: 'uint256', name: 'tokenId' }],
      outputs: [{ type: 'address', name: '' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenURI',
      inputs: [{ type: 'uint256', name: 'tokenId' }],
      outputs: [{ type: 'string', name: '' }],
      stateMutability: 'view',
    },
    // Write functions
    {
      type: 'function',
      name: 'createEvent',
      inputs: [
        { type: 'string', name: 'title' },
        { type: 'string', name: 'location' },
        { type: 'uint256', name: 'startTime' },
        { type: 'uint256', name: 'endTime' },
        { type: 'uint256', name: 'maxCapacity' },
        { type: 'uint256', name: 'ticketPrice' },
        { type: 'bool', name: 'requiresEscrow' },
        { type: 'string', name: 'baseURI' },
      ],
      outputs: [{ type: 'uint256', name: '' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'purchaseTicket',
      inputs: [
        { type: 'uint256', name: 'eventId' },
        { type: 'string', name: 'attendeeName' },
        { type: 'string', name: 'attendeeEmail' },
      ],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'useTicket',
      inputs: [{ type: 'uint256', name: 'tokenId' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'approveTicket',
      inputs: [{ type: 'uint256', name: 'tokenId' }],
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
    {
      type: 'function',
      name: 'updateEventBaseURI',
      inputs: [
        { type: 'uint256', name: 'eventId' },
        { type: 'string', name: 'baseURI' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
  ] as const,
  
  EventEscrow: [
    // Events
    {
      type: 'event',
      name: 'EscrowCreated',
      inputs: [
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'eventCreator', indexed: true },
        { type: 'uint256', name: 'ticketPrice' },
        { type: 'uint256', name: 'eventEndTime' },
      ],
    },
    {
      type: 'event',
      name: 'PaymentReceived',
      inputs: [
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'attendee', indexed: true },
        { type: 'uint256', name: 'amount' },
      ],
    },
    {
      type: 'event',
      name: 'EventCompleted',
      inputs: [
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'eventCreator', indexed: true },
        { type: 'uint256', name: 'totalAmount' },
      ],
    },
    {
      type: 'event',
      name: 'FundsReleased',
      inputs: [
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'eventCreator', indexed: true },
        { type: 'uint256', name: 'amount' },
      ],
    },
    // Read functions
    {
      type: 'function',
      name: 'getEscrowDetails',
      inputs: [{ type: 'uint256', name: 'eventId' }],
      outputs: [
        { type: 'address', name: 'eventCreator' },
        { type: 'uint256', name: 'totalAmount' },
        { type: 'uint256', name: 'ticketPrice' },
        { type: 'uint256', name: 'ticketCount' },
        { type: 'uint256', name: 'eventEndTime' },
        { type: 'bool', name: 'isCompleted' },
        { type: 'bool', name: 'isCancelled' },
        { type: 'bool', name: 'isFundsReleased' },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getAttendeePayment',
      inputs: [
        { type: 'uint256', name: 'eventId' },
        { type: 'address', name: 'attendee' },
      ],
      outputs: [{ type: 'uint256', name: '' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getEventAttendees',
      inputs: [{ type: 'uint256', name: 'eventId' }],
      outputs: [{ type: 'address[]', name: '' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getStats',
      inputs: [],
      outputs: [
        { type: 'uint256', name: 'totalEvents' },
        { type: 'uint256', name: 'totalAmountLocked' },
        { type: 'uint256', name: 'totalCompletedEvents' },
        { type: 'uint256', name: 'totalReleasedAmount' },
      ],
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
      name: 'createEventEscrow',
      inputs: [
        { type: 'uint256', name: 'eventId' },
        { type: 'uint256', name: 'ticketPrice' },
        { type: 'uint256', name: 'eventEndTime' },
      ],
      outputs: [],
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
      name: 'completeEvent',
      inputs: [{ type: 'uint256', name: 'eventId' }],
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
    {
      type: 'function',
      name: 'releaseFunds',
      inputs: [{ type: 'uint256', name: 'eventId' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'refundAttendee',
      inputs: [{ type: 'uint256', name: 'eventId' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
  ] as const,
} as const;

// Contract configuration
export const CONTRACT_CONFIG = {
  // Platform fee in basis points (2.5%)
  DEFAULT_PLATFORM_FEE: 250,

  // Gas limits for different operations
  GAS_LIMITS: {
    CREATE_EVENT: 500000,
    PURCHASE_TICKET: 200000,
    APPROVE_TICKET: 100000,
    USE_TICKET: 100000,
    UPDATE_EVENT: 300000,
    CANCEL_EVENT: 100000,
  },

  // Event statuses
  EVENT_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  // Ticket statuses
  TICKET_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    USED: 'used',
    CANCELLED: 'cancelled',
  },
} as const;
