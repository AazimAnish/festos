/**
 * Events API - Setup Blockchain Integration
 * 
 * This API allows event creators to complete the blockchain setup for events
 * that were created in the database but don't have blockchain integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { EventService } from '@/lib/services/event-service';
import { getAvalancheFujiEventFactoryContract } from '@/lib/contracts/avalanche-client';
import { parseEther } from 'viem';

interface SetupBlockchainRequest {
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
    const body: SetupBlockchainRequest = await request.json();
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
        { error: 'Unauthorized', message: 'Only the event creator can setup blockchain integration' },
        { status: 403 }
      );
    }

    // Check if event already has blockchain integration
    if (event.contractEventId && event.contractEventId > 0) {
      return NextResponse.json(
        { error: 'Already setup', message: 'This event already has blockchain integration' },
        { status: 400 }
      );
    }

    // If signed transaction is provided, process the setup
    if (signedTransaction) {
      try {
        // Validate signed transaction data
        if (!signedTransaction.transactionHash || !signedTransaction.eventId) {
          return NextResponse.json(
            { error: 'Invalid signed transaction data', message: 'Missing transaction hash or event ID' },
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

        // Update event with blockchain data
        await eventService.updateEventWithBlockchainData(
          eventId,
          Number(signedTransaction.eventId),
          signedTransaction.transactionHash as string,
          signedTransaction.contractAddress as string,
          Number(signedTransaction.chainId)
        );

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          data: {
            eventId,
            contractEventId: signedTransaction.eventId,
            transactionHash: signedTransaction.transactionHash,
            contractAddress: signedTransaction.contractAddress,
            chainId: signedTransaction.chainId,
          },
          message: 'Blockchain integration completed successfully',
          metadata: {
            responseTime,
            timestamp: new Date().toISOString(),
          },
        });

      } catch (error) {
        console.error('Blockchain setup error:', error);
        return NextResponse.json(
          { error: 'Setup failed', message: 'Failed to complete blockchain setup' },
          { status: 500 }
        );
      }
    }

    // If no signed transaction, return setup preparation data
    const contract = getAvalancheFujiEventFactoryContract();
    
    // Convert ticket price to wei
    const ticketPriceWei = parseEther(event.ticketPrice);
    
    // Convert dates to Unix timestamps
    const startTimeUnix = Math.floor(new Date(event.startDate).getTime() / 1000);
    const endTimeUnix = Math.floor(new Date(event.endDate).getTime() / 1000);

    const transactionData = {
      address: contract.address,
      abi: contract.abi,
      functionName: 'createEvent',
      args: [
        event.title,
        event.description,
        event.location,
        startTimeUnix.toString(),
        endTimeUnix.toString(),
        event.maxCapacity.toString(),
        ticketPriceWei.toString(),
        event.requireApproval,
        event.hasPOAP,
        event.poapMetadata || '',
      ],
      chainId: 43113, // Avalanche Fuji testnet
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        transactionData,
        event: {
          id: event.id,
          title: event.title,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          ticketPrice: event.ticketPrice,
          maxCapacity: event.maxCapacity,
        },
      },
      message: 'Blockchain setup preparation successful',
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Blockchain setup API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
