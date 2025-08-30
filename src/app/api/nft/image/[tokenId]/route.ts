import { NextRequest, NextResponse } from 'next/server';
import { getAvalancheFujiEventTicketContract } from '@/lib/contracts/avalanche-ticket-client';
import { EventService } from '@/lib/services/event-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const resolvedParams = await params;
    const tokenId = parseInt(resolvedParams.tokenId);
    
    if (isNaN(tokenId) || tokenId <= 0) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    // Get the EventTicket contract to read on-chain data
    const contract = getAvalancheFujiEventTicketContract();
    
    try {
      // Read ticket metadata from blockchain - it returns a tuple
      const rawTicketMetadata = await contract.publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'getTicketMetadata',
        args: [BigInt(tokenId)],
      }) as readonly [bigint, `0x${string}`, string, string, bigint, bigint, string, string, bigint, bigint, boolean, boolean];

      if (!rawTicketMetadata) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        );
      }

      // Extract the ticket metadata from the tuple
      const ticketMetadata = {
        eventId: rawTicketMetadata[0],
        attendeeName: rawTicketMetadata[2],
        attendeeEmail: rawTicketMetadata[3],
        isUsed: rawTicketMetadata[10],
        purchaseTime: rawTicketMetadata[9]
      };

      // Get event details from database
      const eventService = new EventService();
      const event = await eventService.getEventById(ticketMetadata.eventId.toString());
      
      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      // Generate dynamic ticket image using SVG
      const ticketType = event.ticketPrice === '0' ? 'FREE TICKET' : `${event.ticketPrice} AVAX`;
      const status = ticketMetadata.isUsed ? 'USED' : 'VALID';
      const statusColor = ticketMetadata.isUsed ? '#ef4444' : '#10b981';
      
      const svg = `
        <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="800" height="400" fill="url(#bg)"/>
          
          <!-- Decorative elements -->
          <rect x="0" y="0" width="800" height="80" fill="rgba(99, 102, 241, 0.1)"/>
          <rect x="0" y="320" width="800" height="80" fill="rgba(99, 102, 241, 0.1)"/>
          
          <!-- Border -->
          <rect x="10" y="10" width="780" height="380" fill="none" stroke="#6366f1" stroke-width="3"/>
          
          <!-- Festos branding -->
          <text x="400" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#6366f1" text-anchor="middle">FESTOS</text>
          
          <!-- Ticket number -->
          <text x="400" y="80" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">Ticket #${tokenId}</text>
          
          <!-- Event title -->
          <text x="400" y="140" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${event.title}</text>
          
          <!-- Event details -->
          <text x="400" y="170" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">${event.location}</text>
          <text x="400" y="195" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">${new Date(event.startDate).toLocaleDateString()}</text>
          
          <!-- Attendee name -->
          <text x="400" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">${ticketMetadata.attendeeName}</text>
          
          <!-- Ticket type and price -->
          <text x="400" y="260" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">${ticketType}</text>
          
          <!-- Status -->
          <text x="400" y="290" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${statusColor}" text-anchor="middle">${status}</text>
        </svg>
      `;

      // Return SVG with proper headers
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (blockchainError) {
      console.error('Blockchain read error:', blockchainError);
      
      // Fallback: generate basic ticket image using SVG
      const svg = `
        <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="400" fill="#1e293b"/>
          <text x="400" y="150" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#6366f1" text-anchor="middle">FESTOS</text>
          <text x="400" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">Ticket #${tokenId}</text>
          <text x="400" y="240" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" text-anchor="middle">Event Ticket NFT</text>
        </svg>
      `;

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

  } catch (error) {
    console.error('NFT image generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate NFT image' },
      { status: 500 }
    );
  }
}
