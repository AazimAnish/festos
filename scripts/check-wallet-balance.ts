#!/usr/bin/env tsx

/**
 * Wallet Balance Check Script
 * 
 * This script checks the wallet balance and network status to identify
 * potential issues with transactions.
 * 
 * Usage: npx tsx scripts/check-wallet-balance.ts
 */

import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const WALLET_ADDRESS = '0xF3cf367f215Ec50f424A95dB5a700E87272B18B6';

// Create public client
const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'),
});

async function checkWalletBalance() {
  console.log('🔍 Checking Wallet Balance and Network Status...\n');

  try {
    // Check 1: Wallet Balance
    console.log('💰 Checking wallet balance...');
    const balance = await publicClient.getBalance({ address: WALLET_ADDRESS });
    const balanceInAvax = Number(balance) / 10**18;
    
    console.log(`  📍 Wallet Address: ${WALLET_ADDRESS}`);
    console.log(`  💰 Balance: ${balance.toString()} wei`);
    console.log(`  💰 Balance: ${balanceInAvax.toFixed(6)} AVAX`);
    
    if (balanceInAvax < 0.01) {
      console.log('  ⚠️  WARNING: Balance is very low (< 0.01 AVAX)');
      console.log('  💡 You may need more AVAX for transactions');
    } else if (balanceInAvax < 0.1) {
      console.log('  ⚠️  WARNING: Balance is low (< 0.1 AVAX)');
      console.log('  💡 Consider adding more AVAX for multiple transactions');
    } else {
      console.log('  ✅ Balance looks sufficient for transactions');
    }

    // Check 2: Network Status
    console.log('\n🌐 Checking network status...');
    const chainId = await publicClient.getChainId();
    console.log(`  🔗 Chain ID: ${chainId}`);
    console.log(`  📍 Expected: 43113 (Avalanche Fuji Testnet)`);
    
    if (chainId === 43113) {
      console.log('  ✅ Connected to correct network (Avalanche Fuji Testnet)');
    } else {
      console.log('  ❌ Connected to wrong network');
      console.log('  💡 Please switch to Avalanche Fuji Testnet');
    }

    // Check 3: Latest Block
    console.log('\n📦 Checking latest block...');
    const latestBlock = await publicClient.getBlock();
    console.log(`  🔢 Block Number: ${latestBlock.number}`);
    console.log(`  ⏰ Block Timestamp: ${new Date(Number(latestBlock.timestamp) * 1000).toISOString()}`);
    console.log(`  🔗 Block Hash: ${latestBlock.hash}`);

    // Check 4: Network Gas Price (for reference)
    console.log('\n⛽ Checking network gas price...');
    const gasPrice = await publicClient.getGasPrice();
    const gasPriceInGwei = Number(gasPrice) / 10**9;
    console.log(`  💰 Gas Price: ${gasPrice.toString()} wei`);
    console.log(`  💰 Gas Price: ${gasPriceInGwei.toFixed(2)} Gwei`);

    // Check 5: Estimate transaction cost
    console.log('\n🧮 Estimating transaction costs...');
    
    // Example ticket prices
    const ticketPrices = [
      { name: 'Free Event', price: 0 },
      { name: 'Low Cost Event', price: 0.001 },
      { name: 'Medium Cost Event', price: 0.01 },
      { name: 'High Cost Event', price: 0.1 },
    ];

    for (const ticket of ticketPrices) {
      const ticketPriceWei = BigInt(Math.floor(ticket.price * 10**18));
      const estimatedGas = BigInt(200000); // Conservative estimate
      const estimatedGasCost = estimatedGas * gasPrice;
      const totalCost = ticketPriceWei + estimatedGasCost;
      const totalCostInAvax = Number(totalCost) / 10**18;
      
      console.log(`  📋 ${ticket.name}:`);
      console.log(`    💰 Ticket Price: ${ticket.price} AVAX`);
      console.log(`    ⛽ Estimated Gas Cost: ${(Number(estimatedGasCost) / 10**18).toFixed(6)} AVAX`);
      console.log(`    💸 Total Estimated Cost: ${totalCostInAvax.toFixed(6)} AVAX`);
      
      if (balanceInAvax >= totalCostInAvax) {
        console.log(`    ✅ Sufficient balance for this transaction`);
      } else {
        console.log(`    ❌ Insufficient balance for this transaction`);
        console.log(`    💡 Need ${(totalCostInAvax - balanceInAvax).toFixed(6)} more AVAX`);
      }
    }

    // Check 6: Transaction History (last few transactions)
    console.log('\n📜 Checking recent transactions...');
    try {
      const blockNumber = latestBlock.number;
      const recentBlocks = 10;
      
      let transactionCount = 0;
      for (let i = 0; i < recentBlocks && transactionCount < 5; i++) {
        const block = await publicClient.getBlock({ blockNumber: blockNumber - BigInt(i) });
        if (block.transactions) {
          for (const tx of block.transactions) {
            if (typeof tx === 'string') continue;
            const transaction = tx as any;
            if (transaction.from?.toLowerCase() === WALLET_ADDRESS.toLowerCase() || 
                transaction.to?.toLowerCase() === WALLET_ADDRESS.toLowerCase()) {
              console.log(`  🔗 Transaction: ${transaction.hash}`);
              console.log(`    📅 Block: ${block.number}`);
              console.log(`    💰 Value: ${transaction.value ? (Number(transaction.value) / 10**18).toFixed(6) : '0'} AVAX`);
              transactionCount++;
              if (transactionCount >= 5) break;
            }
          }
        }
      }
      
      if (transactionCount === 0) {
        console.log('  📝 No recent transactions found for this wallet');
      }
    } catch (error) {
      console.log('  ⚠️  Could not fetch transaction history:', error);
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  💰 Current Balance: ${balanceInAvax.toFixed(6)} AVAX`);
    console.log(`  🌐 Network: ${chainId === 43113 ? 'Avalanche Fuji Testnet' : 'Wrong Network'}`);
    console.log(`  ⛽ Gas Price: ${gasPriceInGwei.toFixed(2)} Gwei`);
    
    if (balanceInAvax < 0.01) {
      console.log('\n❌ ISSUE: Insufficient balance for transactions');
      console.log('💡 SOLUTION: Add more AVAX to your wallet');
      console.log('   - Visit: https://faucet.avax.network/');
      console.log('   - Request test AVAX for Fuji testnet');
    } else if (chainId !== 43113) {
      console.log('\n❌ ISSUE: Wrong network');
      console.log('💡 SOLUTION: Switch to Avalanche Fuji Testnet');
    } else {
      console.log('\n✅ Wallet appears ready for transactions');
    }

  } catch (error) {
    console.error('\n❌ Error checking wallet:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('network')) {
        console.log('💡 Network connection issue - check your RPC URL');
      } else if (error.message.includes('timeout')) {
        console.log('💡 Network timeout - try again later');
      } else {
        console.log('💡 Unknown error - check network connectivity');
      }
    }
  }
}

// Run the check
checkWalletBalance().catch(console.error);
