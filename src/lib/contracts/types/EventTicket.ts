export interface TicketMetadata {
  eventId: bigint;
  eventCreator: `0x${string}`;
  eventTitle: string;
  eventLocation: string;
  eventStartTime: bigint;
  eventEndTime: bigint;
  attendeeName: string;
  attendeeEmail: string;
  purchaseTime: bigint;
  pricePaid: bigint;
  isUsed: boolean;
  isApproved: boolean;
}

export interface EventTicketEvent {
  eventId: bigint;
  creator: `0x${string}`;
  title: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  maxCapacity: bigint;
  currentTickets: bigint;
  ticketPrice: bigint;
  isActive: boolean;
  baseURI: string;
}

export interface CreateEventParams {
  title: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  maxCapacity: bigint;
  ticketPrice: bigint | string;
  baseURI: string;
}

export interface PurchaseTicketParams {
  eventId: bigint;
  attendeeName: string;
  attendeeEmail: string;
  value: bigint | string;
}
