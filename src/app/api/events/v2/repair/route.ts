/**
 * POST /api/events/v2/repair
 * Repair consistency issues for a specific event
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventOrchestrator } from '@/lib/services/integration/event-orchestrator';

// Initialize services
const orchestrator = new EventOrchestrator();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { eventId } = body;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Attempt to repair consistency
    const repairResult = await orchestrator.repairEventConsistency(eventId);
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: repairResult.success,
      data: {
        eventId,
        actions: repairResult.actions,
        errors: repairResult.errors,
        repaired: repairResult.success
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        version: '2.0',
        operation: 'repair'
      }
    }, { 
      status: repairResult.success ? 200 : 207 
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('POST /api/events/v2/repair error:', error);

    return NextResponse.json(
      { 
        error: 'Repair operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          responseTime,
          timestamp: new Date().toISOString(),
          version: '2.0'
        }
      },
      { status: 500 }
    );
  }
}


