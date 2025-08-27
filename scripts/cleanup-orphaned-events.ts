#!/usr/bin/env tsx

/**
 * Cleanup Orphaned Events Script
 * 
 * This script removes events that exist in the database without blockchain proof.
 * It ensures data consistency by making blockchain the source of truth.
 */

import { EventOrchestrator } from '../src/lib/services/integration/event-orchestrator';
import { DatabaseService } from '../src/lib/services/storage/database-service';
import { IPFSService } from '../src/lib/services/storage/ipfs-service';

async function cleanupOrphanedEvents() {
  console.log('🚀 Starting orphaned events cleanup...\n');

  try {
    const orchestrator = new EventOrchestrator();
    const databaseService = new DatabaseService();
    const ipfsService = new IPFSService();

    // Step 1: Find orphaned events
    console.log('📋 Finding orphaned events...');
    const orphanedEvents = await databaseService.getEventsWithoutBlockchainProof();
    
    if (orphanedEvents.length === 0) {
      console.log('✅ No orphaned events found. Database is consistent!');
      return;
    }

    console.log(`🔍 Found ${orphanedEvents.length} orphaned events:`);
    orphanedEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} (ID: ${event.id})`);
    });

    // Step 2: Confirm cleanup
    console.log('\n⚠️  WARNING: This will permanently delete the above events from the database.');
    console.log('   Events without blockchain proof are considered invalid and will be removed.');
    
    // In a real implementation, you might want to add a confirmation prompt
    // For now, we'll proceed with the cleanup
    
    // Step 3: Cleanup orphaned events
    console.log('\n🗑️  Starting cleanup...');
    let deletedCount = 0;
    let ipfsDeletedCount = 0;

    for (const event of orphanedEvents) {
      try {
        console.log(`  Deleting: ${event.title} (${event.id})`);
        
        // Delete from database
        await databaseService.deleteEvent(event.id);
        deletedCount++;

        // Delete from IPFS if metadata URL exists
        if (event.filebase_metadata_url) {
          try {
            await ipfsService.deleteFile(event.filebase_metadata_url);
            console.log(`    ✅ Deleted metadata from IPFS: ${event.filebase_metadata_url}`);
            ipfsDeletedCount++;
          } catch (error) {
            console.log(`    ⚠️  Failed to delete metadata from IPFS: ${error}`);
          }
        }

        // Delete from IPFS if image URL exists
        if (event.filebase_image_url) {
          try {
            await ipfsService.deleteFile(event.filebase_image_url);
            console.log(`    ✅ Deleted image from IPFS: ${event.filebase_image_url}`);
            ipfsDeletedCount++;
          } catch (error) {
            console.log(`    ⚠️  Failed to delete image from IPFS: ${error}`);
          }
        }

      } catch (error) {
        console.log(`    ❌ Failed to delete event ${event.id}: ${error}`);
      }
    }

    // Step 4: Summary
    console.log('\n📊 Cleanup Summary:');
    console.log(`  • Total orphaned events found: ${orphanedEvents.length}`);
    console.log(`  • Events deleted from database: ${deletedCount}`);
    console.log(`  • Files deleted from IPFS: ${ipfsDeletedCount}`);
    
    if (deletedCount === orphanedEvents.length) {
      console.log('\n✅ Cleanup completed successfully!');
    } else {
      console.log('\n⚠️  Cleanup completed with some errors. Check the logs above.');
    }

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupOrphanedEvents()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { cleanupOrphanedEvents };
