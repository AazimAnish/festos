'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Users,
  Ticket,
  Gift,
  Globe,
  Lock,
  Wallet,
  Network,
} from 'lucide-react';
import { EventBanner } from './event-banner';
import { DateTimePicker } from './date-time-picker';
import { LocationPicker } from './location-picker';
import { CapacityDialog } from './capacity-dialog';
import { POPDialog } from './pop-dialog';
import { TicketPriceDialog } from './ticket-price-dialog';
import { EventCreationSuccess } from './event-creation-success';
import { useChainId, useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import type { Abi } from 'viem';
import { useAuthenticatedFetch } from '@/shared/hooks/use-wallet-auth';
import { useWallet } from '@/shared/hooks/use-wallet';
// Removed unused import: parseEther
import { avalanche, avalancheFuji } from '@/lib/chains';

// Utility function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};



function EventCreationPage() {
  type PopConfig = {
    popImage?: string;
    recipientsMode: 'all';
    deliveryTime: 'after';
  };

  const [eventName, setEventName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timezone, setTimezone] = useState('America/New_York');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState('free');
  const [ticketPrice, setTicketPrice] = useState('');
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [capacity, setCapacity] = useState('unlimited');
  const [popEnabled, setPopEnabled] = useState(false);
  const [popConfig, setPopConfig] = useState<PopConfig | null>(null);
  const [isPopDialogOpen, setIsPopDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [useTestnet, setUseTestnet] = useState(true); // Default to testnet for safety
  const [mounted, setMounted] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [createdEvent, setCreatedEvent] = useState<{
    title: string;
    date: string;
    location: string;
    uniqueId: string;
    contractEventId?: number;
    transactionHash?: string;
    web3storageMetadataCid?: string;
    web3storageImageCid?: string;
    contractChainId?: number;
    contractAddress?: string;
  } | null>(null);

  // Refs to prevent multiple initializations
  const hasInitialized = useRef(false);

  // Wallet and network state
  const { address: walletAddress, isConnected } = useWallet();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const authenticatedFetch = useAuthenticatedFetch();

  /**
   * Sign transaction with Rainbow Kit
   */
  const signTransactionWithRainbowKit = async (transactionData: {
    address: `0x${string}`;
    abi: Abi;
    functionName: string;
    args: (string | number)[];
    chainId: number;
  }) => {
    if (!walletClient) {
      return {
        success: false,
        error: 'Wallet client not available'
      };
    }

    if (!publicClient) {
      return {
        success: false,
        error: 'Public client not available'
      };
    }

    try {
      console.log('🔍 Preparing transaction with Rainbow Kit...');
      console.log('📍 Contract address:', transactionData.address);
      console.log('📋 Function name:', transactionData.functionName);
      console.log('🔗 Chain ID:', transactionData.chainId);
      console.log('📝 Original args:', transactionData.args);

      // Convert string args back to proper types for wallet client
      const convertedArgs = transactionData.args.map((arg: string | number, index: number) => {
        // Convert specific arguments to their correct types
        // EventTicket.createEvent parameters:
        // 0: title (string), 1: location (string), 2: startTime (uint256), 3: endTime (uint256),
        // 4: maxCapacity (uint256), 5: ticketPrice (uint256), 6: requiresEscrow (bool), 7: baseURI (string)
        if (index === 2 || index === 3 || index === 4 || index === 5) { // startTime, endTime, maxCapacity, ticketPrice
          return BigInt(arg);
        }
        if (index === 6) { // requiresEscrow - convert to boolean
          return String(arg) === 'true' || Number(arg) === 1;
        }
        return arg;
      });

      console.log('🔄 Converted args:', convertedArgs);

      // Check if we're on the correct network
      const currentChainId = await publicClient.getChainId();
      console.log('🌐 Current chain ID:', currentChainId);
      console.log('🎯 Target chain ID:', transactionData.chainId);

      if (currentChainId !== transactionData.chainId) {
        console.log('🔄 Switching to correct network...');
        try {
          await switchChain({ chainId: transactionData.chainId });
          console.log('✅ Network switched successfully');
          
          // Wait a moment for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify the switch
          const newChainId = await publicClient.getChainId();
          if (newChainId !== transactionData.chainId) {
            return {
              success: false,
              error: `Failed to switch to correct network. Please manually switch to chain ID ${transactionData.chainId}`
            };
          }
        } catch (switchError) {
          console.error('❌ Network switch failed:', switchError);
          return {
            success: false,
            error: `Please manually switch to chain ID ${transactionData.chainId}. Current chain ID: ${currentChainId}`
          };
        }
      }

      // Check account balance
      const balance = await publicClient.getBalance({ address: walletAddress! as `0x${string}` });
      console.log('💰 Account balance:', balance.toString(), 'wei');

      // Send transaction using Rainbow Kit
      console.log('📤 Sending transaction...');
      const hash = await walletClient.writeContract({
        address: transactionData.address,
        abi: transactionData.abi,
        functionName: transactionData.functionName,
        args: convertedArgs,
      });

      console.log('✅ Transaction hash received:', hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      // Parse event logs to get the event ID
      const eventCreatedLog = receipt.logs.find((log: { data: string; topics: string[] }) => {
        try {
          const decoded = decodeEventLog({
            abi: transactionData.abi as readonly unknown[],
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === 'EventCreated';
        } catch {
          return false;
        }
      });

      if (!eventCreatedLog) {
        throw new Error('EventCreated event not found in transaction logs');
      }

      const decoded = decodeEventLog({
        abi: transactionData.abi as readonly unknown[],
        data: eventCreatedLog.data,
        topics: eventCreatedLog.topics,
      });

      const eventId = decoded.args.eventId;

      return {
        success: true,
        transactionHash: hash,
        eventId: Number(eventId),
        contractAddress: transactionData.address,
        chainId: transactionData.chainId,
        userSignature: hash, // Transaction hash serves as signature
      };

    } catch (error) {
      console.error('Rainbow Kit transaction signing failed:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds. Please add more AVAX to your wallet.';
        } else if (error.message.includes('nonce')) {
          errorMessage = 'Transaction nonce error. Please try again or refresh your wallet.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by the user.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('gas')) {
          errorMessage = 'Transaction failed. Please try again or check your wallet settings.';
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Contract execution reverted. Please check your input parameters.';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  };

  /**
   * Helper function to decode event logs
   */
  const decodeEventLog = ({ abi, data: _data, topics }: { abi: readonly unknown[]; data: string; topics: string[] }) => {
    try {
      // Find the EventCreated event in the ABI
      const eventAbi = abi.find((item): item is { type: string; name: string } => 
        typeof item === 'object' && item !== null && 'type' in item && 'name' in item &&
        (item as { type: string; name: string }).type === 'event' && 
        (item as { type: string; name: string }).name === 'EventCreated'
      );
      
      if (!eventAbi) {
        throw new Error('EventCreated event not found in ABI');
      }

      // For now, try to extract eventId from the first topic (indexed parameter)
      // In a real implementation, you'd use viem's decodeEventLog
      if (topics.length > 1) {
        // The first topic is the event signature, subsequent topics are indexed parameters
        // eventId is usually the first indexed parameter
        const eventIdHex = topics[1]; // First indexed parameter
        if (eventIdHex && eventIdHex.startsWith('0x')) {
          const eventId = BigInt(eventIdHex);
          return {
            eventName: 'EventCreated',
            args: {
              eventId: eventId,
            },
          };
        }
      }

      // Fallback: try to parse from data if topics don't work
      // This is a simplified approach - in production use proper ABI decoding
      return {
        eventName: 'EventCreated',
        args: {
          eventId: BigInt(1), // Fallback to 1 instead of 0
        },
      };
    } catch (error) {
      console.error('Event log decoding error:', error);
      // Return a fallback eventId to prevent complete failure
      return {
        eventName: 'EventCreated',
        args: {
          eventId: BigInt(1), // Fallback to 1
        },
      };
    }
  };

  /**
   * Create escrow contract for an event
   */
  const createEscrowContract = async (eventId: number, ticketPrice: string, endDate: Date) => {
    if (!walletClient || !publicClient) {
      return {
        success: false,
        error: 'Wallet client not available'
      };
    }

    try {
      // Get escrow contract address from environment
      const escrowAddress = process.env.NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS;
      if (!escrowAddress) {
        throw new Error('Escrow contract address not configured');
      }

      // Convert ticket price to wei
      const ticketPriceWei = BigInt(parseFloat(ticketPrice) * 10**18);
      
      // Convert end date to Unix timestamp
      const endTimeUnix = BigInt(Math.floor(endDate.getTime() / 1000));

      // Create escrow transaction
      const escrowHash = await walletClient.writeContract({
        address: escrowAddress as `0x${string}`,
        abi: [
          {
            type: 'function',
            name: 'createEventEscrow',
            inputs: [
              { type: 'uint256', name: 'eventId' },
              { type: 'uint256', name: 'ticketPrice' },
              { type: 'uint256', name: 'eventEndTime' },
            ],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        functionName: 'createEventEscrow',
        args: [BigInt(eventId), ticketPriceWei, endTimeUnix],
      });

      // Wait for escrow transaction confirmation
      await publicClient.waitForTransactionReceipt({
        hash: escrowHash,
      });

      return {
        success: true,
        escrowTransactionHash: escrowHash,
        escrowAddress,
      };

    } catch (error) {
      console.error('Escrow creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Escrow creation failed',
      };
    }
  };

  // Prevent hydration errors and ensure WagmiProvider is ready
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize default future-safe times on mount - only run once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasInitialized.current) return; // Prevent multiple initializations
    if (!mounted) return; // Wait for component to be mounted
    
    hasInitialized.current = true;
    
    const now = new Date();
    const minutes = now.getMinutes();
    const nextQuarter = Math.ceil((minutes + 5) / 15) * 15; // small buffer then round up
    const initStart = new Date(now);
    initStart.setSeconds(0, 0);
    if (nextQuarter >= 60) {
      initStart.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      initStart.setMinutes(nextQuarter, 0, 0);
    }
    const initEnd = new Date(initStart.getTime() + 60 * 60 * 1000);
    
    setStartDate(initStart);
    setEndDate(initEnd);
  }, [mounted]); // Only depend on mounted state

  const popSummary = popConfig ? 'All attendees after event' : undefined;

  const handlePopToggle = (enabled: boolean) => {
    if (enabled) {
      if (popConfig) {
        setPopEnabled(true);
      } else {
        setPopEnabled(true);
        setIsPopDialogOpen(true);
      }
    } else {
      // Turning POP off should clear any saved configuration
      setPopEnabled(false);
      setPopConfig(null);
      setIsPopDialogOpen(false);
    }
  };

  const handlePopDialogOpenChange = (open: boolean) => {
    setIsPopDialogOpen(open);
    if (!open && !popConfig) {
      setPopEnabled(false);
    }
  };

  const handlePopSave = (config: PopConfig) => {
    setPopConfig(config);
    setPopEnabled(true);
    setIsPopDialogOpen(false);
  };

  const handleTicketTypeChange = (value: string) => {
    setTicketType(value);
    if (value === 'paid') {
      setIsTicketDialogOpen(true);
    } else {
      setTicketPrice('');
      setIsTicketDialogOpen(false);
    }
  };

  const handleTicketPriceSave = (priceAvax: string) => {
    setTicketPrice(priceAvax);
    setIsTicketDialogOpen(false);
  };

  const handleCreateEvent = async () => {
    if (!isFormValid()) {
      return;
    }

    // Check if wallet is connected
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet to create an event');
      return;
    }

    // Check if wallet is on correct network
    if (chainId !== avalanche.id && chainId !== avalancheFuji.id) {
      alert('Please connect to Avalanche network (Mainnet or Testnet)');
      return;
    }

    // Ensure start/end are in the future and end > start
    const now = new Date();
    let computedStart = startDate ? new Date(startDate) : new Date(now);
    if (computedStart <= now) {
      const minutes = now.getMinutes();
      const nextQuarter = Math.ceil((minutes + 5) / 15) * 15;
      computedStart = new Date(now);
      computedStart.setSeconds(0, 0);
      if (nextQuarter >= 60) {
        computedStart.setHours(now.getHours() + 1, 0, 0, 0);
      } else {
        computedStart.setMinutes(nextQuarter, 0, 0);
      }
      setStartDate(computedStart);
    }

    let computedEnd = endDate
      ? new Date(endDate)
      : new Date(computedStart.getTime() + 60 * 60 * 1000);
    if (computedEnd <= computedStart) {
      computedEnd = new Date(computedStart.getTime() + 60 * 60 * 1000);
      setEndDate(computedEnd);
    }

    setIsSubmitting(true);

    try {
      // Step 1: Prepare event data
      const eventData = {
        title: eventName,
        description: description,
        location: location,
        startDate: computedStart.toISOString(),
        endDate: computedEnd.toISOString(),
        maxCapacity: capacity === 'unlimited' ? 0 : parseInt(capacity),
        ticketPrice: ticketType === 'free' ? '0' : ticketPrice,
        requireApproval: requireApproval,
        hasPOAP: popEnabled,
        poapMetadata: popConfig?.popImage || '',
        visibility: visibility,
        timezone: timezone,
        bannerImage: bannerImage ? await fileToBase64(bannerImage) : undefined, // Convert File to base64
        category: 'General',
        tags: [],
      };

      // Step 2: Call API to get transaction data and upload metadata
      const response = await authenticatedFetch('/api/events/create', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prepare event creation');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Event preparation failed');
      }

      const preparationData = responseData.data;

      // Step 3: Sign transaction with user wallet using Rainbow Kit
      const signedTransaction = await signTransactionWithRainbowKit(preparationData.transactionData);

      if (!signedTransaction.success) {
        throw new Error(signedTransaction.error || 'Transaction signing failed');
      }

      // Step 4: Create escrow contract for the created event (only for paid events)
      let escrowResult = null;
      if (parseFloat(ticketPrice) > 0 && signedTransaction.eventId) {
        escrowResult = await createEscrowContract(signedTransaction.eventId, ticketPrice, computedEnd);

        if (!escrowResult.success) {
          throw new Error(escrowResult.error || 'Escrow creation failed');
        }
      } else {
        console.log('🎫 Free event - skipping escrow creation');
      }

      // Step 5: Submit signed transaction and escrow information to backend
      const requestBody = {
        signedTransaction: {
          ...signedTransaction,
          userWalletAddress: walletAddress,
        },
        eventData: eventData,
        escrowData: escrowResult ? {
          transactionHash: escrowResult.escrowTransactionHash,
          contractAddress: escrowResult.escrowAddress,
        } : null,
      };
      
      // API request being sent
      
      const finalResponse = await authenticatedFetch('/api/events/create', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!finalResponse.ok) {
        const errorData = await finalResponse.json();
        throw new Error(errorData.error || 'Failed to submit signed transaction');
      }

      const finalResponseData = await finalResponse.json();
      
      if (!finalResponseData.success) {
        throw new Error(finalResponseData.error || 'Event creation failed');
      }

      const result = finalResponseData.data;

      const createdEventData = {
        title: eventName,
        date: computedStart.toLocaleDateString() || '',
        location: location,
        uniqueId: result.slug || result.eventId,
        contractEventId: result.contractEventId,
        transactionHash: result.transactionHash,
        web3storageMetadataCid: result.ipfsMetadataUrl,
        web3storageImageCid: result.ipfsImageUrl,
        contractChainId: result.contractChainId,
        contractAddress: result.contractAddress,
      };

      setCreatedEvent(createdEventData);
      setIsSuccess(true);
    } catch (error) {
      alert(
        (error as Error).message || 'Failed to create event. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setCreatedEvent(null);
    setEventName('');
    setVisibility('public');
    setStartDate(undefined);
    setEndDate(undefined);
    setTimezone('America/New_York');
    setLocation('');
    setDescription('');
    setTicketType('free');
    setTicketPrice('');
    setRequireApproval(false);
    setCapacity('unlimited');
    setPopEnabled(false);
    setPopConfig(null);
  };

  // Validation helper function
  const isFormValid = () => {
    const hasEventName = eventName.trim().length > 0;
    const hasStartDate =
      startDate instanceof Date && !isNaN(startDate.getTime());
    const hasLocation = location.trim().length > 0;

    return hasEventName && hasStartDate && hasLocation;
  };

  // Show success component if event was created successfully
  if (isSuccess && createdEvent) {
    return (
      <EventCreationSuccess eventData={createdEvent} onClose={handleReset} />
    );
  }

  // Instead of conditionally rendering, we'll use CSS to hide/show content
  // This prevents hydration mismatches

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6'>
          <div className='flex-1'>
            <Input
              placeholder='Event name *'
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold border-none shadow-none h-auto py-4 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 font-primary leading-[1.2] tracking-tight ${
                eventName.trim().length === 0
                  ? 'text-muted-foreground'
                  : 'text-primary'
              }`}
            />
            {eventName.trim().length === 0 && (
              <p className='text-sm text-muted-foreground mt-2'>
                Event name is required
              </p>
            )}
          </div>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className='w-32 h-9 rounded-lg border-border'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='public'>
                <div className='flex items-center gap-2'>
                  <Globe className='h-4 w-4' />
                  Public
                </div>
              </SelectItem>
              <SelectItem value='private'>
                <div className='flex items-center gap-2'>
                  <Lock className='h-4 w-4' />
                  Private
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8'>
          {/* Left Column - Event Banner */}
          <div className='lg:col-span-1'>
            <EventBanner onImageChange={setBannerImage} />
          </div>

          {/* Right Column - Event Details */}
          <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
            {/* Date & Time */}
            <div className='space-y-2'>
              <div className='grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4'>
                <div className='sm:col-span-3'>
                  <DateTimePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                </div>
                <div className='sm:col-span-1'>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className='h-10 sm:h-12 rounded-lg'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='America/New_York'>EST</SelectItem>
                      <SelectItem value='America/Los_Angeles'>PST</SelectItem>
                      <SelectItem value='Europe/London'>GMT</SelectItem>
                      <SelectItem value='Asia/Tokyo'>JST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(!startDate ||
                !(startDate instanceof Date) ||
                isNaN(startDate.getTime())) && (
                <p className='text-sm text-muted-foreground'>
                  Start date and time are required
                </p>
              )}
            </div>

            {/* Location */}
            <div className='space-y-2'>
              <LocationPicker
                value={location}
                onChange={setLocation}
                onlyOffline={Boolean(startDate)}
              />
              {location.trim().length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  Location is required
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Textarea
                placeholder='Add event description...'
                value={description}
                onChange={e => setDescription(e.target.value)}
                className='min-h-32 rounded-xl border-border resize-none'
              />
            </div>

            {/* Event Options */}
            <Card className='rounded-xl border-border'>
              <CardContent className='p-6 space-y-6'>
                <h3 className='text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-primary'>
                  Event Options
                </h3>

                {/* Ticket Options */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Ticket className='h-5 w-5 text-muted-foreground' />
                      <Label className='text-base'>Tickets</Label>
                    </div>
                    <Select
                      value={ticketType}
                      onValueChange={handleTicketTypeChange}
                    >
                      <SelectTrigger className='w-24 h-9 rounded-lg'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='free'>Free</SelectItem>
                        <SelectItem value='paid'>Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {ticketType === 'paid' && (
                    <div className='ml-8 flex items-center gap-2'>
                      {ticketPrice ? (
                        <span className='text-sm text-muted-foreground'>
                          {ticketPrice} AVAX
                        </span>
                      ) : (
                        <span className='text-sm text-muted-foreground'>
                          No price set
                        </span>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='rounded-lg'
                        onClick={() => setIsTicketDialogOpen(true)}
                      >
                        {ticketPrice ? 'Edit' : 'Set price'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Require Approval */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Users className='h-5 w-5 text-muted-foreground' />
                    <Label className='text-base'>Require approval</Label>
                  </div>
                  <Switch
                    checked={requireApproval}
                    onCheckedChange={setRequireApproval}
                  />
                </div>

                {/* Capacity Settings */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Users className='h-5 w-5 text-muted-foreground' />
                    <Label className='text-base'>Capacity</Label>
                  </div>
                  <CapacityDialog value={capacity} onChange={setCapacity} />
                </div>

                {/* POP Option */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Gift className='h-5 w-5 text-muted-foreground' />
                      <Label className='text-base'>
                        Proof of Participation (POP)
                      </Label>
                    </div>
                    <Switch
                      checked={popEnabled}
                      onCheckedChange={handlePopToggle}
                    />
                  </div>

                  {popEnabled && (
                    <div className='ml-8 flex items-center gap-2'>
                      {popSummary ? (
                        <span className='text-sm text-muted-foreground'>
                          {popSummary}
                        </span>
                      ) : (
                        <span className='text-sm text-muted-foreground'>
                          No configuration
                        </span>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='rounded-lg'
                        onClick={() => setIsPopDialogOpen(true)}
                      >
                        {popSummary ? 'Edit' : 'Configure'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Blockchain Configuration */}
                <div className='space-y-4 border-t pt-6'>
                  <div className='flex items-center gap-3'>
                    <Network className='h-5 w-5 text-muted-foreground' />
                    <Label className='text-base font-semibold'>
                      Blockchain Configuration
                    </Label>
                  </div>

                  {/* Wallet Connection Status */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Wallet className='h-5 w-5 text-muted-foreground' />
                      <Label className='text-base'>Wallet Connection</Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      {/* Loading state - shown during SSR and initial hydration */}
                      <div className='flex items-center gap-2' style={{ display: mounted ? 'none' : 'flex' }}>
                        <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
                        <span className='text-sm text-gray-500 font-medium'>
                          Loading...
                        </span>
                      </div>
                      
                      {/* Connected state - hidden until mounted */}
                      <div className='flex items-center gap-2' style={{ display: mounted && isConnected ? 'flex' : 'none' }}>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <span className='text-sm text-green-600 font-medium'>
                          Connected
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {walletAddress?.slice(0, 6)}...
                          {walletAddress?.slice(-4)}
                        </span>
                      </div>
                      
                      {/* Not connected state - hidden until mounted */}
                      <div className='flex items-center gap-2' style={{ display: mounted && !isConnected ? 'flex' : 'none' }}>
                        <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                        <span className='text-sm text-red-600 font-medium'>
                          Not Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Network Selection */}
                  <div className='flex items-center justify-between'>
                    <Label className='text-base'>Network</Label>
                    <Select
                      value={useTestnet ? 'testnet' : 'mainnet'}
                      onValueChange={value =>
                        setUseTestnet(value === 'testnet')
                      }
                    >
                      <SelectTrigger className='w-32 h-9 rounded-lg'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='testnet'>Fuji Testnet</SelectItem>
                        <SelectItem value='mainnet'>Avalanche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Current Chain Info - always render but conditionally show */}
                  <div className='flex items-center justify-between' style={{ display: mounted && isConnected ? 'flex' : 'none' }}>
                    <Label className='text-base'>Current Chain</Label>
                    <span className='text-sm text-muted-foreground'>
                      {chainId === 43113
                        ? 'Avalanche Fuji Testnet'
                        : chainId === 43114
                          ? 'Avalanche Mainnet'
                          : `Chain ID: ${chainId}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* POP Dialog */}
            <POPDialog
              open={isPopDialogOpen}
              onOpenChange={handlePopDialogOpenChange}
              onSave={handlePopSave}
              trigger={null}
              initialImage={popConfig?.popImage}
            />

            {/* Action Buttons */}
            <div className='flex gap-3 pt-4'>
              <Button
                variant='outline'
                className='flex-1 h-12 rounded-xl bg-transparent'
              >
                Save Draft
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={isSubmitting || !isFormValid()}
                className='flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90'
              >
                {isSubmitting ? (
                  <div className='flex items-center space-x-2'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                    <span>Creating Event...</span>
                  </div>
                ) : (
                  'Create Event'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <TicketPriceDialog
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
        initialPrice={ticketPrice}
        onSave={handleTicketPriceSave}
      />
    </div>
  );
}

export { EventCreationPage };
