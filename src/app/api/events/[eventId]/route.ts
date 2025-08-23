import { NextRequest, NextResponse } from 'next/server';
import { apiErrorHandler } from '@/shared/utils/error-handler';
import { EventService } from '@/lib/services/event-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get event using service
    const eventService = new EventService();
    const event = await eventService.getEventById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
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

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
