import { NextRequest, NextResponse } from 'next/server';
import { eventSearchSchema, type EventSearchInput } from '@/lib/schemas/event';
import { apiErrorHandler } from '@/shared/utils/error-handler';
import { EventService } from '@/lib/services/event-service';
import { PAGINATION_CONFIG } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Extract and validate query parameters
    const queryParams: Record<string, string | string[]> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === 'tags') {
        // Handle array parameters
        if (!queryParams[key]) {
          queryParams[key] = [];
        }
        (queryParams[key] as string[]).push(value);
      } else {
        queryParams[key] = value;
      }
    }

    // Convert to proper types for validation
    const validatedParams: EventSearchInput = {
      query: queryParams.query as string || undefined,
      category: queryParams.category as string || undefined,
      location: queryParams.location as string || undefined,
      startDate: queryParams.startDate as string || undefined,
      endDate: queryParams.endDate as string || undefined,
      priceRange: queryParams.priceRange ? JSON.parse(queryParams.priceRange as string) : undefined,
      tags: queryParams.tags as string[] || undefined,
      page: parseInt(queryParams.page as string) || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
      limit: Math.min(
        parseInt(queryParams.limit as string) || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        PAGINATION_CONFIG.MAX_PAGE_SIZE
      ),
    };

    // Blockchain data is always included in the current implementation

    // Validate parameters
    const validatedData = eventSearchSchema.parse(validatedParams);

    // Get events using service
    const eventService = new EventService();
    const result = await eventService.listEvents(validatedData);

    return NextResponse.json({
      success: true,
      events: result.events,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / validatedData.limit),
        hasNext: result.total > validatedData.page * validatedData.limit,
        hasPrev: validatedData.page > 1,
      },
      filters: {
        applied: validatedData,
        available: result.availableFilters,
      },
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
