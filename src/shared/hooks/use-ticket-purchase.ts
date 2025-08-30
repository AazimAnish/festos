import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from '@/shared/hooks/use-wallet-auth';
import { useWallet } from '@/shared/hooks/use-wallet';
import { toast } from 'sonner';
import { useWalletClient, usePublicClient } from 'wagmi';

interface PurchaseTicketParams {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
}

interface TransactionData {
  address: `0x${string}`;
  abi: readonly unknown[];
  functionName: string;
  args: (string | number)[];
  value: string;
  chainId: number;
}

interface PurchaseTicketResponse {
  success: boolean;
  data: {
    ticket?: {
      id: string;
      eventId: string;
      attendeeName: string;
      attendeeEmail: string;
      pricePaid: string;
      purchaseTime: string;
      isApproved: boolean;
      contractTicketId: number;
      transactionHash: string;
    };
    purchaseDetails?: {
      eventId: string;
      attendeeName: string;
      attendeeEmail: string;
      value: string;
      gasEstimate: string;
    };
    transactionData?: TransactionData;
    event: {
      id: string;
      title: string;
      location: string;
      startDate: string;
      endDate: string;
      ticketPrice: string;
      currentAttendees: number;
      maxCapacity: number;
    };
  };
  message: string;
}

export function usePurchaseTicket() {
  const queryClient = useQueryClient();
  const authenticatedFetch = useAuthenticatedFetch();
  const { isConnected, address } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: PurchaseTicketParams): Promise<PurchaseTicketResponse> => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      if (!walletClient || !publicClient) {
        throw new Error('Wallet client not available');
      }

      // Step 1: Get purchase preparation data from API
      const purchaseData = await authenticatedFetch('/api/tickets/purchase', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (!purchaseData.ok) {
        const errorData = await purchaseData.json();
        throw new Error(errorData.message || 'Failed to prepare purchase');
      }

      const purchaseResponse: PurchaseTicketResponse = await purchaseData.json();
      const { transactionData, event } = purchaseResponse.data;
      
      if (!transactionData) {
        throw new Error('No transaction data received from server');
      }

      const ticketPrice = parseFloat(event.ticketPrice);
      const isFreeEvent = ticketPrice === 0;

      // Show pricing information to user
      toast.info('Purchase Details', {
        description: isFreeEvent 
          ? 'Free ticket - only gas fees apply' 
          : `Ticket price: ${ticketPrice} AVAX + gas fees`,
      });

      // Ensure we're on the correct chain (Avalanche Fuji)
      const currentChain = await publicClient.getChainId();
      if (currentChain !== 43113) {
        throw new Error('Please switch to Avalanche Fuji testnet to purchase tickets');
      }

      try {
        // Check user's balance before attempting transaction
        const balance = await publicClient.getBalance({ address: address as `0x${string}` });
        
        // For free events, user still needs gas fees (minimum 0.001 AVAX)
        if (isFreeEvent && balance < BigInt('1000000000000000')) {
          throw new Error('Insufficient funds for gas fees. Please ensure you have at least 0.001 AVAX for transaction fees.');
        }

        // For paid events, check if user has enough for ticket + gas
        const ticketPriceWei = BigInt(transactionData.value);
        const minRequiredBalance = ticketPriceWei + BigInt('1000000000000000'); // ticket + 0.001 AVAX for gas
        
        if (!isFreeEvent && balance < minRequiredBalance) {
          throw new Error(`Insufficient funds. You need at least ${(Number(minRequiredBalance) / 1e18).toFixed(4)} AVAX for ticket price and gas fees.`);
        }

        // Convert string args to proper types for wallet client
        const convertedArgs = transactionData.args.map((arg: string | number) => {
          if (typeof arg === 'string' && !isNaN(Number(arg)) && arg !== '') {
            return BigInt(arg);
          }
          return arg;
        });

        // Execute the transaction
        const contractCallParams = {
          address: transactionData.address as `0x${string}`,
          abi: transactionData.abi,
          functionName: transactionData.functionName,
          args: convertedArgs,
        } as const;

        // Type assertion needed for wagmi writeContract compatibility with dynamic ABIs
        const transactionHash = ticketPriceWei > 0n 
          ? await (walletClient.writeContract as (params: unknown) => Promise<`0x${string}`>)({
              ...contractCallParams,
              value: ticketPriceWei,
              chain: { id: 43113, name: 'Avalanche Fuji', nativeCurrency: { symbol: 'AVAX' } },
            })
          : await (walletClient.writeContract as (params: unknown) => Promise<`0x${string}`>)({
              ...contractCallParams,
              chain: { id: 43113, name: 'Avalanche Fuji', nativeCurrency: { symbol: 'AVAX' } },
            });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: transactionHash,
        });

        if (receipt.status !== 'success') {
          throw new Error('Transaction failed');
        }

        // Step 2: Complete the ticket purchase on backend
        const completionResponse = await authenticatedFetch('/api/tickets/purchase', {
          method: 'POST',
          body: JSON.stringify({
            ...params,
            signedTransaction: {
              transactionHash,
              userWalletAddress: address,
              chainId: transactionData.chainId,
              contractAddress: transactionData.address,
            },
          }),
        });

        if (!completionResponse.ok) {
          const errorData = await completionResponse.json();
          throw new Error(errorData.message || 'Failed to complete ticket purchase');
        }

        const completionResult = await completionResponse.json();

        // For paid events, the NFT is minted directly by the EventTicket contract
        // For free events, we need to mint the NFT separately
        if (isFreeEvent) {
          try {
            const nftResponse = await authenticatedFetch('/api/tickets/mint-nft', {
              method: 'POST',
              body: JSON.stringify({
                eventId: params.eventId,
                attendeeName: params.attendeeName,
                attendeeEmail: params.attendeeEmail,
                signedTransaction: {
                  transactionHash,
                  userWalletAddress: address,
                },
              }),
            });

            if (nftResponse.ok) {
              const nftResult = await nftResponse.json();
              const nftTransactionData = nftResult.data.mintTransactionData;

              // Execute NFT minting transaction
              const nftHash = await walletClient.writeContract({
                address: nftTransactionData.address,
                abi: nftTransactionData.abi,
                functionName: nftTransactionData.functionName,
                args: nftTransactionData.args,
                value: BigInt(nftTransactionData.value),
                chain: walletClient.chain,
                account: walletClient.account,
              });

              // Wait for NFT minting confirmation
              await publicClient.waitForTransactionReceipt({
                hash: nftHash,
              });
            }
          } catch (error) {
            console.warn('NFT minting failed, but ticket was created:', error);
            // Continue - the ticket was still created successfully
          }
        }

        return completionResult;

      } catch (error) {
        console.error('Transaction error:', error);
        
        if (error instanceof Error) {
          // Handle specific error types
          if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient funds. Please ensure you have enough AVAX for the ticket price and gas fees.');
          } else if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
            throw new Error('Transaction was cancelled by user');
          } else if (error.message.includes('execution reverted')) {
            throw new Error('Transaction failed. The event may be full or you may already have a ticket.');
          } else if (error.message.includes('not authorized')) {
            throw new Error('Please switch to Avalanche Fuji testnet to purchase tickets');
          } else if (error.message.includes('nonce')) {
            throw new Error('Transaction failed due to nonce error. Please try again.');
          } else {
            throw error;
          }
        }
        
        throw new Error('Transaction failed. Please try again.');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });

      // Show success message
      if (data.data.ticket) {
        toast.success('Ticket purchased successfully!', {
          description: `You now have a ticket for ${data.data.event.title}`,
        });
      }
    },
    onError: (error: Error) => {
      let errorMessage = 'Transaction failed';
      let errorDescription = 'Please try again or contact support if the issue persists.';

      if (error.message.includes('Event not ready for ticket purchase')) {
        errorMessage = 'Event not ready for ticket purchases';
        errorDescription = 'This event needs to be set up on the blockchain first. Please contact the event organizer.';
      } else if (error.message.includes('Escrow not found') || error.message.includes('missing_escrow_contract')) {
        errorMessage = 'Event setup incomplete';
        errorDescription = 'The event organizer needs to complete the blockchain setup. Please contact them.';
      } else if (error.message.includes('Insufficient funds')) {
        errorMessage = 'Insufficient funds';
        errorDescription = error.message;
      } else if (error.message.includes('Already have a ticket') || error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'Already registered';
        errorDescription = 'You already have a ticket for this event.';
      } else if (error.message.includes('Event is at full capacity')) {
        errorMessage = 'Event is full';
        errorDescription = 'This event has reached its maximum capacity.';
      } else if (error.message.includes('Transaction was cancelled')) {
        errorMessage = 'Transaction cancelled';
        errorDescription = 'You cancelled the transaction. No charges were made.';
      } else if (error.message.includes('Event does not exist')) {
        errorMessage = 'Event not found';
        errorDescription = 'This event does not exist or has not been properly set up.';
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });
    },
  });
}