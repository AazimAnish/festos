/**
 * Events API - Fix Escrow for Existing Events
 * 
 * This API allows event creators to create escrow contracts for events
 * that were created on the blockchain but don't have escrow contracts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { EventService } from '@/lib/services/event-service';
import { getAvalancheFujiEventEscrowContract } from '@/lib/contracts/avalanche-escrow-client';
import { parseEther } from 'viem';

interface FixEscrowRequest {
  eventId: string;
  signedTransaction?: Record<string, unknown>;
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
    const body: FixEscrowRequest = await request.json();
    const { eventId, signedTransaction } = body;

    // Validate required fields
    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Event ID is required' },
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

    // Check if user is the event creator
    if (event.creatorId !== user.wallet_address) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Only the event creator can create escrow contracts' },
        { status: 403 }
      );
    }

    // Check if event has blockchain integration
    if (!event.contractEventId || event.contractEventId === 0) {
      return NextResponse.json(
        { error: 'Event not on blockchain', message: 'This event needs to be created on the blockchain first' },
        { status: 400 }
      );
    }

    // If signed transaction is provided, process the escrow creation
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
        if ((signedTransaction.userWalletAddress as string)?.toLowerCase() !== user.wallet_address.toLowerCase()) {
          return NextResponse.json(
            { error: 'Transaction signature mismatch', message: 'Transaction was not signed by the authenticated user' },
            { status: 401 }
          );
        }

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          data: {
            eventId,
            escrowTransactionHash: signedTransaction.transactionHash,
            contractEventId: event.contractEventId,
          },
          message: 'Escrow contract created successfully',
          metadata: {
            responseTime,
            timestamp: new Date().toISOString(),
          },
        });

      } catch (error) {
        console.error('Escrow creation error:', error);
        return NextResponse.json(
          { error: 'Escrow creation failed', message: 'Failed to create escrow contract' },
          { status: 500 }
        );
      }
    }

    // If no signed transaction, return escrow creation preparation data
    const escrowContract = getAvalancheFujiEventEscrowContract();
    
    // Convert ticket price to wei
    const ticketPriceWei = parseEther(event.ticketPrice);
    
    // Convert end date to Unix timestamp
    const endTimeUnix = Math.floor(new Date(event.endDate).getTime() / 1000);

    const transactionData = {
      address: escrowContract.address,
      abi: escrowContract.abi,
      functionName: 'createEventEscrow',
      args: [
        event.contractEventId.toString(), // Use the existing contract event ID
        ticketPriceWei.toString(), // ticketPrice in wei
        endTimeUnix.toString(), // eventEndTime
      ],
      chainId: 43113, // Avalanche Fuji testnet
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        contractEventId: event.contractEventId,
        transactionData,
        event: {
          id: event.id,
          title: event.title,
          location: event.location,
          endDate: event.endDate,
          ticketPrice: event.ticketPrice,
        },
      },
      message: 'Escrow creation preparation successful',
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Fix escrow API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
