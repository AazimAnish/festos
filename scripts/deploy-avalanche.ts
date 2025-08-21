import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { network, artifacts } from 'hardhat';
import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

async function deployToAvalanche() {
  try {
    console.log('Deploying to Avalanche Fuji testnet...');
    
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    
    console.log(`PRIVATE_KEY loaded: ${process.env.PRIVATE_KEY ? 'YES' : 'NO'}`);
    
    // Create account from private key
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    console.log(`Deploying from address: ${account.address}`);
    
    // Create public client
    const publicClient = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });
    
    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });
    
    // Get contract bytecode and ABI from artifacts
    const EventFactoryArtifact = await artifacts.readArtifact('EventFactory');
    const bytecode = EventFactoryArtifact.bytecode as `0x${string}`;
    const abi = EventFactoryArtifact.abi;
    
    console.log('Deploying EventFactory contract...');
    
    // Deploy contract
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [],
    });
    
    console.log(`Deployment transaction hash: ${hash}`);
    
    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Contract deployed at: ${receipt.contractAddress}`);
    
    // Update environment variables
    await updateEnvironmentVariables('avalancheFuji', receipt.contractAddress!);
    
    console.log('✅ Deployment completed successfully!');
    console.log('📄 Contract address:', receipt.contractAddress);
    
    return receipt.contractAddress;
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

async function updateEnvironmentVariables(networkName: string, contractAddress: string) {
  const envPath = join(process.cwd(), '.env.local');
  const envExamplePath = join(process.cwd(), '.env.example');
  
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  } else if (existsSync(envExamplePath)) {
    // Use .env.example as template
    envContent = readFileSync(envExamplePath, 'utf8');
  }

  // Update contract address based on network
  const envVarName = getContractEnvVarName(networkName);
  const envVarPattern = new RegExp(`^${envVarName}=.*$`, 'm');
  
  if (envVarPattern.test(envContent)) {
    // Replace existing variable
    envContent = envContent.replace(envVarPattern, `${envVarName}=${contractAddress}`);
  } else {
    // Add new variable
    envContent += `\n# Contract Addresses (auto-generated)\n${envVarName}=${contractAddress}\n`;
  }

  // Write updated content
  writeFileSync(envPath, envContent);
  console.log(`Updated ${envVarName}=${contractAddress}`);
}

function getContractEnvVarName(networkName: string): string {
  switch (networkName) {
    case 'avalancheFuji':
      return 'NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS';
    case 'avalanche':
      return 'NEXT_PUBLIC_AVALANCHE_EVENT_FACTORY_ADDRESS';
    default:
      return `NEXT_PUBLIC_${networkName.toUpperCase()}_EVENT_FACTORY_ADDRESS`;
  }
}

// Main execution
deployToAvalanche()
  .then((address) => {
    console.log('✅ Deployment completed successfully!');
    console.log('📄 Contract address:', address);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
