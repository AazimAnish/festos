'use client';

import { useState } from 'react';
import { useWallet } from '@/shared/hooks/use-wallet';
import { useAuthenticatedFetch } from '@/shared/hooks/use-wallet-auth';
import { useWalletClient } from 'wagmi';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface FixEscrowBannerProps {
  eventId: string;
  eventTitle: string;
  contractEventId: number;
  onEscrowCreated?: () => void;
}

export function FixEscrowBanner({ eventId, eventTitle, contractEventId, onEscrowCreated }: FixEscrowBannerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { isConnected, address } = useWallet();
  const { data: walletClient } = useWalletClient();
  const authenticatedFetch = useAuthenticatedFetch();

  const handleCreateEscrow = async () => {
    if (!isConnected || !address || !walletClient) {
      toast.error('Please connect your wallet to create the escrow contract');
      return;
    }

    setIsCreating(true);

    try {
      // Step 1: Get transaction data from API
      const response = await authenticatedFetch('/api/events/fix-escrow', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to prepare escrow creation');
      }

      const setupData = await response.json();

      if (!setupData.success) {
        throw new Error(setupData.error || 'Escrow creation preparation failed');
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
      const signedTransactionResponse = await authenticatedFetch('/api/events/fix-escrow', {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          signedTransaction: {
            transactionHash: hash,
            userWalletAddress: address,
            chainId: transactionData.chainId,
            contractAddress: transactionData.address,
          },
        }),
      });

      if (!signedTransactionResponse.ok) {
        const errorData = await signedTransactionResponse.json();
        throw new Error(errorData.message || 'Failed to complete escrow creation');
      }

      const finalResult = await signedTransactionResponse.json();

      if (finalResult.success) {
        setIsCompleted(true);
        toast.success('🎉 Escrow contract created!', {
          description: `${eventTitle} is now ready for ticket purchases`,
        });
        onEscrowCreated?.();
      } else {
        throw new Error(finalResult.error || 'Escrow creation failed');
      }

    } catch (error) {
      console.error('Escrow creation error:', error);
      toast.error('❌ Escrow creation failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Escrow Contract Created</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-green-700">
            Your event now has an escrow contract and is ready for ticket purchases.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-yellow-800">Escrow Contract Missing</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-yellow-700 mb-4">
          This event exists on the blockchain (ID: {contractEventId}) but doesn't have an escrow contract. 
          The escrow contract is required for ticket purchases and secure payments.
        </CardDescription>
        <Button 
          onClick={handleCreateEscrow}
          disabled={isCreating || !isConnected}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating escrow contract...
            </>
          ) : (
            'Create Escrow Contract'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
