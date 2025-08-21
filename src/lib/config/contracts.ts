// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Local development
  localhost: {
    EventFactory: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat address
  },
  
  // Test networks
  sepolia: {
    EventFactory: process.env.NEXT_PUBLIC_SEPOLIA_EVENT_FACTORY_ADDRESS || '',
  },
  
  // Main networks
  mainnet: {
    EventFactory: process.env.NEXT_PUBLIC_MAINNET_EVENT_FACTORY_ADDRESS || '',
  },
  
  // Avalanche networks
  avalanche: {
    EventFactory: process.env.NEXT_PUBLIC_AVALANCHE_EVENT_FACTORY_ADDRESS || '',
  },
  
  avalancheFuji: {
    EventFactory: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS || '',
  },
} as const;

// Get contract address for current network
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES.localhost, chainId?: number): string {
  const network = getNetworkFromChainId(chainId);
  return CONTRACT_ADDRESSES[network]?.[contractName] || '';
}

// Map chain IDs to network names
function getNetworkFromChainId(chainId?: number): keyof typeof CONTRACT_ADDRESSES {
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
        { type: 'uint256', name: 'ticketPrice' }
      ]
    },
    {
      type: 'event',
      name: 'TicketPurchased',
      inputs: [
        { type: 'uint256', name: 'ticketId', indexed: true },
        { type: 'uint256', name: 'eventId', indexed: true },
        { type: 'address', name: 'attendee', indexed: true },
        { type: 'uint256', name: 'price' }
      ]
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
        { type: 'uint256', name: 'updatedAt' }
      ],
      stateMutability: 'view'
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
        { type: 'uint256', name: 'pricePaid' }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'getEventStats',
      inputs: [{ type: 'uint256', name: 'eventId' }],
      outputs: [
        { type: 'uint256', name: 'totalRevenue' },
        { type: 'uint256', name: 'totalTicketsSold' },
        { type: 'uint256', name: 'totalAttendees' }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'getUserEvents',
      inputs: [{ type: 'address', name: 'user' }],
      outputs: [{ type: 'uint256[]', name: '' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'getUserTickets',
      inputs: [{ type: 'address', name: 'user' }],
      outputs: [{ type: 'uint256[]', name: '' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'hasTicket',
      inputs: [
        { type: 'uint256', name: 'eventId' },
        { type: 'address', name: 'user' }
      ],
      outputs: [{ type: 'bool', name: '' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'getUserTicketId',
      inputs: [
        { type: 'uint256', name: 'eventId' },
        { type: 'address', name: 'user' }
      ],
      outputs: [{ type: 'uint256', name: '' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'getTotalEvents',
      inputs: [],
      outputs: [{ type: 'uint256', name: '' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'getTotalTickets',
      inputs: [],
      outputs: [{ type: 'uint256', name: '' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'platformFee',
      inputs: [],
      outputs: [{ type: 'uint256', name: '' }],
      stateMutability: 'view'
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
        { type: 'string', name: 'poapMetadata' }
      ],
      outputs: [{ type: 'uint256', name: '' }],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'purchaseTicket',
      inputs: [{ type: 'uint256', name: 'eventId' }],
      outputs: [],
      stateMutability: 'payable'
    },
    {
      type: 'function',
      name: 'approveTicket',
      inputs: [{ type: 'uint256', name: 'ticketId' }],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'useTicket',
      inputs: [{ type: 'uint256', name: 'ticketId' }],
      outputs: [],
      stateMutability: 'nonpayable'
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
        { type: 'bool', name: 'requireApproval' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'cancelEvent',
      inputs: [{ type: 'uint256', name: 'eventId' }],
      outputs: [],
      stateMutability: 'nonpayable'
    }
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
