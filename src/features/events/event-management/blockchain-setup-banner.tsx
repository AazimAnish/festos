'use client';

import { useState } from 'react';
import { useWallet } from '@/shared/hooks/use-wallet';
import { useAuthenticatedFetch } from '@/shared/hooks/use-wallet-auth';
import { useWalletClient } from 'wagmi';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface BlockchainSetupBannerProps {
  eventId: string;
  eventTitle: string;
  onSetupComplete?: () => void;
}

export function BlockchainSetupBanner({ eventId, eventTitle, onSetupComplete }: BlockchainSetupBannerProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { isConnected, address } = useWallet();
  const { data: walletClient } = useWalletClient();
  const authenticatedFetch = useAuthenticatedFetch();

  const handleSetupBlockchain = async () => {
    if (!isConnected || !address || !walletClient) {
      toast.error('Please connect your wallet to complete blockchain setup');
      return;
    }

    setIsSettingUp(true);

    try {
      // Step 1: Get transaction data from API
      const response = await authenticatedFetch('/api/events/setup-blockchain', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to prepare blockchain setup');
      }

      const setupData = await response.json();

      if (!setupData.success) {
        throw new Error(setupData.error || 'Blockchain setup preparation failed');
      }

      // Step 2: Sign transaction with user wallet
      const transactionData = setupData.data.transactionData;

      // Convert string args back to BigInt for wallet client
      const convertedArgs = transactionData.args.map((arg: string | number) => {
        if (typeof arg === 'string' && !isNaN(Number(arg))) {
          return BigInt(arg);
        }
        return arg;
      });

      const hash = await walletClient.writeContract({
        address: transactionData.address as `0x${string}`,
        abi: transactionData.abi as readonly unknown[],
        functionName: transactionData.functionName,
        args: convertedArgs,
      });

      // Step 3: Submit signed transaction back to API
      const signedTransactionResponse = await authenticatedFetch('/api/events/setup-blockchain', {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          signedTransaction: {
            transactionHash: hash,
            userWalletAddress: address,
            chainId: transactionData.chainId,
            contractAddress: transactionData.address,
            eventId: '0', // This will be set by the contract
          },
        }),
      });

      if (!signedTransactionResponse.ok) {
        const errorData = await signedTransactionResponse.json();
        throw new Error(errorData.message || 'Failed to complete blockchain setup');
      }

      const finalResult = await signedTransactionResponse.json();

      if (finalResult.success) {
        setIsCompleted(true);
        toast.success('🎉 Blockchain integration completed!', {
          description: `${eventTitle} is now ready for ticket purchases`,
        });
        onSetupComplete?.();
      } else {
        throw new Error(finalResult.error || 'Blockchain setup failed');
      }

    } catch (error) {
      console.error('Blockchain setup error:', error);
      toast.error('❌ Blockchain setup failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Blockchain Integration Complete</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-green-700">
            Your event is now fully integrated with the blockchain and ready for ticket purchases.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-800">Blockchain Setup Required</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-orange-700 mb-4">
          This event needs to be set up on the blockchain before tickets can be purchased. 
          This is a one-time setup that enables secure ticket sales and payments.
        </CardDescription>
        <Button 
          onClick={handleSetupBlockchain}
          disabled={isSettingUp || !isConnected}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isSettingUp ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up blockchain...
            </>
          ) : (
            'Complete Blockchain Setup'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
