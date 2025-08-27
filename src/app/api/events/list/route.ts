/**
 * Events API - List Events
 * 
 * Get paginated list of events with filtering and sorting capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { HealthMonitor } from '@/lib/services/monitoring/health-monitor';
import { eventSearchSchema, type EventSearchInput } from '@/lib/schemas/event';
import { PAGINATION_CONFIG } from '@/lib/constants';

// Initialize services
const eventService = new EventService();
const healthMonitor = new HealthMonitor();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Convert to proper types for validation
    const validatedParams: EventSearchInput = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      priceRange: searchParams.get('priceRange') ? JSON.parse(searchParams.get('priceRange')!) : undefined,
      tags: searchParams.getAll('tags') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(
        parseInt(searchParams.get('limit') || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE.toString()),
        PAGINATION_CONFIG.MAX_PAGE_SIZE
      ),
      includeBlockchain: searchParams.get('includeBlockchain') === 'true',
    };

    // Validate parameters
    const validatedData = eventSearchSchema.parse(validatedParams);

    // Get events using service
    const result = await eventService.listEvents(validatedData, validatedData.includeBlockchain);

    const responseTime = Date.now() - startTime;
    
    // Update health metrics
    healthMonitor.updateMetrics('database', responseTime, true);

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
        available: {
          categories: ['General', 'Technology', 'Music', 'Art', 'Sports', 'Business', 'Education', 'Other'],
          locations: ['Downtown', 'Suburbs', 'Online', 'Venue', 'Park', 'Beach', 'Mountain', 'Other'],
          priceRanges: {
            min: 0,
            max: 1000,
          },
        },
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        source: 'database'
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Update health metrics
    healthMonitor.updateMetrics('database', responseTime, false);
    
    console.error('Error in events list API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          metadata: {
            responseTime,
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        metadata: {
          responseTime,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}