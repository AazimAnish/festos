#!/usr/bin/env tsx

/**
 * Festos Hardhat 3 + Viem Setup Verification Script
 * 
 * This script verifies that your Hardhat 3 setup with viem is properly configured
 * and ready for deployment.
 */

import { config } from 'dotenv';
import { createPublicClient, http, getContract } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

async function verifySetup() {
  console.log('🔍 Verifying Hardhat 3 + Viem Setup for Festos...\n');

  // Test 1: Check package.json configuration
  console.log('📦 Test 1: Checking package.json configuration...');
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (packageJson.type === 'module') {
      console.log('  ✅ ES modules enabled');
    } else {
      console.log('  ❌ ES modules not enabled');
      return false;
    }

    const requiredDeps = [
      'hardhat',
      '@nomicfoundation/hardhat-viem',
      '@nomicfoundation/hardhat-toolbox-viem',
      'viem',
      'dotenv'
    ];

    for (const dep of requiredDeps) {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`  ✅ ${dep} installed`);
      } else {
        console.log(`  ❌ ${dep} not found`);
        return false;
      }
    }
  } catch (error) {
    console.log('  ❌ Error reading package.json:', error);
    return false;
  }

  // Test 2: Check hardhat.config.ts
  console.log('\n⚙️  Test 2: Checking hardhat.config.ts...');
  try {
    const configContent = readFileSync('hardhat.config.ts', 'utf8');
    
    if (configContent.includes('@nomicfoundation/hardhat-toolbox-viem')) {
      console.log('  ✅ Viem plugin imported');
    } else {
      console.log('  ❌ Viem plugin not found in config');
      return false;
    }

    if (configContent.includes('plugins: [hardhatToolboxViemPlugin]')) {
      console.log('  ✅ Viem plugin configured');
    } else {
      console.log('  ❌ Viem plugin not properly configured');
      return false;
    }

    if (configContent.includes('fuji')) {
      console.log('  ✅ Fuji network configured');
    } else {
      console.log('  ❌ Fuji network not configured');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Error reading hardhat.config.ts:', error);
    return false;
  }

  // Test 3: Check environment variables
  console.log('\n🔐 Test 3: Checking environment variables...');
  const requiredEnvVars = [
    'PRIVATE_KEY',
    'NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL',
    'NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS',
    'NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS',
    'NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar} set`);
    } else {
      console.log(`  ❌ ${envVar} not set`);
      return false;
    }
  }

  // Test 4: Check network connectivity
  console.log('\n🌐 Test 4: Checking network connectivity...');
  try {
    const client = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });

    const blockNumber = await client.getBlockNumber();
    const chainId = await client.getChainId();
    
    console.log(`  ✅ Connected to network (Chain ID: ${chainId})`);
    console.log(`  ✅ Latest block: ${blockNumber}`);
  } catch (error) {
    console.log('  ❌ Network connectivity failed:', error);
    return false;
  }

  // Test 5: Check contract deployment
  console.log('\n🏭 Test 5: Checking contract deployment...');
  try {
    const client = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });

    const factoryAddress = process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS;
    const ticketAddress = process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS;
    const escrowAddress = process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS;

    // Check if contracts exist at the addresses
    const factoryCode = await client.getBytecode({ address: factoryAddress as `0x${string}` });
    const ticketCode = await client.getBytecode({ address: ticketAddress as `0x${string}` });
    const escrowCode = await client.getBytecode({ address: escrowAddress as `0x${string}` });

    if (factoryCode && factoryCode !== '0x') {
      console.log('  ✅ EventFactory deployed');
    } else {
      console.log('  ❌ EventFactory not deployed');
      return false;
    }

    if (ticketCode && ticketCode !== '0x') {
      console.log('  ✅ EventTicket deployed');
    } else {
      console.log('  ❌ EventTicket not deployed');
      return false;
    }

    if (escrowCode && escrowCode !== '0x') {
      console.log('  ✅ EventEscrow deployed');
    } else {
      console.log('  ❌ EventEscrow not deployed');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Contract verification failed:', error);
    return false;
  }

  // Test 6: Check wallet balance
  console.log('\n💰 Test 6: Checking wallet balance...');
  try {
    const client = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.log('  ❌ Private key not set');
      return false;
    }

    // Extract wallet address from private key (first 20 bytes of keccak256)
    const { privateKeyToAccount } = await import('viem/accounts');
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    
    const balance = await client.getBalance({ address: account.address });
    const balanceInAvax = Number(balance) / Number(10n ** 18n);
    
    console.log(`  ✅ Wallet address: ${account.address}`);
    console.log(`  ✅ Balance: ${balanceInAvax} AVAX`);
    
    if (balanceInAvax < 0.1) {
      console.log('  ⚠️  Low balance - consider adding more AVAX for deployment');
    } else {
      console.log('  ✅ Sufficient balance for deployment');
    }
  } catch (error) {
    console.log('  ❌ Wallet check failed:', error);
    return false;
  }

  // Test 7: Check Hardhat compilation
  console.log('\n🔨 Test 7: Checking Hardhat compilation...');
  try {
    const { execSync } = await import('child_process');
    execSync('npx hardhat compile', { stdio: 'pipe' });
    console.log('  ✅ Contracts compile successfully');
  } catch (error) {
    console.log('  ❌ Contract compilation failed');
    return false;
  }

  console.log('\n🎉 All tests passed! Your setup is ready for deployment.');
  console.log('\n📋 Next steps:');
  console.log('  1. Run: npx hardhat run scripts/deploy-simple.ts --network fuji');
  console.log('  2. Or run: npx hardhat run scripts/deploy-contracts.ts --network fuji');
  console.log('  3. Test with: npx tsx scripts/test-contract-interaction.ts');
  
  return true;
}

// Run the verification
verifySetup().catch(console.error);
