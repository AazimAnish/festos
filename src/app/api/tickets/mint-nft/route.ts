import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { getAvalancheFujiEventTicketContract } from '@/lib/contracts/avalanche-ticket-client';
import { EventService } from '@/lib/services/event-service';

interface MintNFTRequest {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  signedTransaction: {
    transactionHash: string;
    userWalletAddress: string;
  };
}

export async function POST(request: NextRequest) {
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
    const body: MintNFTRequest = await request.json();
    const { eventId, attendeeName, attendeeEmail, signedTransaction } = body;

    // Validate required fields
    if (!eventId || !attendeeName || !attendeeEmail || !signedTransaction) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Event ID, attendee details, and signed transaction are required' },
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

    // Get event details to ensure it exists and get contract event ID
    const eventService = new EventService();
    const event = await eventService.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found', message: 'The specified event does not exist' },
        { status: 404 }
      );
    }

    if (!event.contractEventId) {
      return NextResponse.json(
        { error: 'Event not ready', message: 'This event has not been properly set up on the blockchain' },
        { status: 400 }
      );
    }

    // Get EventTicket contract
    const ticketContract = getAvalancheFujiEventTicketContract();

    // For free events, prepare NFT minting transaction
    const mintTransactionData = {
      address: ticketContract.address,
      abi: ticketContract.abi,
      functionName: 'purchaseTicket',
      args: [
        event.contractEventId.toString(), // eventId from database
        attendeeName,
        attendeeEmail,
      ],
      value: '0', // No payment needed for NFT minting (already handled by escrow or free event)
      chainId: 43113, // Avalanche Fuji
    };

    return NextResponse.json({
      success: true,
      data: {
        mintTransactionData,
        event: {
          id: event.id,
          title: event.title,
          contractEventId: event.contractEventId,
        },
      },
      message: 'NFT minting transaction prepared successfully',
    });

  } catch (error) {
    console.error('NFT minting API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'NFT minting failed', message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred during NFT preparation' },
      { status: 500 }
    );
  }
}
