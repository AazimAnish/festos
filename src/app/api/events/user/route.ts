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

    // Get user's created events from database
    const events = await eventService.getEventsByCreator(user.wallet_address);

    // Transform events to match the expected format
    const transformedEvents = events?.map(event => ({
      id: event.id,
      uniqueId: event.id,
      title: event.title || 'Untitled Event',
      description: event.description || '',
      location: event.location || '',
      price: event.ticketPrice === '0' ? 'Free' : `${event.ticketPrice} AVAX`,
      image: event.bannerImage || '/default-event.jpg',
      joinedCount: event.currentAttendees || 0,
      maxCapacity: event.maxCapacity || 0,
      hasPOAP: event.hasPOAP || false,
      isSaved: false, // TODO: Implement saved events functionality
      category: event.category || 'General',
      date: event.startDate || '',
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: event.timezone || 'UTC',
      visibility: event.visibility || 'public',
      status: event.status === 'draft' ? 'pending' : event.status || 'active',
      createdAt: event.createdAt,
      contractEventId: event.contractEventId,
      transactionHash: event.transactionHash,
      contractAddress: event.contractAddress,
      contractChainId: event.contractChainId,
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        events: transformedEvents,
        total: transformedEvents.length,
      },
      message: 'Events fetched successfully',
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}