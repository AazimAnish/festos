#!/usr/bin/env tsx

/**
 * Deployment Script using Standalone Ethers
 * 
 * This script deploys the EventEscrow and EventTicket contracts
 * using the standalone ethers package.
 * 
 * Usage: npx hardhat run scripts/deploy-simple-ethers.ts --network fuji
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

interface DeploymentInfo {
  network: string;
  chainId: number;
  deployer: string;
  contracts: {
    EventEscrow: string;
    EventTicket: string;
  };
  testEvents: {
    freeEventId?: string;
    paidEventId?: string;
  };
  timestamp: string;
}

async function main(): Promise<void> {
  console.log('🚀 Starting deployment to Avalanche Fuji testnet...\n');
  
  try {
    // Setup provider and wallet
    const rpcUrl = process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('❌ PRIVATE_KEY not found in environment variables');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const deployerAddress = await wallet.getAddress();
    
    console.log('👤 Deploying contracts with account:', deployerAddress);
    
    // Check deployer balance
    const balance = await provider.getBalance(deployerAddress);
    console.log('💰 Deployer balance:', ethers.formatEther(balance), 'AVAX');
    
    if (balance < ethers.parseEther('0.1')) {
      throw new Error('❌ Insufficient balance. Need at least 0.1 AVAX for deployment.');
    }

    // Load contract artifacts
    const eventEscrowArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/EventEscrow.sol/EventEscrow.json', 'utf8'));
    const eventTicketArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/EventTicket.sol/EventTicket.json', 'utf8'));

    // Step 1: Deploy EventEscrow contract first
    console.log('\n📋 Step 1: Deploying EventEscrow contract...');
    const eventEscrowFactory = new ethers.ContractFactory(
      eventEscrowArtifact.abi,
      eventEscrowArtifact.bytecode,
      wallet
    );
    
    const eventEscrow = await eventEscrowFactory.deploy();
    await eventEscrow.waitForDeployment();
    
    const eventEscrowAddress = await eventEscrow.getAddress();
    console.log('✅ EventEscrow deployed to:', eventEscrowAddress);
    console.log('✅ EventEscrow deployment confirmed');

    // Step 2: Deploy EventTicket contract with escrow address
    console.log('\n📋 Step 2: Deploying EventTicket contract...');
    const eventTicketFactory = new ethers.ContractFactory(
      eventTicketArtifact.abi,
      eventTicketArtifact.bytecode,
      wallet
    );
    
    const eventTicket = await eventTicketFactory.deploy(eventEscrowAddress);
    await eventTicket.waitForDeployment();
    
    const eventTicketAddress = await eventTicket.getAddress();
    console.log('✅ EventTicket deployed to:', eventTicketAddress);
    console.log('✅ EventTicket deployment confirmed');

    // Step 3: Verify the contracts are properly linked
    console.log('\n📋 Step 3: Verifying contract setup...');
    const escrowAddressFromTicket = await eventTicket.escrowContract();
    console.log('🔗 Escrow address in EventTicket:', escrowAddressFromTicket);
    
    if (escrowAddressFromTicket.toLowerCase() !== eventEscrowAddress.toLowerCase()) {
      throw new Error('❌ Contract linking failed!');
    }
    
    console.log('✅ Contracts properly linked');

    // Step 4: Test basic functionality
    console.log('\n📋 Step 4: Testing basic functionality...');
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Test creating a free event
    const freeEventTx = await eventTicket.createEvent(
      'Test Free Event',
      'Test Location', 
      BigInt(currentTime + 3600), // 1 hour from now
      BigInt(currentTime + 7200), // 2 hours from now
      BigInt(100), // max capacity
      ethers.parseEther('0'), // 0 AVAX ticket price (free event)
      false, // does not require escrow
      'https://example.com/metadata/' // base URI
    );
    
    const freeEventReceipt = await freeEventTx.wait();
    console.log('✅ Test free event created successfully');
    
    // Get the free event ID from the logs
    let freeEventId: string | undefined;
    if (freeEventReceipt?.logs) {
      for (const log of freeEventReceipt.logs) {
        try {
          const parsedLog = eventTicket.interface.parseLog(log);
          if (parsedLog?.name === 'EventCreated') {
            freeEventId = parsedLog.args[0].toString();
            console.log('🎫 Free event ID:', freeEventId);
            break;
          }
        } catch {
          // Skip logs that can't be parsed
        }
      }
    }

    // Test creating a paid event
    const paidEventTx = await eventTicket.createEvent(
      'Test Paid Event',
      'Test Location', 
      BigInt(currentTime + 3600), // 1 hour from now
      BigInt(currentTime + 7200), // 2 hours from now
      BigInt(50), // max capacity
      ethers.parseEther('0.01'), // 0.01 AVAX ticket price
      true, // requires escrow
      'https://example.com/metadata/' // base URI
    );
    
    const paidEventReceipt = await paidEventTx.wait();
    console.log('✅ Test paid event created successfully');
    
    // Get the paid event ID from the logs
    let paidEventId: string | undefined;
    if (paidEventReceipt?.logs) {
      for (const log of paidEventReceipt.logs) {
        try {
          const parsedLog = eventTicket.interface.parseLog(log);
          if (parsedLog?.name === 'EventCreated') {
            paidEventId = parsedLog.args[0].toString();
            console.log('🎫 Paid event ID:', paidEventId);
            break;
          }
        } catch {
          // Skip logs that can't be parsed
        }
      }
    }

    // Step 5: Create escrow for the paid event
    if (paidEventId) {
      console.log('\n📋 Step 5: Creating escrow for paid event...');
      const escrowTx = await eventEscrow.createEventEscrow(
        BigInt(paidEventId),
        ethers.parseEther('0.01'), // 0.01 AVAX
        BigInt(currentTime + 7200) // 2 hours from now
      );
      
      await escrowTx.wait();
      console.log('✅ Test escrow created successfully');
    }

    // Step 6: Test ticket purchase for free event
    if (freeEventId) {
      console.log('\n📋 Step 6: Testing free ticket purchase...');
      try {
        const freeTicketTx = await eventTicket.purchaseTicket(
          BigInt(freeEventId),
          'Test Attendee',
          'test@example.com',
          { value: 0 }
        );
        
        await freeTicketTx.wait();
        console.log('✅ Free ticket purchase test successful');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('⚠️  Free ticket purchase test failed:', errorMessage);
      }
    }

    // Step 7: Update environment variables
    console.log('\n📋 Step 7: Updating environment variables...');
    await updateEnvironmentVariables(eventEscrowAddress, eventTicketAddress);
    console.log('✅ Environment variables updated');

    // Step 8: Save deployment info
    console.log('\n📋 Step 8: Saving deployment information...');
    const deploymentInfo: DeploymentInfo = {
      network: 'Avalanche Fuji Testnet',
      chainId: 43113,
      deployer: deployerAddress,
      contracts: {
        EventEscrow: eventEscrowAddress,
        EventTicket: eventTicketAddress,
      },
      testEvents: {
        freeEventId,
        paidEventId,
      },
      timestamp: new Date().toISOString(),
    };
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(process.cwd(), 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentsDir, 'latest-deployment-ethers.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log('✅ Deployment info saved to deployments/latest-deployment-ethers.json');

    // Display deployment summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 DEPLOYMENT SUMMARY');
    console.log('='.repeat(70));
    console.log(`🏭 EventEscrow Address: ${eventEscrowAddress}`);
    console.log(`🏭 EventTicket Address: ${eventTicketAddress}`);
    console.log(`🌐 Network: Avalanche Fuji Testnet (Chain ID: 43113)`);
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`🎫 Free Event ID: ${freeEventId}`);
    console.log(`🎫 Paid Event ID: ${paidEventId}`);
    
    console.log('\n🔍 Contract verification commands (optional):');
    console.log('='.repeat(70));
    console.log(`npx hardhat verify --network fuji ${eventEscrowAddress}`);
    console.log(`npx hardhat verify --network fuji ${eventTicketAddress} ${eventEscrowAddress}`);
    
    console.log('\n✅ Complete deployment and environment update finished!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

async function updateEnvironmentVariables(escrowAddress: string, ticketAddress: string): Promise<void> {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Read existing environment file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Split into lines
  const lines = envContent.split('\n');
  const newLines: string[] = [];
  const updatedVars = new Set<string>();
  
  // Process existing lines
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      newLines.push(line);
      continue;
    }
    
    // Check if this is a variable we want to update
    if (trimmedLine.startsWith('NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS=')) {
      newLines.push(`NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS=${escrowAddress}`);
      updatedVars.add('NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS');
    } else if (trimmedLine.startsWith('NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS=')) {
      newLines.push(`NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS=${ticketAddress}`);
      updatedVars.add('NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS');
    } else if (trimmedLine.startsWith('NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=')) {
      newLines.push(`NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc`);
      updatedVars.add('NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL');
    } else {
      // Keep other variables unchanged
      newLines.push(line);
    }
  }
  
  // Add missing variables
  if (!updatedVars.has('NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS')) {
    newLines.push(`NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS=${escrowAddress}`);
  }
  
  if (!updatedVars.has('NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS')) {
    newLines.push(`NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS=${ticketAddress}`);
  }
  
  if (!updatedVars.has('NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL')) {
    newLines.push(`NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc`);
  }
  
  // Write back to file
  fs.writeFileSync(envPath, newLines.join('\n'));
  
  console.log('📝 Updated .env.local with new contract addresses');
  console.log(`   EventEscrow: ${escrowAddress}`);
  console.log(`   EventTicket: ${ticketAddress}`);
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment script failed:', error);
    process.exit(1);
  });
