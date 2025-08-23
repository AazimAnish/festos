import type { Abi } from 'viem';

export interface Event {
  eventId: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  maxCapacity: bigint;
  currentAttendees: bigint;
  ticketPrice: bigint;
  isActive: boolean;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Ticket {
  ticketId: bigint;
  eventId: bigint;
  attendee: `0x${string}`;
  purchaseTime: bigint;
  isUsed: boolean;
  isApproved: boolean;
  pricePaid: bigint;
}

export interface EventStats {
  totalRevenue: bigint;
  totalTicketsSold: bigint;
  totalAttendees: bigint;
}

export interface CreateEventParams {
  title: string;
  description: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  maxCapacity: bigint;
  ticketPrice: bigint;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata: string;
}

export interface UpdateEventParams {
  eventId: bigint;
  title: string;
  description: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  maxCapacity: bigint;
  ticketPrice: bigint;
  requireApproval: boolean;
}

export interface EventFactoryEvents {
  EventCreated: {
    eventId: bigint;
    creator: `0x${string}`;
    title: string;
    startTime: bigint;
    ticketPrice: bigint;
  };
  EventUpdated: {
    eventId: bigint;
    creator: `0x${string}`;
    title: string;
  };
  EventCancelled: {
    eventId: bigint;
    creator: `0x${string}`;
  };
  TicketPurchased: {
    ticketId: bigint;
    eventId: bigint;
    attendee: `0x${string}`;
    price: bigint;
  };
  TicketApproved: {
    ticketId: bigint;
    eventId: bigint;
    attendee: `0x${string}`;
  };
  TicketUsed: {
    ticketId: bigint;
    eventId: bigint;
    attendee: `0x${string}`;
  };
  POAPMinted: {
    eventId: bigint;
    attendee: `0x${string}`;
    poapMetadata: string;
  };
}

export interface EventFactoryReadFunctions {
  getEvent: (eventId: bigint) => Promise<Event>;
  getEvents: (eventIds: bigint[]) => Promise<Event[]>;
  getEventsByCreator: (creator: `0x${string}`, offset: bigint, limit: bigint) => Promise<Event[]>;
  getActiveEvents: (offset: bigint, limit: bigint) => Promise<Event[]>;
  getTicket: (ticketId: bigint) => Promise<Ticket>;
  getEventStats: (eventId: bigint) => Promise<EventStats>;
  getUserEvents: (user: `0x${string}`) => Promise<bigint[]>;
  getUserTickets: (user: `0x${string}`) => Promise<bigint[]>;
  hasTicket: (eventId: bigint, user: `0x${string}`) => Promise<boolean>;
  getUserTicketId: (eventId: bigint, user: `0x${string}`) => Promise<bigint>;
  getContractBalance: () => Promise<bigint>;
  getTotalEvents: () => Promise<bigint>;
  getTotalTickets: () => Promise<bigint>;
  platformFee: () => Promise<bigint>;
  nextEventId: () => Promise<bigint>;
  nextTicketId: () => Promise<bigint>;
}

export interface EventFactoryWriteFunctions {
  createEvent: (params: CreateEventParams) => Promise<`0x${string}`>;
  updateEvent: (params: UpdateEventParams) => Promise<`0x${string}`>;
  cancelEvent: (eventId: bigint) => Promise<`0x${string}`>;
  purchaseTicket: (eventId: bigint, value: bigint) => Promise<`0x${string}`>;
  approveTicket: (ticketId: bigint) => Promise<`0x${string}`>;
  useTicket: (ticketId: bigint) => Promise<`0x${string}`>;
  updatePlatformFee: (newFee: bigint) => Promise<`0x${string}`>;
  withdrawPlatformFees: () => Promise<`0x${string}`>;
}

export interface EventFactoryContract {
  address: `0x${string}`;
  abi: Abi;
  read: EventFactoryReadFunctions;
  write: EventFactoryWriteFunctions;
}
