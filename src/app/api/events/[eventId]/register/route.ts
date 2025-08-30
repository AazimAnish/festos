/**
 * Event Registration API
 * 
 * Register for an event (free or paid)
 * For free events: creator pays gas (sponsored transaction)
 * For paid events: payment goes into event escrow contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { getAvalancheFujiEventEscrowContract } from '@/lib/contracts/avalanche-escrow-client';
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
        error: 'Authentication required',
        message: 'Please connect your wallet to register for this event'
      }, { status: 401 });
    }

    const body = await request.json();
    const { attendeeName, attendeeEmail, signedTransaction } = body;

    if (!attendeeName || !attendeeEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: 'Attendee name and email are required'
      }, { status: 400 });
    }

    // Get event details
    const event = await eventService.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    // Check if event is still active
    if (!event.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Event is no longer active'
      }, { status: 400 });
    }

    // Check if event has ended
    if (new Date() > new Date(event.endDate)) {
      return NextResponse.json({
        success: false,
        error: 'Event has ended'
      }, { status: 400 });
    }

    // Check if user is already registered
    const existingRegistration = await eventService.getUserRegistration(eventId, user.wallet_address);
    if (existingRegistration) {
      return NextResponse.json({
        success: false,
        error: 'Already registered',
        details: 'You are already registered for this event'
      }, { status: 400 });
    }

    if (signedTransaction) {
      // Handle completed transaction
      return await handleRegistrationTransaction(
        signedTransaction,
        eventId,
        user.wallet_address,
        attendeeName,
        attendeeEmail,
        event,
        startTime
      );
    } else {
      // Prepare transaction data
      return await prepareRegistrationTransaction(
        eventId,
        event,
        user.wallet_address,
        attendeeName,
        attendeeEmail,
        startTime
      );
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Registration API error:', error);
    
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

async function prepareRegistrationTransaction(
  eventId: string,
  event: any,
  walletAddress: string,
  attendeeName: string,
  attendeeEmail: string,
  startTime: number
) {
  try {
    const ticketContract = getAvalancheFujiEventTicketContract();
    const escrowContract = getAvalancheFujiEventEscrowContract();
    
    const isPaidEvent = parseFloat(event.ticketPrice) > 0;
    
    if (isPaidEvent) {
      // For paid events, first purchase ticket through escrow
      const escrowTransactionData = {
        address: escrowContract.address,
        abi: escrowContract.abi,
        functionName: 'purchaseTicket',
        args: [event.blockchainEventId.toString()],
        value: (parseFloat(event.ticketPrice) * 10**18).toString(), // Convert to Wei
        chainId: 43113,
      };

      // Then mint NFT ticket
      const nftTransactionData = {
        address: ticketContract.address,
        abi: ticketContract.abi,
        functionName: 'purchaseTicket',
        args: [
          event.blockchainEventId.toString(),
          attendeeName,
          attendeeEmail
        ],
        value: '0', // Already paid to escrow
        chainId: 43113,
      };

      return NextResponse.json({
        success: true,
        data: {
          isPaidEvent: true,
          ticketPrice: event.ticketPrice,
          transactions: [
            { step: 1, name: 'escrow_payment', data: escrowTransactionData },
            { step: 2, name: 'nft_mint', data: nftTransactionData }
          ],
          attendeeInfo: { name: attendeeName, email: attendeeEmail }
        },
        metadata: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // For free events, just mint NFT ticket
      const nftTransactionData = {
        address: ticketContract.address,
        abi: ticketContract.abi,
        functionName: 'purchaseTicket',
        args: [
          event.blockchainEventId.toString(),
          attendeeName,
          attendeeEmail
        ],
        value: '0',
        chainId: 43113,
      };

      return NextResponse.json({
        success: true,
        data: {
          isPaidEvent: false,
          ticketPrice: '0',
          transactions: [
            { step: 1, name: 'nft_mint', data: nftTransactionData }
          ],
          attendeeInfo: { name: attendeeName, email: attendeeEmail }
        },
        metadata: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Failed to prepare registration transaction:', error);
    throw error;
  }
}

async function handleRegistrationTransaction(
  signedTransaction: any,
  eventId: string,
  walletAddress: string,
  attendeeName: string,
  attendeeEmail: string,
  event: any,
  startTime: number
) {
  try {
    // Validate transaction data
    if (!signedTransaction.transactionHash) {
      return NextResponse.json({
        success: false,
        error: 'Invalid transaction data',
        details: 'Missing transaction hash'
      }, { status: 400 });
    }

    // Create registration record in database
    const registration = await eventService.createRegistration({
      eventId,
      attendeeAddress: walletAddress,
      attendeeName,
      attendeeEmail,
      transactionHash: signedTransaction.transactionHash,
      ticketTokenId: signedTransaction.tokenId || null,
      amountPaid: event.ticketPrice,
      registrationDate: new Date().toISOString(),
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        registrationId: registration.id,
        eventId,
        transactionHash: signedTransaction.transactionHash,
        tokenId: signedTransaction.tokenId,
        ticketPrice: event.ticketPrice,
        attendeeInfo: { name: attendeeName, email: attendeeEmail }
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        blockchainConfirmed: true
      }
    });

  } catch (error) {
    console.error('Failed to handle registration transaction:', error);
    throw error;
  }
}