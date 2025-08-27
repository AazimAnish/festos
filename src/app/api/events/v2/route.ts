/**
 * Fixed Events API v2 - Synchronous Three-Layer Storage
 * 
 * This version ensures proper synchronization and consistency
 * across Database, Blockchain, and IPFS layers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventOrchestrator } from '@/lib/services/integration/event-orchestrator';
import { HealthMonitor } from '@/lib/services/monitoring/health-monitor';
import { ValidationError, StorageError } from '@/lib/services/core/interfaces';

// Initialize services
const orchestrator = new EventOrchestrator();
const healthMonitor = new HealthMonitor();

/**
 * GET /api/events/v2
 * List events with intelligent fallback strategy
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Cap at 100
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      order: (searchParams.get('order') as 'asc' | 'desc') || undefined,
      creatorId: searchParams.get('creatorId') || undefined,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
    };

    // Validate filters
    if (filters.page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    if (filters.limit < 1) {
      return NextResponse.json(
        { error: 'Limit must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate date formats if provided
    if (filters.startDate && isNaN(new Date(filters.startDate).getTime())) {
      return NextResponse.json(
        { error: 'Invalid startDate format' },
        { status: 400 }
      );
    }

    if (filters.endDate && isNaN(new Date(filters.endDate).getTime())) {
      return NextResponse.json(
        { error: 'Invalid endDate format' },
        { status: 400 }
      );
    }

    // Get events with fallback strategy
    const result = await orchestrator.getEvents(filters);
    
    const responseTime = Date.now() - startTime;
    
    // Update health metrics
    healthMonitor.updateMetrics('database', responseTime, true);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        version: '2.0',
        totalLayers: 3,
        primarySource: 'database'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Update health metrics
    healthMonitor.updateMetrics('database', responseTime, false);

    console.error('GET /api/events/v2 error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.message,
          field: error.field 
        },
        { status: 400 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { 
          error: 'Storage error', 
          details: error.message,
          provider: error.provider 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/v2
 * Create event with ACID-like properties across all three layers
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Enhanced validation
    const requiredFields = [
      'title', 'description', 'location', 'startDate', 
      'endDate', 'maxCapacity', 'ticketPrice', 'walletAddress'
    ];

    // Check for missing required fields
    const missingFields = requiredFields.filter(field => 
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          fields: missingFields,
          received: Object.keys(body)
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { 
          error: 'Invalid date format', 
          details: 'startDate and endDate must be valid ISO 8601 dates',
          received: { startDate: body.startDate, endDate: body.endDate }
        },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { 
          error: 'Invalid date range', 
          details: 'End date must be after start date',
          startDate: body.startDate,
          endDate: body.endDate
        },
        { status: 400 }
      );
    }

    if (startDate <= new Date()) {
      return NextResponse.json(
        { 
          error: 'Invalid start date', 
          details: 'Event must start in the future',
          startDate: body.startDate,
          currentTime: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate ticket price
    const ticketPrice = parseFloat(body.ticketPrice);
    if (isNaN(ticketPrice) || ticketPrice < 0) {
      return NextResponse.json(
        { 
          error: 'Invalid ticket price', 
          details: 'Ticket price must be a non-negative number',
          received: body.ticketPrice
        },
        { status: 400 }
      );
    }

    // Validate max capacity
    const maxCapacity = parseInt(body.maxCapacity);
    if (isNaN(maxCapacity) || maxCapacity < 1 || maxCapacity > 1000000) {
      return NextResponse.json(
        { 
          error: 'Invalid max capacity', 
          details: 'Max capacity must be between 1 and 1,000,000',
          received: body.maxCapacity
        },
        { status: 400 }
      );
    }

    // Validate wallet address
    if (!body.walletAddress || !body.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { 
          error: 'Invalid wallet address', 
          details: 'Must be a valid Ethereum address starting with 0x',
          received: body.walletAddress
        },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (body.visibility && !['public', 'private', 'unlisted'].includes(body.visibility)) {
      return NextResponse.json(
        { 
          error: 'Invalid visibility', 
          details: 'Visibility must be one of: public, private, unlisted',
          received: body.visibility
        },
        { status: 400 }
      );
    }

    if (body.tags && !Array.isArray(body.tags)) {
      return NextResponse.json(
        { 
          error: 'Invalid tags format', 
          details: 'Tags must be an array of strings',
          received: body.tags
        },
        { status: 400 }
      );
    }

    // Create event input with validated data
    const eventInput = {
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      location: String(body.location).trim(),
      startDate: body.startDate,
      endDate: body.endDate,
      maxCapacity,
      ticketPrice: body.ticketPrice,
      requireApproval: Boolean(body.requireApproval),
      hasPOAP: Boolean(body.hasPOAP),
      poapMetadata: body.poapMetadata || '',
      visibility: body.visibility || 'public',
      timezone: body.timezone || 'UTC',
      bannerImage: body.bannerImage,
      category: body.category ? String(body.category).trim() : undefined,
      tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : [],
      walletAddress: String(body.walletAddress).toLowerCase(),
      privateKey: body.privateKey, // Optional - will use environment fallback
    };

    // Log event creation attempt (without sensitive data)
    console.log('Creating event:', {
      title: eventInput.title,
      walletAddress: eventInput.walletAddress,
      startDate: eventInput.startDate,
      hasPrivateKey: !!eventInput.privateKey
    });

    // Create event across all layers with enhanced error handling
    const result = await orchestrator.prepareEventCreation(eventInput);
    
    const responseTime = Date.now() - startTime;
    
    // Update health metrics for all providers
    healthMonitor.updateMetrics('database', responseTime, true);
    healthMonitor.updateMetrics('blockchain', responseTime, true);
    healthMonitor.updateMetrics('ipfs', responseTime, true);

    // Return preparation result
    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        version: '2.0',
        step: 'preparation_complete'
      }
    }, { status: 200 });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Update health metrics
    healthMonitor.updateMetrics('database', responseTime, false);
    healthMonitor.updateMetrics('blockchain', responseTime, false);
    healthMonitor.updateMetrics('ipfs', responseTime, false);

    console.error('POST /api/events/v2 error:', error);

    // Handle specific error types
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error', 
          details: error.message,
          field: error.field,
          metadata: {
            responseTime,
            timestamp: new Date().toISOString(),
            version: '2.0'
          }
        },
        { status: 400 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Storage error', 
          details: error.message,
          provider: error.provider,
          operation: error.operation,
          metadata: {
            responseTime,
            timestamp: new Date().toISOString(),
            version: '2.0'
          }
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : 'An unexpected error occurred',
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

