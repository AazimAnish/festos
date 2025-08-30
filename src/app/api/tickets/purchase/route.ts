import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { EventService } from '@/lib/services/event-service';
import { ValidationError } from '@/lib/services/core/interfaces';
import { parseEther } from 'viem';
import { getAvalancheFujiEventEscrowContract } from '@/lib/contracts/avalanche-escrow-client';
import { getAvalancheFujiEventTicketContract } from '@/lib/contracts/avalanche-ticket-client';

interface PurchaseTicketRequest {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  signedTransaction?: {
    transactionHash: string;
    userWalletAddress: string;
    chainId: number;
    contractAddress: string;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: PurchaseTicketRequest = await request.json();
    const { eventId, attendeeName, attendeeEmail, signedTransaction } = body;

    // Validate required fields
    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Event ID, attendee name, and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attendeeEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Initialize services
    const eventService = new EventService();

    // Get event details from database
    const event = await eventService.getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found', message: 'The specified event does not exist' },
        { status: 404 }
      );
    }

    // Check if event is active
    if (event.status !== 'active') {
      return NextResponse.json(
        { error: 'Event not active', message: 'This event is not currently accepting registrations' },
        { status: 400 }
      );
    }

    // Check if event has started
    const now = new Date();
    if (new Date(event.startDate) <= now) {
      return NextResponse.json(
        { error: 'Event has started', message: 'Registration is closed for this event' },
        { status: 400 }
      );
    }

    // Check if user already has a ticket
    const existingTicket = await eventService.getUserTicketForEvent(eventId, user.wallet_address);
    if (existingTicket) {
      return NextResponse.json(
        { error: 'Already registered', message: 'You already have a ticket for this event' },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.maxCapacity > 0 && (event.currentAttendees || 0) >= event.maxCapacity) {
      return NextResponse.json(
        { error: 'Event full', message: 'This event has reached maximum capacity' },
        { status: 400 }
      );
    }

    const ticketPrice = parseFloat(event.ticketPrice);
    const isFreeEvent = ticketPrice === 0;
    const ticketPriceWei = parseEther(event.ticketPrice);

    // Check if event has been properly created on the blockchain
    if (!event.contractEventId || event.contractEventId === 0) {
      return NextResponse.json(
        { 
          error: 'Event not ready for ticket purchase', 
          message: 'This event has not been properly created on the blockchain yet. Please contact the event organizer to complete the setup.',
          errorType: 'missing_blockchain_integration'
        },
        { status: 400 }
      );
    }

    // For paid events, verify that the escrow contract exists
    if (!isFreeEvent) {
      try {
        const escrowContract = getAvalancheFujiEventEscrowContract();
        
        await escrowContract.publicClient.readContract({
          address: escrowContract.address,
          abi: escrowContract.abi,
          functionName: 'getEscrowDetails',
          args: [BigInt(event.contractEventId)],
        });
      } catch (error) {
        console.error('Escrow contract verification failed:', error);
        return NextResponse.json(
          { 
            error: 'Escrow not found', 
            message: 'This event exists on the blockchain but doesn\'t have an escrow contract. The event organizer needs to create the escrow contract to enable ticket purchases.',
            errorType: 'missing_escrow_contract',
            contractEventId: event.contractEventId
          },
          { status: 400 }
        );
      }
    }

    // If signed transaction is provided, process the completed purchase
    if (signedTransaction) {
      try {
        // Validate signed transaction data
        if (!signedTransaction.transactionHash) {
          return NextResponse.json(
            { error: 'Invalid signed transaction data', message: 'Missing transaction hash' },
            { status: 400 }
          );
        }

        // Verify the transaction was signed by the authenticated user
        if (signedTransaction.userWalletAddress.toLowerCase() !== user.wallet_address.toLowerCase()) {
          return NextResponse.json(
            { error: 'Transaction signature mismatch', message: 'Transaction was not signed by the authenticated user' },
            { status: 401 }
          );
        }
        
        // Get or create user in database
        const attendeeId = await eventService.getOrCreateUser(user.wallet_address);
        
        // Create ticket in database
        const ticket = await eventService.createTicket({
          eventId,
          attendeeId,
          attendeeName,
          attendeeEmail,
          pricePaid: event.ticketPrice,
          ticketType: 'general',
          contractAddress: signedTransaction.contractAddress,
          contractChainId: 43113, // Avalanche Fuji
          transactionHash: signedTransaction.transactionHash,
        });

        // Update event attendee count
        await eventService.updateEventAttendeeCount(eventId, (event.currentAttendees || 0) + 1);

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          data: {
            ticket: {
              id: ticket.id,
              eventId: ticket.event_id,
              attendeeName: attendeeName,
              attendeeEmail: attendeeEmail,
              pricePaid: ticket.price_paid,
              purchaseTime: ticket.purchase_time,
              isApproved: ticket.is_approved,
              contractTicketId: ticket.contract_ticket_id,
              transactionHash: ticket.transaction_hash,
            },
            event: {
              id: event.id,
              title: event.title,
              location: event.location,
              startDate: event.startDate,
              endDate: event.endDate,
              ticketPrice: event.ticketPrice,
              currentAttendees: (event.currentAttendees || 0) + 1,
              maxCapacity: event.maxCapacity,
            },
          },
          message: 'Ticket purchased successfully',
          metadata: {
            responseTime,
            timestamp: new Date().toISOString(),
          },
        });

      } catch (error) {
        console.error('Ticket purchase completion error:', error);
        
        // Handle specific database constraint violations
        if (error && typeof error === 'object' && 'code' in error) {
          const dbError = error as { code: string; message: string };
          
          if (dbError.code === '23505' && dbError.message.includes('tickets_event_id_attendee_id_key')) {
            return NextResponse.json(
              { error: 'Already registered', message: 'You already have a ticket for this event' },
              { status: 400 }
            );
          }
        }
        
        if (error instanceof Error) {
          if (error.message.includes('duplicate key value violates unique constraint') || 
              error.message.includes('You already have a ticket for this event')) {
            return NextResponse.json(
              { error: 'Already registered', message: 'You already have a ticket for this event' },
              { status: 400 }
            );
          }
        }
        
        return NextResponse.json(
          { error: 'Purchase failed', message: 'Failed to process ticket purchase. Please try again.' },
          { status: 500 }
        );
      }
    }

    // If no signed transaction, return purchase preparation data
    let transactionData;

    if (isFreeEvent) {
      // For free events, use EventTicket contract directly
      const ticketContract = getAvalancheFujiEventTicketContract();
      
      transactionData = {
        address: ticketContract.address,
        abi: ticketContract.abi,
        functionName: 'purchaseTicket',
        args: [
          (event.contractEventId || 0).toString(),
          attendeeName,
          attendeeEmail,
        ],
        value: '0', // Free event
        chainId: 43113,
      };
    } else {
      // For paid events, use EventEscrow contract first
      const escrowContract = getAvalancheFujiEventEscrowContract();
      
      transactionData = {
        address: escrowContract.address,
        abi: escrowContract.abi,
        functionName: 'purchaseTicket',
        args: [
          (event.contractEventId || 0).toString(),
        ],
        value: ticketPriceWei.toString(),
        chainId: 43113,
      };
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        purchaseDetails: {
          eventId: (event.contractEventId || 0).toString(),
          attendeeName,
          attendeeEmail,
          value: ticketPriceWei.toString(),
          ticketPrice: event.ticketPrice,
          isFreeEvent,
        },
        transactionData,
        event: {
          id: event.id,
          title: event.title,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          ticketPrice: event.ticketPrice,
          currentAttendees: event.currentAttendees || 0,
          maxCapacity: event.maxCapacity,
        },
      },
      message: 'Purchase preparation successful',
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Ticket purchase API error:', error);

    // Handle specific database constraint violations
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message: string };
      
      if (dbError.code === '23505' && dbError.message.includes('tickets_event_id_attendee_id_key')) {
        return NextResponse.json(
          { error: 'Already registered', message: 'You already have a ticket for this event' },
          { status: 400 }
        );
      }
    }

    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.message },
        { status: 400 }
      );
    }

    // Handle other specific errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return NextResponse.json(
          { error: 'Already registered', message: 'You already have a ticket for this event' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}