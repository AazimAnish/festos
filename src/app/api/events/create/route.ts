import { NextRequest, NextResponse } from 'next/server';
import { createEventSchema, type CreateEventInput } from '@/lib/schemas/event';
import { apiErrorHandler } from '@/lib/utils/error-handler';
import { SUCCESS_MESSAGES } from '@/lib/constants';
import { eventService } from '@/lib/services/event-service';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createEventSchema.parse(body) as CreateEventInput;

    // Create event using service
    const result = await eventService.createEvent(validatedData);

    // Determine success message based on what was created
    let message: string = SUCCESS_MESSAGES.EVENT_CREATED;
    if (result.createdOn.blockchain && result.createdOn.database && result.createdOn.filebase) {
      message = 'Event created successfully across all platforms';
    } else if (result.createdOn.blockchain && result.createdOn.filebase) {
      message = 'Event created on blockchain and Filebase (database not available)';
    } else if (result.createdOn.database && result.createdOn.filebase) {
      message = 'Event created in database and Filebase (blockchain not available)';
    } else if (result.createdOn.filebase) {
      message = 'Event created on Filebase only (blockchain and database not available)';
    } else {
      message = 'Event metadata prepared (no storage platforms available)';
    }

    return NextResponse.json({
      success: true,
      event: {
        id: result.eventId,
        title: validatedData.title,
        slug: result.slug,
        contractEventId: result.contractEventId,
        transactionHash: result.transactionHash,
        filebaseMetadataUrl: result.filebaseMetadataUrl,
        filebaseImageUrl: result.filebaseImageUrl,
        contractChainId: result.contractChainId,
        contractAddress: result.contractAddress,
      },
      message,
      createdOn: result.createdOn
    });

  } catch (error) {
    const errorResponse = apiErrorHandler(error);
    const responseBody: Record<string, unknown> = { error: errorResponse.error };
    if (errorResponse.details) {
      responseBody.details = errorResponse.details;
    }
    return NextResponse.json(responseBody, { status: errorResponse.statusCode });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
