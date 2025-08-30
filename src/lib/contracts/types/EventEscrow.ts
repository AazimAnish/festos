export interface EventEscrowData {
  eventCreator: `0x${string}`;
  totalAmount: bigint;
  ticketPrice: bigint;
  ticketCount: bigint;
  eventEndTime: bigint;
  isCompleted: boolean;
  isCancelled: boolean;
  isFundsReleased: boolean;
}

export interface EscrowStats {
  totalEvents: bigint;
  totalAmountLocked: bigint;
  totalCompletedEvents: bigint;
  totalReleasedAmount: bigint;
}

export interface CreateEscrowParams {
  eventId: bigint;
  ticketPrice: bigint | string;
  eventEndTime: bigint;
}

export interface PurchaseTicketParams {
  eventId: bigint;
  value: bigint | string;
}

