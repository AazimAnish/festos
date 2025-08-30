'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { useTickets } from '@/shared/hooks/use-tickets';
import { useWallet } from '@/shared/hooks/use-wallet';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Wallet,
} from 'lucide-react';

interface TicketListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketListingDialog({
  open,
  onOpenChange,
}: TicketListingDialogProps) {
  const { isConnected } = useWallet();
  const { getTransferableTickets, listTicket, isLoading } = useTickets();

  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [listingPrice, setListingPrice] = useState<string>('');
  const [listingDuration, setListingDuration] = useState<number>(7);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(false);
  const [autoAcceptPrice, setAutoAcceptPrice] = useState<string>('');
  const [step, setStep] = useState<'select' | 'configure' | 'review'>('select');

  const transferableTickets = getTransferableTickets();

  const handleTicketSelect = useCallback(
    (ticketId: string) => {
      setSelectedTicketId(ticketId);
      const ticket = transferableTickets.find(t => t.id === ticketId);
      if (ticket) {
        setListingPrice(ticket.originalPrice);
        setAutoAcceptPrice(ticket.originalPrice);
      }
    },
    [transferableTickets]
  );

  const handleNext = useCallback(() => {
    if (step === 'select' && selectedTicketId) {
      setStep('configure');
    } else if (step === 'configure' && listingPrice) {
      setStep('review');
    }
  }, [step, selectedTicketId, listingPrice]);

  const handleBack = useCallback(() => {
    if (step === 'configure') {
      setStep('select');
    } else if (step === 'review') {
      setStep('configure');
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!selectedTicketId || !listingPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await listTicket(
        selectedTicketId,
        listingPrice,
        listingDuration,
        autoAcceptEnabled ? autoAcceptPrice : undefined
      );

      toast.success('Ticket listed successfully!');
      onOpenChange(false);

      // Reset form
      setSelectedTicketId('');
      setListingPrice('');
      setListingDuration(7);
      setAutoAcceptEnabled(false);
      setAutoAcceptPrice('');
      setStep('select');
    } catch (error) {
      toast.error('Failed to list ticket. Please try again.');
      console.error('Error listing ticket:', error);
    }
  }, [
    selectedTicketId,
    listingPrice,
    listingDuration,
    autoAcceptEnabled,
    autoAcceptPrice,
    listTicket,
    onOpenChange,
  ]);

  const selectedTicket = transferableTickets.find(
    t => t.id === selectedTicketId
  );
  const platformFee = listingPrice
    ? (parseFloat(listingPrice) * 0.025).toFixed(3)
    : '0';
  const netAmount = listingPrice
    ? (parseFloat(listingPrice) - parseFloat(platformFee)).toFixed(3)
    : '0';

  if (!isConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Connect Wallet Required</DialogTitle>
          </DialogHeader>
          <div className='text-center py-8 space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center'>
              <Wallet className='w-8 h-8 text-muted-foreground' />
            </div>
            <div>
              <h3 className='font-primary text-lg font-semibold mb-2'>
                Wallet Connection Required
              </h3>
              <p className='text-muted-foreground'>
                Please connect your wallet to list tickets for sale.
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Tag className='w-5 h-5' />
            List Your Ticket for Sale
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className='flex items-center justify-between mb-6'>
          {[
            { key: 'select', label: 'Select Ticket', icon: CheckCircle },
            { key: 'configure', label: 'Configure Listing', icon: Tag },
            { key: 'review', label: 'Review & Confirm', icon: TrendingUp },
          ].map((stepInfo, index) => {
            const Icon = stepInfo.icon;
            const isActive = step === stepInfo.key;
            const isCompleted =
              ['configure', 'review'].includes(step) && index === 0;

            return (
              <div key={stepInfo.key} className='flex items-center'>
                <div
                  className={`flex items-center gap-2 ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isCompleted
                          ? 'bg-success text-success-foreground border-success'
                          : 'bg-muted border-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className='w-4 h-4' />
                    ) : (
                      <Icon className='w-4 h-4' />
                    )}
                  </div>
                  <span className='hidden sm:inline text-sm font-medium'>
                    {stepInfo.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-success' : 'bg-muted'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {step === 'select' && (
          <div className='space-y-6'>
            <div>
              <h3 className='font-primary text-lg font-semibold mb-3'>
                Select a Ticket to List
              </h3>
              <p className='text-muted-foreground mb-4'>
                Choose a transferable ticket from your collection to list for
                sale.
              </p>
            </div>

            {transferableTickets.length === 0 ? (
              <div className='text-center py-8 space-y-4'>
                <div className='w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center'>
                  <AlertCircle className='w-8 h-8 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='font-primary text-lg font-semibold mb-2'>
                    No Transferable Tickets
                  </h3>
                  <p className='text-muted-foreground'>
                    You don&apos;t have any tickets that can be listed for sale.
                  </p>
                </div>
              </div>
            ) : (
              <div className='grid gap-4'>
                {transferableTickets.map(ticket => (
                  <Card
                    key={ticket.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTicketId === ticket.id
                        ? 'ring-2 ring-primary border-primary/30 bg-primary/5'
                        : 'hover:border-border/70'
                    }`}
                    onClick={() => handleTicketSelect(ticket.id)}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='relative w-16 h-16 rounded-lg overflow-hidden'>
                          <Image
                            src={ticket.eventImage}
                            alt={ticket.eventName}
                            fill
                            className='object-cover'
                          />
                          {selectedTicketId === ticket.id && (
                            <div className='absolute inset-0 bg-primary/20 flex items-center justify-center'>
                              <CheckCircle className='w-6 h-6 text-primary-foreground' />
                            </div>
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <h4 className='font-primary font-semibold text-foreground truncate'>
                            {ticket.eventName}
                          </h4>
                          <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-4 h-4' />
                              {new Date(ticket.eventDate).toLocaleDateString()}
                            </div>
                            <div className='flex items-center gap-1'>
                              <MapPin className='w-4 h-4' />
                              {ticket.eventLocation}
                            </div>
                          </div>
                          <div className='flex items-center gap-2 mt-2'>
                            <Badge variant='outline'>{ticket.ticketType}</Badge>
                            <Badge variant='secondary' className='text-xs'>
                              Original: {ticket.originalPrice}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'configure' && selectedTicket && (
          <div className='space-y-6'>
            <div>
              <h3 className='font-primary text-lg font-semibold mb-3'>
                Configure Your Listing
              </h3>
              <p className='text-muted-foreground'>
                Set your listing price and duration to maximize your chances of
                selling.
              </p>
            </div>

            {/* Selected Ticket Summary */}
            <Card className='bg-muted/20 border-primary/20'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='relative w-16 h-16 rounded-lg overflow-hidden'>
                    <Image
                      src={selectedTicket.eventImage}
                      alt={selectedTicket.eventName}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-primary font-semibold'>
                      {selectedTicket.eventName}
                    </h4>
                    <div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      {new Date(selectedTicket.eventDate).toLocaleDateString()}
                      <Badge variant='outline' className='ml-2'>
                        {selectedTicket.ticketType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing Price */}
            <div className='space-y-3'>
                              <Label htmlFor='price'>Listing Price (AVAX)</Label>
              <div className='flex items-center gap-3'>
                <Input
                  id='price'
                  type='number'
                  value={listingPrice}
                  onChange={e => setListingPrice(e.target.value)}
                  min='0'
                  step='0.01'
                  className='w-32'
                  placeholder='0.00'
                />
                <span className='text-sm text-muted-foreground'>
                  Original price: {selectedTicket.originalPrice}
                </span>
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Info className='w-4 h-4' />
                <span>
                  {parseFloat(listingPrice || '0') >
                  parseFloat(selectedTicket.originalPrice)
                    ? 'You&apos;re selling above original price'
                    : 'You&apos;re selling below original price'}
                </span>
              </div>
            </div>

            {/* Listing Duration */}
            <div className='space-y-3'>
              <Label>Listing Duration</Label>
              <RadioGroup
                value={listingDuration.toString()}
                onValueChange={value => setListingDuration(parseInt(value))}
                className='grid grid-cols-2 gap-3'
              >
                {[
                  { value: 3, label: '3 Days', description: 'Quick sale' },
                  { value: 7, label: '7 Days', description: 'Recommended' },
                  { value: 14, label: '14 Days', description: 'More exposure' },
                  { value: 30, label: '30 Days', description: 'Maximum time' },
                ].map(option => (
                  <div
                    key={option.value}
                    className='flex items-center space-x-2'
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`duration-${option.value}`}
                    />
                    <Label
                      htmlFor={`duration-${option.value}`}
                      className='flex-1 cursor-pointer'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='font-medium'>{option.label}</span>
                        <span className='text-xs text-muted-foreground'>
                          {option.description}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Auto-accept Offers */}
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='auto-accept'
                  checked={autoAcceptEnabled}
                  onCheckedChange={setAutoAcceptEnabled}
                />
                <Label htmlFor='auto-accept'>
                  Auto-accept offers within 5% of listing price
                </Label>
              </div>

              {autoAcceptEnabled && (
                <div className='space-y-2 pl-6'>
                  <Label htmlFor='auto-accept-price'>
                    Auto-accept price (AVAX)
                  </Label>
                  <Input
                    id='auto-accept-price'
                    type='number'
                    value={autoAcceptPrice}
                    onChange={e => setAutoAcceptPrice(e.target.value)}
                    min='0'
                    step='0.01'
                    className='w-32'
                    placeholder='0.00'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Offers at or above this price will be automatically accepted
                  </p>
                </div>
              )}
            </div>

            {/* Fee Breakdown */}
            <Card className='bg-muted/10 border-border/50'>
              <CardContent className='p-4 space-y-3'>
                <h4 className='font-primary font-medium'>Fee Breakdown</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>
                      Platform Fee (2.5%)
                    </span>
                    <span>{platformFee} AVAX</span>
                  </div>
                  <div className='flex items-center justify-between font-medium'>
                    <span>You&apos;ll Receive</span>
                    <span className='text-success'>{netAmount} AVAX</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'review' && selectedTicket && (
          <div className='space-y-6'>
            <div>
              <h3 className='font-primary text-lg font-semibold mb-3'>
                Review Your Listing
              </h3>
              <p className='text-muted-foreground'>
                Please review your listing details before confirming.
              </p>
            </div>

            {/* Listing Summary */}
            <Card className='bg-muted/20 border-primary/20'>
              <CardContent className='p-6 space-y-4'>
                <div className='flex items-center gap-4'>
                  <div className='relative w-20 h-20 rounded-lg overflow-hidden'>
                    <Image
                      src={selectedTicket.eventImage}
                      alt={selectedTicket.eventName}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-primary text-lg font-semibold'>
                      {selectedTicket.eventName}
                    </h4>
                    <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        {new Date(
                          selectedTicket.eventDate
                        ).toLocaleDateString()}
                      </div>
                      <div className='flex items-center gap-1'>
                        <MapPin className='w-4 h-4' />
                        {selectedTicket.eventLocation}
                      </div>
                    </div>
                    <Badge variant='outline' className='mt-2'>
                      {selectedTicket.ticketType}
                    </Badge>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 pt-4 border-t border-border/50'>
                  <div>
                    <span className='text-sm text-muted-foreground'>
                      Listing Price
                    </span>
                    <div className='font-primary text-xl font-bold'>
                      {listingPrice} AVAX
                    </div>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>
                      Duration
                    </span>
                    <div className='font-medium'>{listingDuration} days</div>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>
                      Platform Fee
                    </span>
                    <div className='font-medium'>{platformFee} AVAX</div>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>
                      You&apos;ll Receive
                    </span>
                    <div className='font-medium text-success'>
                      {netAmount} AVAX
                    </div>
                  </div>
                </div>

                {autoAcceptEnabled && (
                  <div className='pt-4 border-t border-border/50'>
                    <div className='flex items-center gap-2 text-sm'>
                      <CheckCircle className='w-4 h-4 text-success' />
                      <span>Auto-accept enabled at {autoAcceptPrice} AVAX</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className='bg-blue-50/50 border-blue-200/50'>
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <Info className='w-5 h-5 text-blue-600 mt-0.5' />
                  <div className='space-y-2'>
                    <h4 className='font-medium text-blue-900'>
                      Important Information
                    </h4>
                    <ul className='text-sm text-blue-800 space-y-1'>
                      <li>
                        • Your ticket will be transferred to escrow until sold
                      </li>
                      <li>
                        • You can cancel the listing anytime before it sells
                      </li>
                      <li>• Platform fees are deducted from the sale price</li>
                      <li>
                        • Payment is processed securely through smart contracts
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex items-center justify-between pt-6 border-t border-border/50'>
          <Button
            variant='outline'
            onClick={step === 'select' ? () => onOpenChange(false) : handleBack}
            disabled={isLoading}
          >
            {step === 'select' ? 'Cancel' : 'Back'}
          </Button>

          <div className='flex items-center gap-3'>
            {step !== 'review' && (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 'select' && !selectedTicketId) ||
                  (step === 'configure' && !listingPrice) ||
                  isLoading
                }
              >
                Continue
              </Button>
            )}

            {step === 'review' && (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className='gap-2'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Creating Listing...
                  </>
                ) : (
                  <>
                    <Tag className='w-4 h-4' />
                    Create Listing
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
