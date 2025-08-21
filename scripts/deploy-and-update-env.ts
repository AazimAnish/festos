import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { network } from 'hardhat';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

async function deployContracts() {
  const { viem } = await network.connect();

  // Get network info from the connected network
  const networkName = process.argv.includes('--network')
    ? process.argv[process.argv.indexOf('--network') + 1]
    : 'hardhat';

  console.log(`Deploying contracts to network: ${networkName}`);
  console.log(`PRIVATE_KEY loaded: ${process.env.PRIVATE_KEY ? 'YES' : 'NO'}`);

  // Check private key format
  if (process.env.PRIVATE_KEY) {
    const privateKey = process.env.PRIVATE_KEY;
    console.log(
      `Private key format: ${privateKey.startsWith('0x') ? '0x prefix' : 'no 0x prefix'}`
    );
    console.log(`Private key length: ${privateKey.length}`);
  }

  // Deploy EventFactory contract
  const eventFactory = await viem.deployContract('EventFactory');

  console.log('EventFactory deployed to:', eventFactory.address);

  // Update environment variables
  await updateEnvironmentVariables(networkName, eventFactory.address);

  console.log('Environment variables updated successfully!');

  return eventFactory.address;
}

async function updateEnvironmentVariables(
  networkName: string | undefined,
  contractAddress: string
) {
  const envPath = join(process.cwd(), '.env.local');
  const envExamplePath = join(process.cwd(), '.env.example');

  let envContent = '';

  // Read existing .env.local if it exists
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  } else if (existsSync(envExamplePath)) {
    // Use env.example as template
    envContent = readFileSync(envExamplePath, 'utf8');
  }

  // Update contract address based on network
  const envVarName = getContractEnvVarName(networkName);
  const envVarPattern = new RegExp(`^${envVarName}=.*$`, 'm');

  if (envVarPattern.test(envContent)) {
    // Replace existing variable
    envContent = envContent.replace(
      envVarPattern,
      `${envVarName}=${contractAddress}`
    );
  } else {
    // Add new variable
    envContent += `\n# Contract Addresses (auto-generated)\n${envVarName}=${contractAddress}\n`;
  }

  // Write updated content
  writeFileSync(envPath, envContent);
  console.log(`Updated ${envVarName}=${contractAddress}`);
}

function getContractEnvVarName(networkName: string | undefined): string {
  const name = networkName || 'hardhat';
  switch (name) {
    case 'localhost':
    case 'hardhat':
      return 'NEXT_PUBLIC_LOCALHOST_EVENT_FACTORY_ADDRESS';
    case 'sepolia':
      return 'NEXT_PUBLIC_SEPOLIA_EVENT_FACTORY_ADDRESS';
    case 'mainnet':
      return 'NEXT_PUBLIC_MAINNET_EVENT_FACTORY_ADDRESS';
    case 'avalanche':
      return 'NEXT_PUBLIC_AVALANCHE_EVENT_FACTORY_ADDRESS';
    case 'avalancheFuji':
      return 'NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS';
    default:
      return `NEXT_PUBLIC_${name.toUpperCase()}_EVENT_FACTORY_ADDRESS`;
  }
}

// Main execution
deployContracts()
  .then(address => {
    console.log('✅ Deployment completed successfully!');
    console.log('📄 Contract address:', address);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
