'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';
import { avalancheFuji } from '@/lib/chains';

export function useWallet() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  
  const address = wallets.length > 0 ? wallets[0].address : null;
  const isConnected = authenticated && !!address;
  const isConnecting = !ready;
  const isDisconnected = !authenticated;
  
  // For now, default to Avalanche Fuji testnet
  const chainId = avalancheFuji.id;
  const balance = undefined; // We'll implement balance checking later if needed

  const isAvalanche = useMemo(() => {
    return chainId === avalancheFuji.id; // We're using Fuji testnet
  }, [chainId]);

  const isTestnet = useMemo(() => {
    return chainId === avalancheFuji.id;
  }, [chainId]);

  const switchToAvalanche = async () => {
    // For Privy embedded wallets, chain switching is handled automatically
    console.log('Chain switching will be handled by embedded wallet');
  };

  const switchToAvalancheTestnet = async () => {
    // For Privy embedded wallets, chain switching is handled automatically
    console.log('Chain switching will be handled by embedded wallet');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (
    balance: bigint | undefined,
    decimals: number = 18
  ) => {
    if (!balance) return '0';
    const formatted = Number(balance) / Math.pow(10, decimals);
    return formatted.toFixed(4);
  };

  return {
    // Account state
    address,
    isConnected,
    isConnecting,
    isDisconnected,

    // Chain state
    chainId,
    isAvalanche,
    isTestnet,

    // Balance
    balance,

    // Actions
    switchToAvalanche,
    switchToAvalancheTestnet,

    // Utilities
    formatAddress,
    formatBalance,
  };
}
