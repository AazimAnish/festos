'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { privyConfig } from '@/lib/privy';
import { useState, useEffect } from 'react';
import { avalancheFuji } from 'wagmi/chains';

export function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        defaultChain: avalancheFuji,
        supportedChains: [avalancheFuji],
        appearance: {
          theme: 'light',
          accentColor: '#4f46e5',
          logo: '/festos-logo.png',
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={privyConfig}>
          <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
            {children}
          </div>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
