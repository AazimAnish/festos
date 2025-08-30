/**
 * User Tickets API
 * 
 * Get all tickets owned by a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';
import { getAuthenticatedUser } from '@/shared/utils/wallet-auth';
import { getAvalancheFujiEventTicketContract } from '@/lib/contracts/avalanche-ticket-client';

const eventService = new EventService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { address } = await params;
    const user = await getAuthenticatedUser(request);
    
    // Users can only view their own tickets unless they're authenticated as the requested user
    if (!user || user.wallet_address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        details: 'You can only view your own tickets'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    const status = searchParams.get('status') || undefined; // 'active', 'used', 'expired'

    // Get tickets from database first (fast cache)
    const databaseTickets = await eventService.getUserTickets(address, {
      includeMetadata,
      status
    });

    // Optionally sync with blockchain for accuracy
    let blockchainTickets = [];
    try {
      const ticketContract = getAvalancheFujiEventTicketContract();
      blockchainTickets = await getUserTicketsFromBlockchain(address, ticketContract);
    } catch (error) {
      console.warn('Failed to fetch tickets from blockchain:', error);
    }

    // Merge and deduplicate tickets (blockchain is source of truth)
    const mergedTickets = mergeTicketData(databaseTickets, blockchainTickets);

    // Filter by status if requested
    const filteredTickets = status 
      ? filterTicketsByStatus(mergedTickets, status)
      : mergedTickets;

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        tickets: filteredTickets,
        count: filteredTickets.length,
        summary: {
          total: mergedTickets.length,
          active: mergedTickets.filter(t => !t.isUsed && !t.isExpired).length,
          used: mergedTickets.filter(t => t.isUsed).length,
          expired: mergedTickets.filter(t => t.isExpired).length
        }
      },
      metadata: {
        responseTime,
        timestamp: new Date().toISOString(),
        source: 'hybrid',
        includeMetadata,
        status: status || 'all'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('User tickets API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error))
        : undefined,
      metadata: {
        responseTime,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

async function getUserTicketsFromBlockchain(_userAddress: string, _contract: any): Promise<any[]> {
  try {
    // This would call the smart contract to get user's tickets
    // For now, return empty array as we need to implement the contract calls
    return [];
  } catch (error) {
    console.error('Failed to get tickets from blockchain:', error);
    return [];
  }
}

function mergeTicketData(databaseTickets: any[], blockchainTickets: any[]): any[] {
  // Blockchain is the source of truth, so start with blockchain tickets
  // and supplement with database metadata
  const merged = [...blockchainTickets];
  
  // Add database tickets that might not be on blockchain yet
  databaseTickets.forEach(dbTicket => {
    const exists = merged.some(ticket => 
      ticket.tokenId === dbTicket.tokenId || 
      ticket.transactionHash === dbTicket.transactionHash
    );
    
    if (!exists) {
      merged.push({
        ...dbTicket,
        source: 'database',
        blockchainConfirmed: false
      });
    }
  });
  
  return merged.map(ticket => ({
    ...ticket,
    isExpired: new Date() > new Date(ticket.eventEndDate || ticket.endDate),
    canTransfer: !ticket.isUsed && !ticket.isExpired
  }));
}

function filterTicketsByStatus(tickets: any[], status: string): any[] {
  switch (status) {
    case 'active':
      return tickets.filter(t => !t.isUsed && !t.isExpired);
    case 'used':
      return tickets.filter(t => t.isUsed);
    case 'expired':
      return tickets.filter(t => t.isExpired && !t.isUsed);
    default:
      return tickets;
  }
}