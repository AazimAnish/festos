import { network } from 'hardhat';
import { parseEther } from 'viem';

async function main() {
  console.log('🚀 Creating test event on Avalanche Fuji testnet...');

  try {
    const { viem } = await network.connect();

    // Deploy contract if not already deployed
    console.log('📦 Deploying EventFactory contract...');
    const eventFactory = await viem.deployContract('EventFactory');
    console.log('✅ Contract deployed at:', eventFactory.address);

    // Test event data
    const eventData = {
      title: 'Test Blockchain Event',
      description: 'This is a test event created on the blockchain',
      location: 'Avalanche Fuji Testnet',
      startTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
      endTime: BigInt(Math.floor(Date.now() / 1000) + 7200), // 2 hours from now
      maxCapacity: BigInt(100),
      ticketPrice: parseEther('0.01'), // 0.01 AVAX
      requireApproval: false,
      hasPOAP: false,
      poapMetadata: '',
    };

    console.log('📝 Event data:', {
      ...eventData,
      startTime: new Date(Number(eventData.startTime) * 1000).toISOString(),
      endTime: new Date(Number(eventData.endTime) * 1000).toISOString(),
      ticketPrice: eventData.ticketPrice.toString(),
    });

    // Create event on blockchain
    console.log('⏳ Creating event on blockchain...');
    const tx = await eventFactory.write.createEvent([
      eventData.title,
      eventData.description,
      eventData.location,
      eventData.startTime,
      eventData.endTime,
      eventData.maxCapacity,
      eventData.ticketPrice,
      eventData.requireApproval,
      eventData.hasPOAP,
      eventData.poapMetadata,
    ]);

    console.log('✅ Transaction sent:', tx);
    console.log('⏳ Waiting for confirmation...');
    
    // Wait a bit for the transaction to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the created event
    const totalEvents = await eventFactory.read.getTotalEvents();
    console.log('📊 Total events:', totalEvents.toString());

    // Get the first event
    const event = await eventFactory.read.getEvent([BigInt(1)]);
    console.log('📋 Created event:', {
      eventId: event.eventId.toString(),
      title: event.title,
      creator: event.creator,
      startTime: new Date(Number(event.startTime) * 1000).toISOString(),
    });

    // Test getActiveEvents
    const activeEvents = await eventFactory.read.getActiveEvents([BigInt(0), BigInt(10)]);
    console.log('🎯 Active events count:', activeEvents.length);

    return { event, activeEvents };
  } catch (error) {
    console.error('❌ Failed to create event:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .then((result) => {
    console.log('\n🎉 Test event creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
