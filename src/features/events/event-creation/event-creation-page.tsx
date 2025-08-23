'use client';

import { useState, useEffect } from 'react';
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
import { useAccount, useChainId } from 'wagmi';
import { useAuthenticatedFetch } from '@/shared/hooks/use-wallet-auth';

export function EventCreationPage() {
  type PopConfig = {
    popImage?: string;
    recipientsMode: 'all' | 'random' | 'top';
    recipientsCount?: number;
    deliveryTime: string;
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

  // Wallet and network state
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const authenticatedFetch = useAuthenticatedFetch();

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize default future-safe times on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!startDate) {
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
      setEndDate(prev => prev ?? initEnd);
    } else if (!endDate) {
      const initEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
      setEndDate(initEnd);
    }
  }, [startDate, endDate]);

  const popSummary = popConfig
    ? popConfig.recipientsMode === 'all'
      ? 'All attendees'
      : `${popConfig.recipientsMode === 'random' ? 'Random' : 'Top'} ${popConfig.recipientsCount ?? 1}`
    : undefined;

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
      // Prepare event data with blockchain integration
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
        category: 'General',
        tags: [],
        // Blockchain integration fields
        walletAddress: walletAddress,
        useTestnet: useTestnet,
      };

      // Call API to create event
      const response = await authenticatedFetch('/api/events/create', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const result = await response.json();

      const createdEventData = {
        title: eventName,
        date: computedStart.toLocaleDateString() || '',
        location: location,
        uniqueId: result.event.slug,
        contractEventId: result.event.contractEventId,
        transactionHash: result.event.transactionHash,
        web3storageMetadataCid: result.event.web3storageMetadataCid,
        web3storageImageCid: result.event.web3storageImageCid,
        contractChainId: result.event.contractChainId,
        contractAddress: result.event.contractAddress,
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
            <EventBanner />
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
                      {!mounted ? (
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
                          <span className='text-sm text-gray-500 font-medium'>
                            Loading...
                          </span>
                        </div>
                      ) : isConnected ? (
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-sm text-green-600 font-medium'>
                            Connected
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {walletAddress?.slice(0, 6)}...
                            {walletAddress?.slice(-4)}
                          </span>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                          <span className='text-sm text-red-600 font-medium'>
                            Not Connected
                          </span>
                        </div>
                      )}
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

                  {/* Current Chain Info */}
                  {mounted && isConnected && (
                    <div className='flex items-center justify-between'>
                      <Label className='text-base'>Current Chain</Label>
                      <span className='text-sm text-muted-foreground'>
                        {chainId === 43113
                          ? 'Avalanche Fuji Testnet'
                          : chainId === 43114
                            ? 'Avalanche Mainnet'
                            : `Chain ID: ${chainId}`}
                      </span>
                    </div>
                  )}
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
              initialRecipientsMode={popConfig?.recipientsMode}
              initialRecipientsCount={popConfig?.recipientsCount}
              initialDeliveryTime={popConfig?.deliveryTime}
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
