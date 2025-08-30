'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { usePurchaseTicket } from '@/shared/hooks/use-ticket-purchase';
import { toast } from 'sonner';
import { Loader2, Ticket, Wallet } from 'lucide-react';

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  ticketPrice: string;
  attendeeName: string;
  attendeeEmail: string;
}

export function TicketPurchaseModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  ticketPrice,
  attendeeName,
  attendeeEmail,
}: TicketPurchaseModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const purchaseTicket = usePurchaseTicket();

  const isFreeEvent = parseFloat(ticketPrice) === 0;
  const priceDisplay = isFreeEvent ? 'FREE' : `${ticketPrice} AVAX`;

  const handlePurchase = async () => {
    setIsConfirming(true);
    
    try {
      await purchaseTicket.mutateAsync({
        eventId,
        attendeeName,
        attendeeEmail,
      });
      
      onClose();
      toast.success('🎉 Ticket purchased successfully!', {
        description: `You now have a ticket for ${eventTitle}`,
      });
    } catch (error) {
      console.error('Purchase failed:', error);
      // Error handling is done in the hook
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Purchase Ticket
          </DialogTitle>
          <DialogDescription>
            Review your ticket purchase details before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{eventTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Attendee:</span>
                <span className="text-sm font-medium">{attendeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{attendeeEmail}</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ticket Price:</span>
                <span className="text-lg font-bold text-green-600">{priceDisplay}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gas Fee:</span>
                <span className="text-sm font-medium">Calculated by wallet</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Cost:</span>
                  <span className="text-lg font-bold">
                    {isFreeEvent ? 'Gas fee only' : `${ticketPrice} AVAX + gas fee`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Wallet className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">Important Notes:</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Your wallet will calculate the gas fee automatically</li>
                    <li>• You'll need to approve the transaction in your wallet</li>
                    <li>• Make sure you have enough AVAX for the total cost</li>
                    {isFreeEvent && (
                      <li>• Free events only require gas fees for the transaction</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase} 
            disabled={isConfirming}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Ticket className="mr-2 h-4 w-4" />
                Purchase Ticket
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

