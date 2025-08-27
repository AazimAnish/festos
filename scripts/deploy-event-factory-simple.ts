import { createWalletClient, http, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

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

    const publicClient = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });

    // Read the contract bytecode and ABI from artifacts
    const artifactsPath = join(__dirname, '../artifacts/contracts/EventFactory.sol/EventFactory.json');
    const artifacts = JSON.parse(readFileSync(artifactsPath, 'utf8'));
    
    console.log('📦 Contract artifacts loaded');
    console.log('📄 Bytecode length:', artifacts.bytecode.length);
    
    console.log('📋 Contract ABI preview:');
    console.log(JSON.stringify(artifacts.abi.slice(0, 3), null, 2));
    
    // For now, just show the artifacts and suggest manual deployment
    console.log('\n📝 To deploy manually:');
    console.log('1. Use a wallet like MetaMask to deploy the contract');
    console.log('2. Copy the bytecode from the artifacts file');
    console.log('3. Deploy to Avalanche Fuji testnet');
    console.log('4. Update your .env.local file with the new address');
    
    // Save deployment info template
    const deploymentInfo = {
      contract: 'EventFactory',
      address: 'TO_BE_DEPLOYED',
      network: 'avalancheFuji',
      deployedAt: new Date().toISOString(),
      deployer: account.address,
      note: 'Manual deployment required - use wallet to deploy bytecode',
      bytecodeLength: artifacts.bytecode.length,
      abiFunctions: artifacts.abi.filter((item: any) => item.type === 'function').map((item: any) => item.name),
    };

    console.log('\n📋 Deployment Template:');
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Save to file for reference
    const deploymentsDir = './deployments';
    const fs = await import('fs');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = `${deploymentsDir}/event-factory-template.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Template saved to: ${deploymentFile}`);

    return 'MANUAL_DEPLOYMENT_REQUIRED';
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run script
main()
  .then(result => {
    console.log('\n📋 Script completed!');
    console.log('Result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
