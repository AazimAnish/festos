import { network } from 'hardhat';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🚀 Deploying EventFactory contract...');

  try {
    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }

    console.log('🔑 Using private key:', privateKey.substring(0, 10) + '...');
    console.log('🌐 Network:', process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL);

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log('👤 Deployer address:', account.address);
    
    const walletClient = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });

    // Get the contract artifact
    const { viem } = await network.connect();
    
    // Deploy the contract using the wallet client
    console.log('📦 Deploying contract...');
    const eventFactory = await viem.deployContract('EventFactory', {
      walletClient,
    });

    const address = eventFactory.address;
    console.log('✅ EventFactory deployed successfully!');
    console.log('📍 Contract address:', address);

    // Get deployment info
    console.log('🔗 Contract deployed to:', address);

    // Verify contract on block explorer (optional)
    console.log('\n🔍 To verify on block explorer, run:');
    console.log(
      `npx hardhat verify --network avalancheFuji ${address}`
    );

    // Save deployment info
    const deploymentInfo = {
      contract: 'EventFactory',
      address: address,
      network: 'avalancheFuji',
      deployedAt: new Date().toISOString(),
      deployer: account.address,
    };

    console.log('\n📋 Deployment Summary:');
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Save to file for reference
    const fs = await import('fs');
    const deploymentsDir = './deployments';
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = `${deploymentsDir}/event-factory-avalancheFuji.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);

    return address;
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
main()
  .then(address => {
    console.log('\n🎉 Deployment completed successfully!');
    console.log('Contract address:', address);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  });
