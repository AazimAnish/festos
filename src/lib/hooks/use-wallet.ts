'use client';

import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useMemo } from 'react';
import { avalanche, avalancheFuji } from '@/lib/chains';

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: balance } = useBalance({
    address,
    chainId,
  });

  const isAvalanche = useMemo(() => {
    return chainId === avalanche.id || chainId === avalancheFuji.id;
  }, [chainId]);

  const isTestnet = useMemo(() => {
    return chainId === avalancheFuji.id;
  }, [chainId]);

  const switchToAvalanche = () => {
    switchChain({ chainId: avalanche.id });
  };

  const switchToAvalancheTestnet = () => {
    switchChain({ chainId: avalancheFuji.id });
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
