import { NextRequest, NextResponse } from 'next/server';
import { createEventSchema, type CreateEventInput } from '@/lib/schemas/event';
import { apiErrorHandler } from '@/shared/utils/error-handler';
import { SUCCESS_MESSAGES } from '@/lib/constants';
import { EventService } from '@/lib/services/event-service';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';

export async function POST(request: NextRequest) {
  try {
    // Check wallet authentication
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({
        error: 'Wallet authentication required',
        message: 'Please connect your wallet to create events'
      }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createEventSchema.parse(body) as CreateEventInput;

    // Verify the wallet address matches the authenticated user
    if (validatedData.walletAddress.toLowerCase() !== user.wallet_address.toLowerCase()) {
      return NextResponse.json({
        error: 'Wallet address mismatch',
        message: 'The wallet address in the request does not match your authenticated wallet'
      }, { status: 403 });
    }

    // Create event using service
    const eventService = new EventService();
    const result = await eventService.createEvent(validatedData);

    // Determine success message based on what was created
    let message: string = SUCCESS_MESSAGES.EVENT_CREATED;
    if (
      result.createdOn.blockchain &&
      result.createdOn.database &&
      result.createdOn.filebase
    ) {
      message = 'Event created successfully across all platforms';
    } else if (result.createdOn.blockchain && result.createdOn.filebase) {
      message =
        'Event created on blockchain and Filebase (database not available)';
    } else if (result.createdOn.database && result.createdOn.filebase) {
      message =
        'Event created in database and Filebase (blockchain not available)';
    } else if (result.createdOn.filebase) {
      message =
        'Event created on Filebase only (blockchain and database not available)';
    } else {
      message = 'Event metadata prepared (no storage platforms available)';
    }

    return NextResponse.json({
      success: true,
      event: {
        id: result.eventId,
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        maxCapacity: validatedData.maxCapacity,
        ticketPrice: validatedData.ticketPrice,
        requireApproval: validatedData.requireApproval,
        hasPOAP: validatedData.hasPOAP,
        poapMetadata: validatedData.poapMetadata,
        visibility: validatedData.visibility,
        timezone: validatedData.timezone,
        bannerImage: validatedData.bannerImage,
        category: validatedData.category,
        tags: validatedData.tags,
        slug: result.slug,
        contractEventId: result.contractEventId,
        transactionHash: result.transactionHash,
        filebaseMetadataUrl: result.filebaseMetadataUrl,
        filebaseImageUrl: result.filebaseImageUrl,
        contractChainId: result.contractChainId,
        contractAddress: result.contractAddress,
        storageProvider: result.createdOn.filebase ? 'filebase' : 'database',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message,
      createdOn: result.createdOn,
    });
  } catch (error) {
    const errorResponse = apiErrorHandler(error);
    const responseBody: Record<string, unknown> = {
      error: errorResponse.error,
    };
    if (errorResponse.details) {
      responseBody.details = errorResponse.details;
    }
    return NextResponse.json(responseBody, {
      status: errorResponse.statusCode,
    });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
