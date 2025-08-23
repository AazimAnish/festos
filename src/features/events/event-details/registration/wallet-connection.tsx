'use client';

import { memo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { useWallet } from '@/shared/hooks/use-wallet';
import { avalanche, avalancheFuji } from '@/lib/chains';

interface WalletConnectionProps {
  onWalletConnected?: (address: string) => void;
}

export const WalletConnection = memo(function WalletConnection({
  onWalletConnected,
}: WalletConnectionProps) {
  const {
    address,
    isConnected,
    chainId,
    isAvalanche,
    formatAddress,
    formatBalance,
    balance,
    switchToAvalanche,
    switchToAvalancheTestnet,
  } = useWallet();

  // Notify parent component when wallet connects
  if (isConnected && address && onWalletConnected) {
    onWalletConnected(address);
  }

  const getChainName = () => {
    if (chainId === avalanche.id) return 'Avalanche Mainnet';
    if (chainId === avalancheFuji.id) return 'Avalanche Testnet';
    return 'Unknown Network';
  };

  const getChainIcon = () => {
    if (chainId === avalanche.id || chainId === avalancheFuji.id) {
      return '❄️'; // Snowflake for Avalanche
    }
    return '🔗';
  };

  return (
    <Card className='border-2 border-border bg-background/80 backdrop-blur-sm shadow-lg rounded-3xl'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-base flex items-center space-x-3'>
          <Wallet className='h-5 w-5 text-primary' />
          <span className='font-secondary'>Wallet Connection</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!isConnected ? (
          <div className='space-y-3'>
            <p className='text-sm text-gray text-center'>
              Connect your wallet to continue with registration
            </p>
            <div className='text-xs text-gray text-center'>
              Supported networks: Avalanche Mainnet & Testnet
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='flex items-center space-x-3 text-sm'>
              <CheckCircle className='h-5 w-5 text-primary' />
              <span className='font-secondary font-medium text-primary'>
                Wallet Connected
              </span>
            </div>

            <div className='space-y-2'>
              <div className='text-xs text-gray font-mono bg-muted/50 p-3 rounded-3xl border border-border backdrop-blur-sm'>
                {address ? formatAddress(address) : 'Loading...'}
              </div>

              {balance && (
                <div className='text-xs text-gray bg-muted/30 p-2 rounded-3xl border border-border'>
                  Balance: {formatBalance(balance.value)} {balance.symbol}
                </div>
              )}

              <div className='flex items-center space-x-2 text-xs'>
                <span className='text-gray'>Network:</span>
                <span className='font-mono'>
                  {getChainIcon()} {getChainName()}
                </span>
              </div>
            </div>

            {!isAvalanche && (
              <div className='space-y-2'>
                <div className='flex items-center space-x-2 text-xs text-warning'>
                  <AlertCircle className='w-3 h-3' />
                  <span>Wallet not connected</span>
                </div>
                <div className='flex space-x-2'>
                  <Button
                    onClick={switchToAvalanche}
                    size='sm'
                    variant='outline'
                    className='text-xs font-secondary backdrop-blur-sm rounded-3xl'
                  >
                    Switch to Mainnet
                  </Button>
                  <Button
                    onClick={switchToAvalancheTestnet}
                    size='sm'
                    variant='outline'
                    className='text-xs font-secondary backdrop-blur-sm rounded-3xl'
                  >
                    Switch to Testnet
                  </Button>
                </div>
              </div>
            )}

            {isAvalanche && (
              <div className='flex items-center space-x-2 text-xs text-success'>
                <CheckCircle className='w-3 h-3' />
                <span>Wallet connected</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
