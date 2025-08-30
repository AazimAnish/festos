#!/usr/bin/env tsx

/**
 * Recovery from Blockchain and IPFS Script
 * 
 * This script demonstrates how to recover event data if Supabase is wiped or manipulated.
 * It rebuilds the database from blockchain and IPFS data, ensuring data integrity.
 *  
 * Usage: npx tsx scripts/recover-from-blockchain.ts
 */

import { createClient } from '@supabase/supabase-js';
import { formatEther } from 'viem';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Types for better type safety
interface BlockchainEvent {
  eventId: bigint;
  title: string;
  description: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  maxCapacity: bigint;
  ticketPrice: bigint;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata: string;
  creator: string;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

interface FilebaseClient {
  getMetadata(key: string): Promise<any>;
  getFile(key: string): Promise<any>;
  getPublicUrl(key: string): string;
}

interface RecoveredEvent {
  blockchainEventId: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  ticketPrice: string;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata: string;
  creator: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadataUrl?: string;
  imageUrl?: string;
}

// Mock implementations for the external dependencies
// In a real implementation, these would be imported from your actual modules

async function getActiveEventsFromAvalanche(
  startId: bigint,
  limit: bigint,
  isTestnet: boolean
): Promise<BlockchainEvent[]> {
  // Mock implementation - replace with actual blockchain interaction
  console.log(`📡 Fetching events from blockchain (start: ${startId}, limit: ${limit}, testnet: ${isTestnet})`);
  
  // This would be replaced with actual contract calls
  const mockEvents: BlockchainEvent[] = [
    {
      eventId: 1n,
      title: 'Mock Event 1',
      description: 'A test event recovered from blockchain',
      location: 'Virtual Location',
      startTime: BigInt(Math.floor(Date.now() / 1000) + 3600),
      endTime: BigInt(Math.floor(Date.now() / 1000) + 7200),
      maxCapacity: 100n,
      ticketPrice: 0n,
      requireApproval: false,
      hasPOAP: true,
      poapMetadata: 'ipfs://mock-poap-metadata',
      creator: '0x1234567890123456789012345678901234567890',
      isActive: true,
      createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
      updatedAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
    },
    {
      eventId: 2n,
      title: 'Mock Event 2',
      description: 'Another test event recovered from blockchain',
      location: 'Physical Location',
      startTime: BigInt(Math.floor(Date.now() / 1000) + 7200),
      endTime: BigInt(Math.floor(Date.now() / 1000) + 10800),
      maxCapacity: 50n,
      ticketPrice: BigInt('10000000000000000'), // 0.01 ETH in wei
      requireApproval: true,
      hasPOAP: false,
      poapMetadata: '',
      creator: '0x9876543210987654321098765432109876543210',
      isActive: true,
      createdAt: BigInt(Math.floor(Date.now() / 1000) - 43200),
      updatedAt: BigInt(Math.floor(Date.now() / 1000) - 43200),
    }
  ];
  
  return mockEvents;
}

function getFilebaseClient(): FilebaseClient {
  // Mock implementation - replace with actual Filebase client
  return {
    async getMetadata(key: string): Promise<any> {
      console.log(`📄 Attempting to fetch metadata: ${key}`);
      // Simulate IPFS lookup
      if (key.includes('blockchain-1')) {
        return {
          name: 'Mock Event 1',
          description: 'Metadata from IPFS',
          image: 'ipfs://mock-image-hash'
        };
      }
      throw new Error('Metadata not found');
    },

    async getFile(key: string): Promise<any> {
      console.log(`📎 Attempting to fetch file: ${key}`);
      // Simulate file lookup
      if (key.includes('blockchain-1') && key.includes('banner.jpg')) {
        return new Uint8Array([1, 2, 3, 4]); // Mock file data
      }
      throw new Error('File not found');
    },

    getPublicUrl(key: string): string {
      return `https://ipfs.filebase.io/ipfs/${key.replace(/[^a-zA-Z0-9]/g, '')}`;
    }
  };
}

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const filebaseClient = getFilebaseClient();

async function recoverFromBlockchain(): Promise<void> {
  console.log('🚀 Starting recovery from blockchain and IPFS...\n');

  try {
    // Step 1: Get all events from blockchain
    console.log('📋 Fetching events from blockchain...');
    const blockchainEvents = await getActiveEventsFromAvalanche(
      0n, // Start from the beginning
      1000n, // Get up to 1000 events
      true // Use testnet
    );

    console.log(`✅ Found ${blockchainEvents.length} events on blockchain\n`);

    // Step 2: Process each blockchain event
    const recoveredEvents: RecoveredEvent[] = [];
    
    for (const blockchainEvent of blockchainEvents) {
      if (blockchainEvent.eventId === 0n) continue; // Skip invalid events
      
      console.log(`🔍 Processing event ${blockchainEvent.eventId}: ${blockchainEvent.title}`);
      
      try {
        // Step 3: Try to recover metadata from IPFS
        let metadataUrl: string | undefined;
        let imageUrl: string | undefined;
        
        try {
          // Try to find metadata in IPFS using the event ID
          const metadataKey = `events/blockchain-${blockchainEvent.eventId}/metadata.json`;
          const metadata = await filebaseClient.getMetadata(metadataKey);
          
          if (metadata) {
            metadataUrl = filebaseClient.getPublicUrl(metadataKey);
            console.log(`  ✅ Found metadata in IPFS: ${metadataUrl}`);
            
            // Try to find associated image
            const imageKey = `events/blockchain-${blockchainEvent.eventId}/images/banner.jpg`;
            try {
              await filebaseClient.getFile(imageKey);
              imageUrl = filebaseClient.getPublicUrl(imageKey);
              console.log(`  ✅ Found image in IPFS: ${imageUrl}`);
            } catch {
              console.log(`  ⚠️  No image found in IPFS`);
            }
          }
        } catch (error) {
          console.log(`  ⚠️  No metadata found in IPFS for event ${blockchainEvent.eventId}`);
        }

        // Step 4: Create recovered event object
        const recoveredEvent: RecoveredEvent = {
          blockchainEventId: Number(blockchainEvent.eventId),
          title: blockchainEvent.title,
          description: blockchainEvent.description,
          location: blockchainEvent.location,
          startDate: new Date(Number(blockchainEvent.startTime) * 1000).toISOString(),
          endDate: new Date(Number(blockchainEvent.endTime) * 1000).toISOString(),
          maxCapacity: Number(blockchainEvent.maxCapacity),
          ticketPrice: formatEther(blockchainEvent.ticketPrice),
          requireApproval: blockchainEvent.requireApproval,
          hasPOAP: blockchainEvent.hasPOAP,
          poapMetadata: blockchainEvent.poapMetadata,
          creator: blockchainEvent.creator.toLowerCase(),
          isActive: blockchainEvent.isActive,
          createdAt: new Date(Number(blockchainEvent.createdAt) * 1000).toISOString(),
          updatedAt: new Date(Number(blockchainEvent.updatedAt) * 1000).toISOString(),
          metadataUrl,
          imageUrl,
        };

        recoveredEvents.push(recoveredEvent);
        console.log(`  ✅ Recovered event: ${blockchainEvent.title}\n`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`  ❌ Failed to recover event ${blockchainEvent.eventId}: ${errorMessage}\n`);
      }
    }

    // Step 5: Rebuild database
    console.log('🗄️  Rebuilding database from recovered data...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const recoveredEvent of recoveredEvents) {
      try {
        // Step 6: Create or get user
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', recoveredEvent.creator)
          .single();

        let userId: string;
        
        if (existingUser) {
          userId = existingUser.id;
          console.log(`  👤 Found existing user: ${recoveredEvent.creator}`);
        } else {
          // Create new user
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              wallet_address: recoveredEvent.creator,
              display_name: `User ${recoveredEvent.creator.slice(0, 8)}`,
              created_at: recoveredEvent.createdAt,
              updated_at: recoveredEvent.updatedAt,
            })
            .select('id')
            .single();

          if (userError) {
            throw new Error(`Failed to create user: ${userError.message}`);
          }

          if (!newUser) {
            throw new Error('Failed to create user: No data returned');
          }

          userId = newUser.id;
          console.log(`  👤 Created new user: ${recoveredEvent.creator}`);
        }

        // Step 7: Check if event already exists in database
        const { data: existingEvent } = await supabase
          .from('events')
          .select('id')
          .eq('contract_event_id', recoveredEvent.blockchainEventId)
          .single();

        if (existingEvent) {
          console.log(`  ⚠️  Event ${recoveredEvent.blockchainEventId} already exists in database`);
          continue;
        }

        // Step 8: Insert event into database
        const { error: insertError } = await supabase
          .from('events')
          .insert({
            id: `recovered-${recoveredEvent.blockchainEventId}`,
            slug: `recovered-${recoveredEvent.title.toLowerCase().replace(/\s+/g, '-')}-${recoveredEvent.blockchainEventId}`,
            title: recoveredEvent.title,
            description: recoveredEvent.description,
            location: recoveredEvent.location,
            start_date: recoveredEvent.startDate,
            end_date: recoveredEvent.endDate,
            max_capacity: recoveredEvent.maxCapacity,
            ticket_price: recoveredEvent.ticketPrice,
            require_approval: recoveredEvent.requireApproval,
            has_poap: recoveredEvent.hasPOAP,
            poap_metadata: recoveredEvent.poapMetadata,
            visibility: 'public',
            timezone: 'UTC',
            banner_image: recoveredEvent.imageUrl,
            category: 'Recovered',
            tags: ['recovered', 'blockchain'],
            creator_id: userId,
            status: recoveredEvent.isActive ? 'active' : 'cancelled',
            contract_event_id: recoveredEvent.blockchainEventId,
            contract_address: recoveredEvent.creator,
            contract_chain_id: 43113, // Fuji testnet
            web3storage_metadata_cid: recoveredEvent.metadataUrl,
            web3storage_image_cid: recoveredEvent.imageUrl,
            created_at: recoveredEvent.createdAt,
            updated_at: recoveredEvent.updatedAt,
          });

        if (insertError) {
          throw new Error(`Failed to insert event: ${insertError.message}`);
        }

        console.log(`  ✅ Rebuilt event in database: ${recoveredEvent.title}`);
        successCount++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`  ❌ Failed to rebuild event ${recoveredEvent.blockchainEventId}: ${errorMessage}`);
        errorCount++;
      }
    }

    // Step 9: Summary
    console.log('\n📊 Recovery Summary:');
    console.log(`  • Total events found on blockchain: ${blockchainEvents.length}`);
    console.log(`  • Events successfully recovered: ${successCount}`);
    console.log(`  • Events with errors: ${errorCount}`);
    console.log(`  • Events with IPFS metadata: ${recoveredEvents.filter(e => e.metadataUrl).length}`);
    console.log(`  • Events with IPFS images: ${recoveredEvents.filter(e => e.imageUrl).length}`);

    if (successCount > 0) {
      console.log('\n✅ Recovery completed successfully!');
      console.log('\n🔍 Verification:');
      console.log('1. Check the events table in Supabase');
      console.log('2. Verify events appear in the discover page');
      console.log('3. Test event details pages');
      console.log('4. Verify blockchain integration is working');
    } else {
      console.log('\n❌ Recovery failed - no events were rebuilt');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Recovery failed:', errorMessage);
    process.exit(1);
  }
}

// Run the recovery
if (require.main === module) {
  recoverFromBlockchain().catch(console.error);
}