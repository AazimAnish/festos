import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { EventService } from '@/lib/services/event-service';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize services
    const eventService = new EventService();

    // Get user's tickets from database
    const tickets = await eventService.getUserTickets(user.wallet_address);

    // Transform tickets to match the expected format
    const transformedTickets = tickets?.map(ticket => ({
      id: ticket.id,
      tokenId: ticket.contract_ticket_id?.toString() || 'N/A',
      eventId: ticket.event_id,
      eventName: ticket.events?.title || 'Unknown Event',
      eventDate: ticket.events?.start_date || '',
      eventLocation: ticket.events?.location || '',
      eventImage: ticket.events?.banner_image || '/default-event.jpg',
      ticketType: ticket.ticket_type || 'General',
      originalPrice: ticket.price_paid || '0',
      ownerAddress: user.wallet_address,
      status: ticket.is_used ? 'used' : ticket.is_approved ? 'valid' : 'pending',
      transferable: !ticket.is_used && ticket.is_approved,
      mintedAt: ticket.purchase_time,
      usedAt: ticket.used_time,
      hasPOAP: false, // TODO: Implement POAP integration
      poapTokenId: undefined,
      transactionHash: ticket.transaction_hash,
      contractAddress: ticket.contract_address,
      contractChainId: ticket.contract_chain_id,
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        tickets: transformedTickets,
        total: transformedTickets.length,
      },
      message: 'Tickets fetched successfully',
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
