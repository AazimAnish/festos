/**
 * Events API - Get Event Details
 * 
 * Get detailed information for a single event by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventOrchestrator } from '@/lib/services/integration/event-orchestrator';
import { HealthMonitor } from '@/lib/services/monitoring/health-monitor';

// Initialize services
const orchestrator = new EventOrchestrator();
const healthMonitor = new HealthMonitor();

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

    // Get event with cross-layer verification
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

    const responseTime = Date.now() - startTime;
    healthMonitor.updateMetrics('database', responseTime, true);

    return NextResponse.json({
      success: true,
      data: event,
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        source: event.storageProvider || 'database'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    healthMonitor.updateMetrics('database', responseTime, false);

    console.error('GET /api/events/[eventId] error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
        metadata: {
          responseTime,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
