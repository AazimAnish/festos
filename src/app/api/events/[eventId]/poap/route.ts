/**
 * POAP (Proof of Attendance Protocol) Integration API
 * 
 * Issue POAP badges for event attendance
 * Uses POAP API: https://documentation.poap.tech/docs/getting-started
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';

const eventService = new EventService();

// POAP API configuration
const POAP_API_BASE = 'https://api.poap.tech';
const POAP_API_KEY = process.env.POAP_API_KEY;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { eventId } = await params;
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, attendeeAddress } = body;

    // Get event details
    const event = await eventService.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    switch (action) {
      case 'create_drop':
        return await createPOAPDrop(event, user, startTime);
      
      case 'mint_poap':
        return await mintPOAP(event, attendeeAddress, user, startTime);
      
      case 'get_poaps':
        return await getUserPOAPs(attendeeAddress, startTime);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          details: 'Supported actions: create_drop, mint_poap, get_poaps'
        }, { status: 400 });
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('POAP API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error))
        : undefined,
      metadata: {
        responseTime,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

async function createPOAPDrop(event: any, creator: any, startTime: number) {
  if (!POAP_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'POAP API not configured',
      details: 'POAP_API_KEY environment variable is required'
    }, { status: 501 });
  }

  try {
    // Check if user is event creator
    if (event.creatorId.toLowerCase() !== creator.wallet_address.toLowerCase()) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        details: 'Only event creators can create POAP drops'
      }, { status: 403 });
    }

    // Prepare POAP drop data
    const dropData = {
      name: `${event.title} - POAP`,
      description: `Proof of attendance for ${event.title}`,
      city: event.location,
      country: 'Global', // Could be extracted from location
      start_date: new Date(event.startDate).toISOString().split('T')[0],
      end_date: new Date(event.endDate).toISOString().split('T')[0],
      expiry_date: new Date(new Date(event.endDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days after event
      event_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.id}`,
      virtual_event: event.location.toLowerCase().includes('online') || event.location.toLowerCase().includes('virtual'),
      image: event.ipfsImageUrl || event.bannerImageUrl || '', // Event banner as POAP image
      secret_code: Math.random().toString(36).substr(2, 9), // Random secret for claiming
      event_template_id: 0,
      email: creator.email || 'noreply@festos.app',
      requested_codes: Math.min(event.maxCapacity || 1000, 1000), // Max 1000 codes per drop
      private_event: event.visibility === 'private'
    };

    // Create POAP drop via API
    const response = await fetch(`${POAP_API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': POAP_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(dropData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`POAP API error: ${error}`);
    }

    const poapEvent = await response.json();

    // Save POAP drop info to database
    await eventService.updateEventPOAPInfo(event.id, {
      poapEventId: poapEvent.id,
      poapSecretCode: dropData.secret_code,
      poapDropCreated: true,
      poapDropCreatedAt: new Date().toISOString()
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        poapEventId: poapEvent.id,
        poapUrl: poapEvent.event_url || `https://app.poap.xyz/token/${poapEvent.id}`,
        secretCode: dropData.secret_code,
        requestedCodes: dropData.requested_codes,
        expiryDate: dropData.expiry_date
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        poapCreated: true
      }
    });

  } catch (error) {
    console.error('Failed to create POAP drop:', error);
    throw error;
  }
}

async function mintPOAP(event: any, attendeeAddress: string, issuer: any, startTime: number) {
  if (!POAP_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'POAP API not configured'
    }, { status: 501 });
  }

  try {
    // Check if event has POAP enabled and drop created
    if (!event.hasPOAP || !event.poapEventId) {
      return NextResponse.json({
        success: false,
        error: 'POAP not available',
        details: 'This event does not have POAP enabled or drop not created'
      }, { status: 400 });
    }

    // Verify attendee has a valid ticket for this event
    const registration = await eventService.getUserRegistration(event.id, attendeeAddress);
    if (!registration || !registration.ticketTokenId) {
      return NextResponse.json({
        success: false,
        error: 'No valid ticket found',
        details: 'Attendee must have a valid ticket to claim POAP'
      }, { status: 400 });
    }

    // Check if POAP already minted for this attendee
    const existingPOAP = await eventService.getUserPOAPForEvent(event.id, attendeeAddress);
    if (existingPOAP) {
      return NextResponse.json({
        success: false,
        error: 'POAP already claimed',
        details: 'This attendee has already claimed their POAP for this event',
        data: existingPOAP
      }, { status: 400 });
    }

    // Mint POAP via API
    const mintData = {
      event_id: event.poapEventId,
      to: attendeeAddress,
      // secret_code: event.poapSecretCode // Some POAP APIs require this
    };

    const response = await fetch(`${POAP_API_BASE}/actions/mint-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': POAP_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(mintData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`POAP mint error: ${error}`);
    }

    const poapToken = await response.json();

    // Save POAP mint info to database
    await eventService.createPOAPClaim({
      eventId: event.id,
      attendeeAddress,
      poapTokenId: poapToken.id || poapToken.token_id,
      poapEventId: event.poapEventId,
      transactionHash: poapToken.transaction_hash,
      claimedAt: new Date().toISOString()
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        poapTokenId: poapToken.id || poapToken.token_id,
        poapUrl: `https://app.poap.xyz/token/${poapToken.id || poapToken.token_id}`,
        transactionHash: poapToken.transaction_hash,
        attendeeAddress,
        eventId: event.id
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        poapMinted: true
      }
    });

  } catch (error) {
    console.error('Failed to mint POAP:', error);
    throw error;
  }
}

async function getUserPOAPs(address: string, startTime: number) {
  if (!POAP_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'POAP API not configured'
    }, { status: 501 });
  }

  try {
    // Get POAPs from POAP API
    const response = await fetch(`${POAP_API_BASE}/actions/scan/${address}`, {
      headers: {
        'X-API-Key': POAP_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`POAP API error: ${response.statusText}`);
    }

    const poaps = await response.json();
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        address,
        poaps: poaps || [],
        count: poaps ? poaps.length : 0
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        source: 'poap_api'
      }
    });

  } catch (error) {
    console.error('Failed to get user POAPs:', error);
    throw error;
  }
}