import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { getAvalancheFujiEventTicketContract } from '@/lib/contracts/avalanche-ticket-client';

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

      // Generate NFT metadata in standard format
      const nftMetadata = {
        name: `Festos Ticket #${tokenId}`,
        description: `Official ticket for ${event.title} - ${event.description}`,
        image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://festos.app'}/api/nft/image/${tokenId}`,
        external_url: `https://festos.app/event/${event.id}`,
        attributes: [
          {
            trait_type: 'Event',
            value: event.title
          },
          {
            trait_type: 'Location',
            value: event.location
          },
          {
            trait_type: 'Date',
            value: new Date(event.startDate).toLocaleDateString()
          },
          {
            trait_type: 'Attendee',
            value: ticketMetadata.attendeeName
          },
          {
            trait_type: 'Ticket Type',
            value: event.ticketPrice === '0' ? 'Free' : 'Paid'
          },
          {
            trait_type: 'Price Paid',
            value: `${event.ticketPrice} AVAX`
          },
          {
            trait_type: 'Status',
            value: ticketMetadata.isUsed ? 'Used' : 'Valid'
          },
          {
            trait_type: 'Purchase Date',
            value: new Date(Number(ticketMetadata.purchaseTime) * 1000).toLocaleDateString()
          }
        ],
        properties: {
          files: [
            {
              type: 'image/svg+xml',
              uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://festos.app'}/api/nft/image/${tokenId}`
            }
          ],
          category: 'image',
          eventId: event.id,
          contractEventId: event.contractEventId,
          attendeeName: ticketMetadata.attendeeName,
          attendeeEmail: ticketMetadata.attendeeEmail
        }
      };

      // Return metadata with proper headers for NFT compatibility
      return NextResponse.json(nftMetadata, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });

    } catch (blockchainError) {
      console.error('Blockchain read error:', blockchainError);
      
      // Fallback: return basic metadata if blockchain read fails
      const fallbackMetadata = {
        name: `Festos Ticket #${tokenId}`,
        description: 'Festos Event Ticket NFT',
        image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://festos.app'}/api/nft/image/${tokenId}`,
        external_url: 'https://festos.app',
        attributes: [
          {
            trait_type: 'Status',
            value: 'Processing'
          }
        ]
      };

      return NextResponse.json(fallbackMetadata, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      });
    }

  } catch (error) {
    console.error('NFT metadata API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate NFT metadata' },
      { status: 500 }
    );
  }
}
