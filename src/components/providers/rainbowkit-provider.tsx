'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function RainbowKitProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={config.chains[2]} // Default to Avalanche
          locale="en-US"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 