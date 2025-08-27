import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Wallet authentication required',
        message: 'Please connect your wallet to create an event'
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'title', 'description', 'location', 'startDate', 
      'endDate', 'maxCapacity', 'ticketPrice'
    ];

    const missingFields = requiredFields.filter(field => 
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields', 
          fields: missingFields,
          received: Object.keys(body)
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid date format', 
          details: 'startDate and endDate must be valid ISO 8601 dates',
          received: { startDate: body.startDate, endDate: body.endDate }
        },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid date range', 
          details: 'End date must be after start date',
          startDate: body.startDate,
          endDate: body.endDate
        },
        { status: 400 }
      );
    }

    // Create event input
    const eventInput = {
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      location: String(body.location).trim(),
      startDate: body.startDate,
      endDate: body.endDate,
      maxCapacity: parseInt(body.maxCapacity) || 0,
      ticketPrice: body.ticketPrice,
      requireApproval: Boolean(body.requireApproval),
      hasPOAP: Boolean(body.hasPOAP),
      poapMetadata: body.poapMetadata || '',
      visibility: body.visibility || 'public',
      timezone: body.timezone || 'UTC',
      bannerImage: body.bannerImage,
      category: body.category ? String(body.category).trim() : 'General',
      tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : [],
      walletAddress: user.wallet_address,
    };

    // Create event using EventService
    const eventService = new EventService();
    const createdEvent = await eventService.createEvent(eventInput);

    return NextResponse.json({
      success: true,
      data: {
        event: createdEvent,
        message: 'Event created successfully',
        timestamp: new Date().toISOString(),
        userWalletAddress: user.wallet_address
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Event creation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
