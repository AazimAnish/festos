/**
 * Events API - Get Similar Events
 * 
 * Get events similar to the given event by category, location, or tags
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { EventOrchestrator } from '@/lib/services/integration/event-orchestrator';

// Initialize services
const eventService = new EventService();
const orchestrator = new EventOrchestrator();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { eventId } = await params;
    
    if (!eventId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Event ID is required' 
        },
        { status: 400 }
      );
    }

    try {
      // Get the event using orchestrator instead of direct service
      const event = await orchestrator.getEventById(eventId);
      
      if (!event) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Event not found' 
          },
          { status: 404 }
        );
      }
    
      // Create filters based on event details
      const filters = {
        category: event.category,
        location: event.location,
        limit: 3,
        page: 1,
      };
      
      // Get similar events (excluding the current event)
      const result = await eventService.listEvents(filters, false);
      
      // Filter out the current event
      const similarEvents = result.events.filter(e => e.id !== eventId);
      
      // If we don't have enough results, try with broader filters
      if (similarEvents.length < 3) {
        // Try with just the category
        const categoryResult = await eventService.listEvents({
          category: event.category,
          limit: 5,
          page: 1,
        }, false);
        
        // Add events that aren't already included
        const categoryEvents = categoryResult.events.filter(
          e => e.id !== eventId && !similarEvents.some(se => se.id === e.id)
        );
        
        // Add category events until we have 3 or run out
        for (let i = 0; i < categoryEvents.length && similarEvents.length < 3; i++) {
          similarEvents.push(categoryEvents[i]);
        }
      }
      
      // If we still don't have enough, just get the latest events
      if (similarEvents.length < 3) {
        const latestResult = await eventService.listEvents({
          limit: 5,
          page: 1,
        }, false);
        
        // Add events that aren't already included
        const latestEvents = latestResult.events.filter(
          e => e.id !== eventId && !similarEvents.some(se => se.id === e.id)
        );
        
        // Add latest events until we have 3 or run out
        for (let i = 0; i < latestEvents.length && similarEvents.length < 3; i++) {
          similarEvents.push(latestEvents[i]);
        }
      }
      
      // Map to simplified format for display
      const mappedEvents = similarEvents.map(e => ({
        id: e.id,
        title: e.title,
        location: e.location,
        price: e.ticketPrice === '0' ? 'Free' : `${e.ticketPrice} ETH`,
        image: e.bannerImage || '/card1.png',
        date: e.startDate,
      }));

      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: mappedEvents,
        metadata: {
          responseTime,
          timestamp: new Date().toISOString(),
          source: 'database'
        }
      });
    } catch (innerError) {
      console.error('Error fetching similar events:', innerError);
      throw innerError;
    }
  } catch (error) {
    console.error('GET /api/events/similar/[eventId] error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}