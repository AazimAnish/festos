# Wallet Integration with RainbowKit v2

This project uses [RainbowKit v2](https://rainbowkit.com/) for wallet connection functionality, following their latest best practices for React applications.

## Features

### ✅ Core Wallet Functionality
- **Multi-wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Avalanche Chain Support**: Mainnet and Fuji testnet with custom configuration
- **Network Switching**: Automatic network detection and switching
- **Balance Display**: Real-time wallet balance
- **Address Formatting**: Clean address display with truncation
- **EIP-6963 Support**: Enhanced wallet discovery and connection

### ✅ Supported Networks
- **Avalanche Mainnet** (Chain ID: 43114) - Custom configured
- **Avalanche Fuji Testnet** (Chain ID: 43113) - Custom configured
- **Ethereum Mainnet** (Chain ID: 1)
- **Ethereum Sepolia Testnet** (Chain ID: 11155111)

## Setup

### 1. Environment Variables
Create a `.env.local` file with your WalletConnect project ID:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

### 2. Get WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the project ID to your environment variables

### 3. Install Dependencies
```bash
bun add @rainbow-me/rainbowkit@2 wagmi@2 viem@2.x @tanstack/react-query
```

## Configuration

### Custom Chain Configuration
Chains are configured in `src/lib/chains.ts` with custom Avalanche setup:

```tsx
export const avalanche = {
  id: 43_114,
  name: 'Avalanche',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
} as const satisfies Chain;
```

### Wagmi Configuration
Using the new `getDefaultConfig` API in `src/lib/wagmi.ts`:

```tsx
export const config = getDefaultConfig({
  appName: 'Festos - Event Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains,
  transports: {
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
  },
});
```

### Provider Setup
The RainbowKit provider is configured in `src/components/providers/rainbowkit-provider.tsx`:

```tsx
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
```

## Usage

### Connect Button
The wallet connect button is available in the header and automatically handles:
- Wallet connection/disconnection
- Network switching
- Balance display
- Address formatting

```tsx
import { CustomConnectButton } from "@/components/wallet/connect-button";

<CustomConnectButton />
```

### Wallet Hook
Use the custom wallet hook for wallet state and actions:

```tsx
import { useWallet } from "@/lib/hooks/use-wallet";

const { 
  address, 
  isConnected, 
  balance, 
  isAvalanche,
  switchToAvalanche 
} = useWallet();
```

### Registration Integration
The registration form automatically integrates with wallet functionality:
- Wallet connection required for payment step
- Network validation (must be on Avalanche)
- Real wallet address and balance display

## v2 Migration Benefits

### 1. Simplified Configuration
- **getDefaultConfig**: Single API for configuration
- **No manual wallet setup**: Default wallets included automatically
- **Simplified provider setup**: No need to pass chains to RainbowKitProvider

### 2. Enhanced Wallet Discovery
- **EIP-6963 Support**: Better wallet detection
- **Installed wallets section**: Automatic detection of installed wallets
- **Improved UX**: Better wallet connection experience

### 3. Performance Improvements
- **Better tree shaking**: Smaller bundle sizes
- **Optimized re-renders**: Better React performance
- **Faster connections**: Improved connection speed

## Best Practices

### 1. Error Handling
- Network switching errors are handled gracefully
- Connection failures show user-friendly messages
- Unsupported networks prompt for switching

### 2. User Experience
- Loading states for wallet operations
- Clear network indicators with custom icons
- Balance updates in real-time
- Responsive design for mobile wallets

### 3. Security
- Wallet connection state validation
- Network verification before transactions
- Proper error boundaries for wallet components

## Testing

### Testnet Usage
For development and testing:
1. Connect to Avalanche Fuji testnet
2. Get test AVAX from [Avalanche Faucet](https://faucet.avax.network/)
3. Test wallet functionality with test tokens

### Mainnet Deployment
For production:
1. Ensure proper environment variables
2. Test on Avalanche mainnet
3. Verify all wallet integrations work correctly

## Troubleshooting

### Common Issues
1. **Wallet not connecting**: Check WalletConnect project ID
2. **Wrong network**: Use network switching buttons
3. **Balance not showing**: Ensure wallet is connected and on correct network

### Debug Mode
Enable debug mode in development:
```tsx
// In wagmi config
debug: process.env.NODE_ENV === 'development',
```

## Migration from v1

If migrating from RainbowKit v1:

1. **Update dependencies**:
   ```bash
   bun add @rainbow-me/rainbowkit@2 wagmi@2 viem@2.x @tanstack/react-query
   ```

2. **Update configuration**:
   - Use `getDefaultConfig` instead of `createConfig`
   - Remove `getDefaultWallets` and `connectorsForWallets`
   - Remove `chains` prop from `RainbowKitProvider`

3. **Update imports**:
   - Import chains from custom configuration
   - Use new wagmi v2 hooks

## Resources

- [RainbowKit v2 Documentation](https://rainbowkit.com/docs/introduction)
- [Wagmi v2 Documentation](https://wagmi.sh/)
- [Avalanche Documentation](https://docs.avax.network/)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Migration Guide](https://rainbowkit.com/docs/migration-guide) 