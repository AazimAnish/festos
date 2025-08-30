import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { avalanche, avalancheFuji, mainnet, sepolia } from 'wagmi/chains';

export const privyConfig = createConfig({
  chains: [avalancheFuji, avalanche, mainnet, sepolia],
  transports: {
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});