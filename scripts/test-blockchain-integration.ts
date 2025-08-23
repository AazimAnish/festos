import { getActiveEventsFromAvalanche } from '../src/lib/contracts/avalanche-client';

async function main() {
  console.log('🧪 Testing blockchain integration...');

  try {
    // Test getting active events from Avalanche Fuji testnet
    console.log('📡 Fetching active events from Avalanche Fuji testnet...');
    
    const events = await getActiveEventsFromAvalanche(
      BigInt(0), // offset
      BigInt(10), // limit
      true // useTestnet
    );

    console.log('✅ Successfully fetched events from blockchain');
    console.log('📊 Number of events:', events.length);
    
    if (events.length > 0) {
      console.log('📋 First event:', {
        eventId: events[0].eventId.toString(),
        title: events[0].title,
        creator: events[0].creator,
        startTime: new Date(Number(events[0].startTime) * 1000).toISOString(),
      });
    } else {
      console.log('ℹ️ No events found on blockchain');
    }

    return events;
  } catch (error) {
    console.error('❌ Blockchain integration test failed:', error);
    throw error;
  }
}

// Run the test
main()
  .then((events) => {
    console.log('\n🎉 Blockchain integration test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
