/**
 * Ticket Scanning API
 * 
 * Verify ticket ownership for event entry
 * Only event creators can scan tickets
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { getAvalancheFujiEventTicketContract } from '@/lib/contracts/avalanche-ticket-client';

const eventService = new EventService();

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
    const { ticketData } = body; // Could be tokenId, QR code data, or wallet address

    // Get event details
    const event = await eventService.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    // Check if user is the event creator
    if (event.creatorId.toLowerCase() !== user.wallet_address.toLowerCase()) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        details: 'Only event creators can scan tickets'
      }, { status: 403 });
    }

    // Verify ticket on blockchain
    const ticketContract = getAvalancheFujiEventTicketContract();
    
    let tokenId: string | null = null;
    let attendeeAddress: string | null = null;
    
    // Handle different types of ticket data
    if (ticketData.tokenId) {
      tokenId = ticketData.tokenId;
    } else if (ticketData.attendeeAddress) {
      attendeeAddress = ticketData.attendeeAddress;
      // Get user's ticket ID for this event
      if (attendeeAddress) {
        tokenId = await getUserTicketIdForEvent(event.blockchainEventId || 0, attendeeAddress);
        if (!tokenId) {
          return NextResponse.json({
            success: false,
            error: 'Ticket not found',
            details: 'No ticket found for this attendee'
          }, { status: 404 });
        }
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid ticket data',
        details: 'Token ID or attendee address required'
      }, { status: 400 });
    }

    if (!tokenId) {
      return NextResponse.json({
        success: false,
        error: 'Ticket not found',
        details: 'No valid ticket found for this event'
      }, { status: 404 });
    }

    // Get ticket metadata from blockchain
    const ticketMetadata = await getTicketMetadata(tokenId);
    
    if (!ticketMetadata) {
      return NextResponse.json({
        success: false,
        error: 'Ticket verification failed',
        details: 'Could not verify ticket on blockchain'
      }, { status: 400 });
    }

    // Check if ticket is for this event
    if (ticketMetadata.eventId !== (event.blockchainEventId || 0)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid ticket',
        details: 'Ticket is not for this event'
      }, { status: 400 });
    }

    // Check if ticket is already used
    if (ticketMetadata.isUsed) {
      return NextResponse.json({
        success: false,
        error: 'Ticket already used',
        details: 'This ticket has already been scanned for entry',
        data: {
          tokenId,
          attendeeName: ticketMetadata.attendeeName,
          usedAt: ticketMetadata.usedAt || 'Unknown'
        }
      }, { status: 400 });
    }

    // Mark ticket as used (requires transaction from event creator)
    const useTicketData = {
      address: ticketContract.address,
      abi: ticketContract.abi,
      functionName: 'useTicket',
      args: [tokenId],
      chainId: 43113,
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        tokenId,
        eventId,
        attendeeName: ticketMetadata.attendeeName,
        attendeeEmail: ticketMetadata.attendeeEmail,
        attendeeAddress: ticketMetadata.attendeeAddress,
        isValid: true,
        transactionData: useTicketData
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        verified: true
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Ticket scan API error:', error);
    
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

async function getUserTicketIdForEvent(_eventId: number, _userAddress: string): Promise<string | null> {
  try {
    // This would call the smart contract to get user's ticket ID for the event
    // For now, return null as we need to implement the contract call
    return null;
  } catch (error) {
    console.error('Failed to get user ticket ID:', error);
    return null;
  }
}

async function getTicketMetadata(_tokenId: string): Promise<any | null> {
  try {
    // This would call the smart contract to get ticket metadata
    // For now, return mock data
    return {
      eventId: 1,
      attendeeName: 'Test User',
      attendeeEmail: 'test@example.com',
      attendeeAddress: '0x123...',
      isUsed: false,
      usedAt: null
    };
  } catch (error) {
    console.error('Failed to get ticket metadata:', error);
    return null;
  }
}