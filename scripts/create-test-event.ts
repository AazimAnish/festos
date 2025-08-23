import { createEventOnAvalanche } from '../src/lib/contracts/avalanche-client';
import { parseEther } from 'viem';

async function main() {
  console.log('🚀 Creating test event on Avalanche Fuji testnet...');

  try {
    // Get private key from environment
    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    
    // Remove 0x prefix if present
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.slice(2);
    }

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
    const result = await createEventOnAvalanche(eventData, privateKey, true); // true = testnet

    console.log('✅ Event created successfully!');
    console.log('📋 Event ID:', result.eventId.toString());
    console.log('🔗 Transaction Hash:', result.transactionHash);
    console.log('🌐 View on Snowtrace:', `https://testnet.snowtrace.io/tx/${result.transactionHash}`);

    return result;
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
